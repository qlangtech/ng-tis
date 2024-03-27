/**
 *   Licensed to the Apache Software Foundation (ASF) under one
 *   or more contributor license agreements.  See the NOTICE file
 *   distributed with this work for additional information
 *   regarding copyright ownership.  The ASF licenses this file
 *   to you under the Apache License, Version 2.0 (the
 *   "License"); you may not use this file except in compliance
 *   with the License.  You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import {
  AfterViewInit,
  Component,
  ComponentFactoryResolver,
  Input,
  OnInit,
  ViewChild,
  ViewContainerRef
} from "@angular/core";
import {TISService} from "../common/tis.service";
import {AppFormComponent, BasicFormComponent, CurrentCollection} from "../common/basic.form.component";

import {ActivatedRoute, Params} from "@angular/router";

import {MultiViewDAG} from "../common/MultiViewDAG";
import {NzModalService} from "ng-zorro-antd/modal";
import {DataxWorkerAddStep0Component} from "./datax.worker.add.step0.component";
import {DataxWorkerAddStep1Component} from "./datax.worker.add.step1.component";
import {DataxWorkerAddStep2Component} from "./datax.worker.add.step2.component";
import {DataxWorkerAddStep3Component} from "./datax.worker.add.step3.component";
import {DataxWorkerRunningComponent} from "./datax.worker.running.component";
import {Breadcrumb, DataXJobWorkerStatus, DataxWorkerDTO, ProcessMeta} from "../runtime/misc/RCDeployment";
import {DataxWorkerAddStep22Component} from "./datax.worker.add.step2-2.component";
import {isBooleanLiteralLike} from "codelyzer/util/utils";
import {K8SReplicsSpecComponent} from "../common/k8s.replics.spec.component";
import {DataxWorkerAddExistPowerjobClusterComponent} from "./datax.worker.add.exist.powerjob.cluster.component";
import {TisResponseResult} from "../common/tis.plugin";

export enum PowerjobCptType {
  Server = ("powerjob-server"),
  Worker = ("powerjob-worker"),
  JobTpl = ("powerjob-job-tpl"),
  UsingExistCluster = ("powerjob-use-exist-cluster"),
  // applicationAware
  JobTplAppOverwrite = ("powerjob-job-tpl-app-overwrite"),
  FlinkCluster = ("flink-cluster"),
  FlinkKubernetesApplicationCfg = ("flink-kubernetes-application-cfg")
}

@Component({
  template: `
    <tis-page-header [breadcrumb]="breadcrumb.breadcrumb" [title]="breadcrumb.name">
    </tis-page-header>
    <nz-spin nzSize="large" [nzSpinning]="formDisabled" style="min-height: 300px">
      <ng-template #container></ng-template>
    </nz-spin>
    {{ multiViewDAG.lastCpt?.name}}
  `
})
export class DataxWorkerComponent extends AppFormComponent implements AfterViewInit, OnInit {
  @ViewChild('container', {read: ViewContainerRef, static: true}) containerRef: ViewContainerRef;

  multiViewDAG: MultiViewDAG;
  processMeta: ProcessMeta;
  breadcrumb: Breadcrumb;

  constructor(tisService: TISService, route: ActivatedRoute, modalService: NzModalService
    , private _componentFactoryResolver: ComponentFactoryResolver) {
    super(tisService, route, modalService);
  }

  protected initialize(app: CurrentCollection): void {
  }

  ngAfterViewInit() {
  }


  ngOnInit(): void {
    this.processMeta = this.route.snapshot.data["processMeta"];

    let breadGetter = this.processMeta.breadcrumbGetter;
    if (breadGetter) {
      this.breadcrumb = breadGetter(this.route.snapshot.params);
    } else {
      this.breadcrumb = {
        "breadcrumb": [],
        "name": this.processMeta.pageHeader
      }
    }

    // 配置步骤前后跳转状态机
    let configFST: Map<any, { next: any, pre: any }> = new Map();
    configFST.set(DataxWorkerAddStep0Component, {next: DataxWorkerAddStep1Component, pre: null});
    configFST.set(DataxWorkerAddExistPowerjobClusterComponent, {
      next: DataxWorkerAddStep22Component,
      pre: DataxWorkerAddStep0Component
    });
    if (this.processMeta.supportK8SReplicsSpecSetter) {
      configFST.set(DataxWorkerAddStep1Component, {
        next: DataxWorkerAddStep2Component,
        pre: DataxWorkerAddStep0Component
      });
      configFST.set(DataxWorkerAddStep2Component, {
        next: DataxWorkerAddStep22Component,
        pre: DataxWorkerAddStep1Component
      });
      configFST.set(DataxWorkerAddStep22Component, {
        next: DataxWorkerAddStep3Component,
        pre: DataxWorkerAddStep2Component
      });
      configFST.set(DataxWorkerAddStep3Component, {
        next: DataxWorkerRunningComponent,
        pre: DataxWorkerAddStep2Component
      });
    } else {
      configFST.set(DataxWorkerAddStep1Component, {
        next: DataxWorkerAddStep3Component,
        pre: DataxWorkerAddStep0Component
      });
      configFST.set(DataxWorkerAddStep3Component, {
        next: DataxWorkerRunningComponent,
        pre: DataxWorkerAddStep1Component
      });
    }

    configFST.set(DataxWorkerRunningComponent, {
      next: DataxWorkerAddStep0Component,
      pre: DataxWorkerAddStep3Component
    });

    this.multiViewDAG = new MultiViewDAG(configFST, this._componentFactoryResolver, this.containerRef);

    let next = (params) => {
       console.log(params);
      DataxWorkerComponent.getJobWorkerMeta(this, params, this.processMeta).then((dataXWorkerStatus) => {
        if (dataXWorkerStatus.k8sReplicationControllerCreated) {
          this.multiViewDAG.loadComponent(DataxWorkerRunningComponent, dataXWorkerStatus);
        } else {
          this.multiViewDAG.loadComponent(DataxWorkerAddStep0Component, Object.assign(new DataxWorkerDTO(), {processMeta: this.processMeta}));

          // this.multiViewDAG.loadComponent(DataxWorkerAddStep3Component
          //   , Object.assign(new DataxWorkerDTO(), {processMeta: this.processMeta,powderJobServerRCSpec:K8SReplicsSpecComponent.createInitRcSpec()}));

        }
      })
    };

    // this.route.queryParams.subscribe((query) => {
    //   // 当实例删除后为了页面刷新一下，加了一个update参数
    //   if (query['update']) {
    //     next.apply(this.route.params);
    //   }
    // });
    this.route.params.subscribe(next);


    // this.httpPost('/coredefine/corenodemanage.ajax'
    //     , `action=datax_action&emethod=get_job_worker_meta&targetName=${this.processMeta.targetName}`)
    //     .then((r) => {
    //         if (r.success) {
    //             let dataXWorkerStatus: DataXJobWorkerStatus = Object.assign(new DataXJobWorkerStatus(), r.bizresult, {processMeta: this.processMeta});
    //             if (dataXWorkerStatus.k8sReplicationControllerCreated) {
    //                 this.multiViewDAG.loadComponent(DataxWorkerRunningComponent, dataXWorkerStatus);
    //             } else {
    //                // this.multiViewDAG.loadComponent(DataxWorkerAddStep0Component, Object.assign(new DataxWorkerDTO(), {processMeta: this.processMeta}));
    //
    //                    this.multiViewDAG.loadComponent(DataxWorkerAddStep3Component, Object.assign(new DataxWorkerDTO(), {processMeta: this.processMeta,powderJobServerRCSpec:K8SReplicsSpecComponent.createInitRcSpec()}));
    //
    //             }
    //         }
    //     });
  }

  public static getJobWorkerMeta(cpt: BasicFormComponent, params: Params, processMeta: ProcessMeta): Promise<DataXJobWorkerStatus> {
    return cpt.httpPost('/coredefine/corenodemanage.ajax'
      , `action=datax_action&emethod=${processMeta.init_get_job_worker_meta}&targetName=${processMeta.targetNameGetter(params)}`)
      .then((r) => {
        if (r.success) {
          let dataXWorkerStatus: DataXJobWorkerStatus = Object.assign(new DataXJobWorkerStatus(), r.bizresult, {processMeta: processMeta});
          return dataXWorkerStatus
        }
      });
  }
}







