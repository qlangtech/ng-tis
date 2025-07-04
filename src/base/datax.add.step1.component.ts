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

import {Component, EventEmitter, OnInit, Output} from "@angular/core";
import {TISService} from "../common/tis.service";
import {NzModalService} from "ng-zorro-antd/modal";
import {Descriptor, HeteroList, Item, PluginSaveResponse, PluginType, SavePluginEvent} from "../common/tis.plugin";
import {PluginsComponent} from "../common/plugins.component";
import {BasicDataXAddComponent} from "./datax.add.base";
import {ActivatedRoute, Router} from "@angular/router";
import {ExecModel} from "./datax.add.step7.confirm.component";

// 文档：https://angular.io/docs/ts/latest/guide/forms.html
@Component({
  selector: 'addapp-form',
  template: `
    <tis-steps [type]="dto.processModel" [step]="0"></tis-steps>
    <nz-spin [nzSpinning]="this.formDisabled">
      <tis-steps-tools-bar [title]="'基本信息'" (cancel)="cancel()"
                           (goOn)="createIndexStep1Next()" [formDisabled]="formDisabled">
      </tis-steps-tools-bar>
      <nz-alert nzType="info" [nzMessage]="InformationalNotes" ></nz-alert>
      <ng-template #InformationalNotes>
        <ng-container [ngSwitch]="dto.inWorkflowProcess">
          <ng-container *ngSwitchCase="true">
            <blibli videoId="BV1du411W7Ns">数据流分析（EMR）示例</blibli> &nbsp;
            <a href="https://tis.pub/docs/example/dataflow/" target="_blank"><span nz-icon nzType="book" nzTheme="outline"></span>示例说明</a>
          </ng-container>
          <ng-container *ngSwitchCase="false">
            <blibli videoId="BV1eh4y1o7yQ">构建MySQL到Doris批量同步通道</blibli>
            <blibli videoId="BV1nX4y1h7SW">构建MySQ实时同步Doris示例,实现数据毫秒级同步</blibli>
          </ng-container>
        </ng-container>
      </ng-template>


      <div style="clear: both;width: 80%;margin: 0 auto;">

        <tis-plugins [disableManipulate]="true" [formControlSpan]="20" [pluginMeta]="[pluginCategory]"
                     (afterSave)="afterSaveReader($event)" [savePlugin]="savePlugin" [showSaveButton]="false"
                     [shallInitializePluginItems]="false" [useCollapsePanel]="false" [_heteroList]="hlist" #pluginComponent></tis-plugins>


      </div>
    </nz-spin>
    <!-- Content here -->
  `
  , styles: [
    `
    `
  ]
})
export class DataxAddStep1Component extends BasicDataXAddComponent implements OnInit {
  errorItem: Item = Item.create([]);
  // model = new AppDesc();

  @Output() nextStep = new EventEmitter<any>();
  savePlugin = new EventEmitter<SavePluginEvent>();
  hlist: HeteroList[] = [];

  pluginCategory: PluginType;


  constructor(tisService: TISService, modalService: NzModalService, r: Router, route: ActivatedRoute) {
    super(tisService, modalService, r, route);
  }

  ngOnInit(): void {
    super.ngOnInit();
    let dataxNameParam = `&processModel=${this.dto.processModel}`;
    if (this.dto.dataxPipeName) {
      dataxNameParam += `&dataxName=${this.dto.dataxPipeName}`;
    }
 //console.log(dataxNameParam);
    //processModel

    this.pluginCategory = {name: 'appSource', require: true, extraParam: `update_${this.dto.execModel === ExecModel.Reader},dataxName_${this.dto.dataxPipeName}`  }

    this.httpPost('/coredefine/corenodemanage.ajax'
      , 'action=datax_action&emethod=datax_processor_desc' + dataxNameParam)
      .then((r) => {
        if (r.success) {
          let hlist: HeteroList = PluginsComponent.wrapperHeteroList(r.bizresult, this.pluginCategory);
          if (hlist.items.length < 1) {
            Descriptor.addNewItem(hlist, hlist.descriptorList[0], false, (_, p) => p);
          }
         // console.log(hlist);
          this.hlist = [hlist];
        }
      });
  }

  // 执行下一步
  public createIndexStep1Next(): void {
    this.formDisabled = true;
    let e = new SavePluginEvent();
   // e.
    e.notShowBizMsg = true;
    this.savePlugin.emit(e);
  }

  afterSaveReader(event: PluginSaveResponse) {
    this.formDisabled = false;
    if (event.saveSuccess) {

      if (event.hasBiz()) {
        let pluginIdentityNames: Array<string> = event.biz();
        for (let i = 0; ; i++) {
          this.dto.dataxPipeName = pluginIdentityNames[i];
          break;
        }
        if (!this.dto.dataxPipeName) {
          throw new Error("have not set dataxPipeName properly");
        }
        // if(!this.tisService.currentApp){
        //   this.tisService.currentApp =
        // }
        this.nextStep.next(this.dto);
      } else {
        throw new Error("have not set biz result");
      }

    }
  }
}
