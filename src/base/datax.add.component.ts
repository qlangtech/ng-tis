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

import {AfterContentInit, AfterViewChecked, AfterViewInit, Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef} from "@angular/core";
import {TISService} from "../service/tis.service";
import {AppFormComponent, BasicFormComponent, CurrentCollection} from "../common/basic.form.component";

import {ActivatedRoute} from "@angular/router";
import {EditorConfiguration} from "codemirror";
import {MultiViewDAG} from "../common/MultiViewDAG";
import {AddAppFlowDirective} from "../base/addapp.directive";

import {NzIconService} from 'ng-zorro-antd/icon';
import {CloseSquareFill} from "@ant-design/icons-angular/icons";
import {NzModalService} from "ng-zorro-antd";
import {IncrBuildStep0Component} from "../runtime/incr.build.step0.component";
import {DataxAddStep1Component} from "./datax.add.step1.component";
import {DataxAddStep2Component} from "./datax.add.step2.component";
import {Descriptor} from "../common/tis.plugin";
import {DataxAddStep3Component} from "./datax.add.step3.component";
import {DataxAddStep4Component} from "./datax.add.step4.component";
import {DataxAddStep5Component} from "./datax.add.step5.component";
import {DataxAddStep6Component} from "./datax.add.step6.maptable.component";
import {DataxAddStep7Component} from "./datax.add.step7.confirm.component";
import {Option} from "./addapp-pojo";

@Component({
  template: `
      <nz-spin nzSize="large" [nzSpinning]="formDisabled" style="min-height: 300px">
          <ng-template #container></ng-template>
      </nz-spin>`
})
export class DataxAddComponent extends AppFormComponent implements AfterViewInit, OnInit {

  private _incrScript: string;
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

    //  let configFST: Map<any, { next: any, pre: any }> = new Map();

    // 配置步骤前后跳转状态机
    let configFST: Map<any, { next: any, pre: any }> = new Map();
    configFST.set(DataxAddStep1Component, {next: DataxAddStep2Component, pre: null});
    configFST.set(DataxAddStep2Component, {next: DataxAddStep3Component, pre: DataxAddStep1Component});
    configFST.set(DataxAddStep3Component, {next: DataxAddStep4Component, pre: DataxAddStep2Component});
    configFST.set(DataxAddStep4Component, {next: DataxAddStep5Component, pre: DataxAddStep3Component});
    configFST.set(DataxAddStep5Component, {next: DataxAddStep6Component, pre: DataxAddStep4Component});
    configFST.set(DataxAddStep6Component, {next: DataxAddStep7Component, pre: DataxAddStep5Component});
    configFST.set(DataxAddStep7Component, {next: null, pre: DataxAddStep6Component});
    // console.log(this.containerRef);
    this.multiViewDAG = new MultiViewDAG(configFST, this._componentFactoryResolver, this.containerRef);
    this.multiViewDAG.loadComponent(DataxAddStep7Component, new DataxDTO());
  }
}

/**
 * 被选中的列
 */
export interface ISelectedCol {
  label: string;
  value: string;
  checked: boolean;
  pk: boolean;
}

export interface ISelectedTabMeta {

  tableName: string,
  selectableCols: Array<ISelectedCol> // r.bizresult
}

class DataxProfile {
  projectName: string;
  recept: string;
  dptId: string;
}

export class DataxDTO {
  dataxPipeName = 'baisuitest';
  profile: DataxProfile = new DataxProfile();
  selectableTabs: Map<string /* table */, ISelectedTabMeta> = new Map();
  readerDescriptor: Descriptor;
  writerDescriptor: Descriptor;
}

