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

import {AfterContentInit, AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {TISService} from "../common/tis.service";
import {AppFormComponent, CurrentCollection} from "../common/basic.form.component";

import {ActivatedRoute} from "@angular/router";
import {FormBuilder} from "@angular/forms";
import {NzModalService} from "ng-zorro-antd/modal";
import {IndexIncrStatus} from "./misc/RCDeployment";
import {SavePluginEvent} from "../common/tis.plugin";
import {EditorConfiguration} from "codemirror";
import {NzStatusType} from "ng-zorro-antd/steps/steps.component";
import {NzDrawerService} from "ng-zorro-antd/drawer";
import {openWaittingProcessComponent} from "../common/launch.waitting.process.component";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {CreateLaunchingTarget} from "../base/datax.worker.add.step3.component";


@Component({
  template: `
    <tis-steps type="createIncr" [step]="2"></tis-steps>
    <tis-page-header [showBreadcrumb]="false" [result]="result">
      <tis-header-tool>
        <button nz-button nzType="default" (click)="createIndexStepPre()"><i nz-icon nzType="backward"
                                                                             nzTheme="outline"></i>上一步
        </button>&nbsp;
        <button nz-button nzType="primary" (click)="createIndexStepNext()" [nzLoading]="formDisabled"><i nz-icon
                                                                                                         nzType="cloud-upload"
                                                                                                         nzTheme="outline"></i>部署
        </button>&nbsp;
        <button nz-button nzType="default" (click)="cancelStep()">取消</button>
      </tis-header-tool>
    </tis-page-header>

    <!--      <tis-plugins [savePlugin]="savePlugin" [plugins]="this.plugins" (afterSave)="buildStep2ParamsSetComponentAjax($event)" #buildStep1ParamsSetComponent></tis-plugins>-->
    <p>
      <nz-alert nzType="warning" [nzDescription]="unableToUseK8SController" nzShowIcon></nz-alert>
      <ng-template #unableToUseK8SController>
        目前,以下生成的Flink Stream Code 由系统自动生成，不支持自定义内容
      </ng-template>
    </p>
    <div style="height: 800px">
      <tis-codemirror name="schemaContent" [(ngModel)]="dto.incrScriptMainFileContent"
                      [config]="codeMirrorCfg"></tis-codemirror>
    </div>
  `,
  styles: [`

    .resource-spec {
      display: flex;
    }

    .resource-spec div {
      flex: 1;
      margin-right: 20px;
    }

    .input-number {
      width: 100%;
    }

    .spec-form {
      max-width: 800px
    }

    .ant-input-group {
      width: 200px
    }

    label {
      width: 5em;
    }
  `]
})
export class IncrBuildStep2SetSinkComponent extends AppFormComponent implements AfterContentInit, AfterViewInit, OnInit {
  @Output() nextStep = new EventEmitter<any>();
  @Output() preStep = new EventEmitter<any>();
  @Input() dto: IndexIncrStatus;
  // specForm: FormGroup;
  savePlugin = new EventEmitter<SavePluginEvent>();
  plugins = [{name: 'sinkFactory', require: true}];

  constructor(tisService: TISService, route: ActivatedRoute, notification: NzNotificationService
    , modalService: NzModalService, private fb: FormBuilder, private drawerService: NzDrawerService) {
    super(tisService, route, modalService, notification);
  }

  protected initialize(app: CurrentCollection): void {

  }

  get codeMirrorCfg(): EditorConfiguration {
    return {
      mode: "text/x-scala",
      lineNumbers: true
    };
  }

  ngOnInit(): void {
    super.ngOnInit();
    //  console.log(this.dto);
  }

  ngAfterViewInit(): void {
  }

  ngAfterContentInit(): void {
  }

  cancelStep() {

  }


  public createIndexStepPre() {
    this.preStep.emit(this.dto);
  }

  // buildStep2ParamsSetComponentAjax(event: PluginSaveResponse) {
  //
  // }


  createIndexStepNext() {

    let sseUrl = '/coredefine/corenodemanage.ajax?resulthandler=exec_null&event_submit_do_deploy_incr_sync_channal=y&action=core_action&appname=' + this.tisService.currentApp.appName;
    // 保存MQ消息
    // this.jsonPost(url, {}).then((r) => {
    //   if (r.success) {
    //     this.nextStep.emit(this.dto);
    //   }
    // });
    ///////////////////////
    let subject = this.tisService.createEventSource(null, sseUrl);
    const drawerRef = openWaittingProcessComponent(this.drawerService, subject
      , new CreateLaunchingTarget("core_action", "re_deploy_incr_sync_channal",`appname=${this.tisService.currentApp.appName}`));// this.drawerService.create<LaunchK8SClusterWaittingProcessComponent, {}, {}>({
    //   nzWidth: "60%",
    //   nzHeight: "100%",
    //   nzPlacement: "right",
    //   nzContent: LaunchK8SClusterWaittingProcessComponent,
    //   nzContentParams: {"obserable": subject},
    //   nzClosable: false,
    //   nzMaskClosable: false
    // });
    // let cpt: LaunchK8SClusterWaittingProcessComponent = drawerRef.getContentComponent();
    // console.log(drawerRef);
    // cpt.launchTarget =;
    drawerRef.afterClose.subscribe((status: NzStatusType) => {
      subject.close();
      if (status === 'finish') {
        // this.successNotify("已经成功在K8S集群中启动" + this.dto.processMeta.pageHeader);

        this.nextStep.emit(this.dto);

        // let dataXWorkerStatus: DataXJobWorkerStatus
        //   = Object.assign(new DataXJobWorkerStatus(), r.bizresult, {'processMeta': this.dto.processMeta});
        //  this.dto.processMeta.successCreateNext(this);
        // DataxWorkerComponent.getJobWorkerMeta(this, null, this.dto.processMeta)
        //   .then((dataXWorkerStatus) => {
        //     this.nextStep.emit(dataXWorkerStatus);
        //   });


      }
    })
  }
}
