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
import {EditorConfiguration} from "codemirror";
import {MultiViewDAG} from "../common/MultiViewDAG";
import {IncrBuildStep1Component, IncrBuildStep1ExecEngineSelectComponent} from "./incr.build.step1.component";
import {IncrBuildStep3Component} from "./incr.build.step3.component";
import {IncrBuildStep4RunningComponent} from "./incr.build.step4.running.component";
import {NzIconService} from 'ng-zorro-antd/icon';
import {CloseSquareFill} from "@ant-design/icons-angular/icons";
import {NzModalService} from "ng-zorro-antd/modal";
import {IndexIncrStatus} from "./misc/RCDeployment";
import {IncrBuildStep0Component} from "./incr.build.step0.component";
import {IncrBuildStep2SetSinkComponent} from "./incr.build.step2.setSink.components";


@Component({
  template: `
      <nz-spin nzSize="large" [nzSpinning]="formDisabled" style="min-height: 300px">
          <ng-template #container></ng-template>
          {{ multiViewDAG.lastCpt?.name}}
      </nz-spin>`
})
export class IncrBuildComponent extends AppFormComponent implements AfterViewInit, OnInit {

  private _incrScript: string;
  @ViewChild('container', {read: ViewContainerRef, static: true}) containerRef: ViewContainerRef;

   multiViewDAG: MultiViewDAG;
  constructor(tisService: TISService, route: ActivatedRoute, modalService: NzModalService
    , private _componentFactoryResolver: ComponentFactoryResolver, private _iconService: NzIconService) {
    super(tisService, route, modalService);
    _iconService.addIcon(CloseSquareFill);
  }

  protected initialize(app: CurrentCollection): void {
  }

  ngAfterViewInit() {
  }

  ngOnInit(): void {
    // 配置步骤前后跳转状态机
    let configFST: Map<any, { next: any, pre: any }> = new Map();
    configFST.set(IncrBuildStep0Component, {next: IncrBuildStep1ExecEngineSelectComponent, pre: null});
    configFST.set(IncrBuildStep1ExecEngineSelectComponent, {next: IncrBuildStep1Component, pre: IncrBuildStep0Component});
    configFST.set(IncrBuildStep1Component, {next: IncrBuildStep2SetSinkComponent, pre: IncrBuildStep1ExecEngineSelectComponent});
    configFST.set(IncrBuildStep2SetSinkComponent, {next: IncrBuildStep3Component, pre: IncrBuildStep1Component});
    configFST.set(IncrBuildStep3Component, {next: IncrBuildStep4RunningComponent, pre: IncrBuildStep2SetSinkComponent});
    configFST.set(IncrBuildStep4RunningComponent, {next: IncrBuildStep0Component, pre: IncrBuildStep3Component});
    this.multiViewDAG = new MultiViewDAG(configFST, this._componentFactoryResolver, this.containerRef);
    //  this.multiViewDAG.loadComponent(IncrBuildStep1Component, null);
    IndexIncrStatus.getIncrStatusThenEnter(this, (incrStatus) => {
      let k8sRCCreated = incrStatus.k8sReplicationControllerCreated;
      if (k8sRCCreated) {
        // 增量已经在集群中运行，显示增量状态
        this.multiViewDAG.loadComponent(IncrBuildStep4RunningComponent, incrStatus);
      } else {
        // 脚本还未创建
        this.multiViewDAG.loadComponent(IncrBuildStep0Component, null);
      }
      this.incrScript = incrStatus.incrScriptMainFileContent;
    });
  }


  get incrScript(): string {
    return this._incrScript;
  }

  set incrScript(value: string) {
    this._incrScript = value;
  }

}

