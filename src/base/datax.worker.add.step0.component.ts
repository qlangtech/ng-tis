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

import {AfterContentInit, AfterViewChecked, AfterViewInit, Component, ComponentFactoryResolver, EventEmitter, Input, OnInit, Output, ViewChild, ViewContainerRef} from "@angular/core";
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
import {Descriptor, HeteroList, PluginSaveResponse} from "../common/tis.plugin";
import {DataxAddStep3Component} from "./datax.add.step3.component";
import {DataxAddStep4Component} from "./datax.add.step4.component";
import {DataxAddStep5Component} from "./datax.add.step5.component";
import {DataxAddStep6Component} from "./datax.add.step6.maptable.component";
import {DataxAddStep7Component} from "./datax.add.step7.confirm.component";
import {Option} from "./addapp-pojo";
import {DataxDTO} from "./datax.add.component";
import {DataxWorkerDTO} from "./datax.worker.component";

@Component({
  template: `
      <nz-empty style="height: 500px"
              nzNotFoundImage="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
              [nzNotFoundFooter]="footerTpl"
              [nzNotFoundContent]="contentTpl"
      >
          <ng-template #contentTpl>
              <span> 还未创建DataX执行器，创建之后可以将DataX构建任务提交到K8S集群，高效并行执行DataX数据同步任务</span>
          </ng-template>
          <ng-template #footerTpl>
              <button nz-button nzType="primary" (click)="onClick()">创建DataX执行器</button>
          </ng-template>
      </nz-empty>
  `
})
export class DataxWorkerAddStep0Component extends BasicFormComponent implements AfterViewInit, OnInit {

  @Input() dto: DataxWorkerDTO;
  @Output() nextStep = new EventEmitter<any>();

  constructor(tisService: TISService, modalService: NzModalService) {
    super(tisService, modalService);
  }

  protected initialize(app: CurrentCollection): void {
  }

  ngAfterViewInit() {
  }


  ngOnInit(): void {

  }
  onClick() {
    this.nextStep.emit(this.dto);
  }
}

