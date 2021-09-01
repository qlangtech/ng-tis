/**
 * Copyright (c) 2020 QingLang, Inc. <baisui@qlangtech.com>
 * <p>
 *   This program is free software: you can use, redistribute, and/or modify
 *   it under the terms of the GNU Affero General Public License, version 3
 *   or later ("AGPL"), as published by the Free Software Foundation.
 * <p>
 *  This program is distributed in the hope that it will be useful, but WITHOUT
 *  ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 *   FITNESS FOR A PARTICULAR PURPOSE.
 * <p>
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import {AfterViewInit, Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef} from "@angular/core";
import {TISService} from "../common/tis.service";
import {AppFormComponent, CurrentCollection} from "../common/basic.form.component";

import {ActivatedRoute} from "@angular/router";

import {MultiViewDAG} from "../common/MultiViewDAG";
import {NzModalService} from "ng-zorro-antd";
import {DataxWorkerAddStep0Component} from "./datax.worker.add.step0.component";
import {DataxWorkerAddStep1Component} from "./datax.worker.add.step1.component";
import {DataxWorkerAddStep2Component} from "./datax.worker.add.step2.component";
import {DataxWorkerAddStep3Component} from "./datax.worker.add.step3.component";
import {DataxWorkerRunningComponent} from "./datax.worker.running.component";
import {DataXJobWorkerStatus, DataxWorkerDTO} from "../runtime/misc/RCDeployment";

@Component({
  template: `
      <tis-page-header title="DataX分布式执行器">
      </tis-page-header>
      <nz-spin nzSize="large" [nzSpinning]="formDisabled" style="min-height: 300px">
          <ng-template #container></ng-template>
      </nz-spin>`
})
export class DataxWorkerComponent extends AppFormComponent implements AfterViewInit, OnInit {
  @ViewChild('container', {read: ViewContainerRef, static: true}) containerRef: ViewContainerRef;

  private multiViewDAG: MultiViewDAG;

  constructor(tisService: TISService, route: ActivatedRoute, modalService: NzModalService
    , private _componentFactoryResolver: ComponentFactoryResolver) {
    super(tisService, route, modalService);
  }

  protected initialize(app: CurrentCollection): void {
  }

  ngAfterViewInit() {
  }


  ngOnInit(): void {
    // 配置步骤前后跳转状态机
    let configFST: Map<any, { next: any, pre: any }> = new Map();
    configFST.set(DataxWorkerAddStep0Component, {next: DataxWorkerAddStep1Component, pre: null});
    configFST.set(DataxWorkerAddStep1Component, {next: DataxWorkerAddStep2Component, pre: DataxWorkerAddStep0Component});
    configFST.set(DataxWorkerAddStep2Component, {next: DataxWorkerAddStep3Component, pre: DataxWorkerAddStep1Component});
    configFST.set(DataxWorkerAddStep3Component, {next: DataxWorkerRunningComponent, pre: DataxWorkerAddStep2Component});
    configFST.set(DataxWorkerRunningComponent, {next: DataxWorkerAddStep0Component, pre: DataxWorkerAddStep3Component});
    // configFST.set(DataxWorkerAddStep0Component, {next: DataxAddStep2Component, pre: null});
    // console.log(this.containerRef);
    this.multiViewDAG = new MultiViewDAG(configFST, this._componentFactoryResolver, this.containerRef);
    this.httpPost('/coredefine/corenodemanage.ajax'
      , `action=datax_action&emethod=get_datax_worker_meta`)
      .then((r) => {
        if (r.success) {
          let dataXWorkerStatus: DataXJobWorkerStatus = Object.assign(new DataXJobWorkerStatus(), r.bizresult);
          if (dataXWorkerStatus.k8sReplicationControllerCreated) {
            this.multiViewDAG.loadComponent(DataxWorkerRunningComponent, dataXWorkerStatus);
          } else {
            this.multiViewDAG.loadComponent(DataxWorkerAddStep0Component, new DataxWorkerDTO());
          }
        }
      });

  }
}



