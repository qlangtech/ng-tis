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

import {AfterViewInit, Component, EventEmitter, OnInit, ViewChild} from "@angular/core";
import {TISService} from "../common/tis.service";
import {BasicFormComponent, CurrentCollection} from "../common/basic.form.component";
import {AppDesc} from "./addapp-pojo";
import {NzModalService} from "ng-zorro-antd/modal";
import {
    DATAX_PREFIX_DB,
    Descriptor,
    HeteroList,
    Item,
    PluginSaveResponse,
    PluginType,
    SavePluginEvent
} from "../common/tis.plugin";
import {PluginsComponent} from "../common/plugins.component";
import {DataxDTO} from "./datax.add.component";
import {IntendDirect} from "../common/MultiViewDAG";
import {DataxAddStep5Component} from "./datax.add.step5.component";
import {BasicDataXAddComponent} from "./datax.add.base";
import {ActivatedRoute, Router} from "@angular/router";
import {PluginExtraProps} from "../runtime/misc/RCDeployment";


// 文档：https://angular.io/docs/ts/latest/guide/forms.html
@Component({
  selector: 'addapp-form',
  // templateUrl: '/runtime/addapp.htm'
  template: `
    <tis-steps *ngIf="dto.headerStepShow" [type]="stepType" [step]="_offsetStep"></tis-steps>
    <!--      <tis-form [fieldsErr]="errorItem">-->
    <!--          <tis-page-header [showBreadcrumb]="false" [result]="result">-->
    <!--              <tis-header-tool>-->
    <!--                  <button nz-button nzType="primary" (click)="createStepNext()">下一步</button>-->
    <!--              </tis-header-tool>-->
    <!--          </tis-page-header>-->
    <!--      </tis-form>-->
    <nz-spin [nzSpinning]="this.formDisabled">
      <tis-steps-tools-bar [formDisabled]="formDisabled" [title]="'Reader '+ this.dto.readerDescriptor.displayName" [goBackBtnShow]="_offsetStep>0"
                           (cancel)="cancel()" (goBack)="goback()" (goOn)="createStepNext()"></tis-steps-tools-bar>
      <tis-plugins (afterSave)="afterSaveReader($event)" [savePlugin]="savePlugin" [showSaveButton]="false"
                   [shallInitializePluginItems]="false" [_heteroList]="hlist" [pluginMeta]="[this.pluginCategory]"
                   #pluginComponent></tis-plugins>
    </nz-spin>
  `
  , styles: [
    `
    `
  ]
})
export class DataxAddStep3Component extends BasicDataXAddComponent implements OnInit, AfterViewInit {
  errorItem: Item = Item.create([]);


  model = new AppDesc();
  @ViewChild('pluginComponent', {static: false}) pluginComponent: PluginsComponent;

  savePlugin = new EventEmitter<SavePluginEvent>();

  // 可选的数据源
  readerDesc: Array<Descriptor> = [];
  writerDesc: Array<Descriptor> = [];

  hlist: HeteroList[] = [];

  pluginCategory: PluginType;

  public static initializeDataXRW(baseForm: BasicFormComponent, rw: "reader" | "writer", dto: DataxDTO): Promise<{ "desc": Descriptor, "item"?: Item }> {

    let desc: Descriptor = (rw === 'reader') ? dto.readerDescriptor : dto.writerDescriptor;

    return baseForm.jsonPost(`/coredefine/corenodemanage.ajax?action=datax_action&emethod=get_${rw}_plugin_info&dataxName=${dto.dataxPipeName}&${DataxDTO.KEY_PROCESS_MODEL}=${dto.processModel}`, desc)
      .then((r) => {
        if (r.success) {
          if (r.bizresult) {

            let d = Descriptor.wrapDescriptors(r.bizresult.desc);
            d.forEach((entry) => {
              desc = entry;
            });

            if (r.bizresult.item) {
              // 只有在更新流程才会进入
              let i: Item = Object.assign(new Item(desc), r.bizresult.item);
              i.wrapItemVals();
              return {"desc": desc, "item": i};
            } else {
              return {"desc": desc};
            }
          }
        }
        return {"desc": desc};
      });
  }

  constructor(tisService: TISService, modalService: NzModalService, r: Router, route: ActivatedRoute) {
    super(tisService, modalService, r, route);
  }


  protected initialize(app: CurrentCollection): void {
    DataxAddStep3Component.initializeDataXRW(this, "reader", this.dto)
      .then((i: { "desc": Descriptor, "item": Item }) => {
        this.hlist = PluginsComponent.pluginDesc(i.desc, this.pluginCategory);
        if (i.item) {
          this.hlist[0].items[0] = i.item;
        }

        this.dto.componentCallback.step3.next(this);
      });
  }

  ngOnInit(): void {
    if (!this.dto) {
      throw new Error("dto can not be null");
    }
    if (!this.dto.readerDescriptor) {
      throw new Error("readerDescriptor can not be null");
    }
    let eprops: PluginExtraProps = this.dto.readerDescriptor.eprops;
    this.pluginCategory = {
      name: 'dataxReader',
      require: true,
      "extraParam": this.dto.tablePojo ? (DATAX_PREFIX_DB + this.dto.tablePojo.dbName) : ('dataxName_' + this.dto.dataxPipeName),
      descFilter: {
        endType: () => eprops.endType,
        localDescFilter: (_) => true
      }
    }
    this.offsetStep(1);
    super.ngOnInit();
  }


  ngAfterViewInit(): void {
  }


  // 执行下一步
  public createStepNext(): void {
    this.formDisabled = true;
    let savePluginEvent = new SavePluginEvent();
    savePluginEvent.notShowBizMsg = true;
    this.savePlugin.emit(savePluginEvent);

    // let dto = new DataxDTO();
    // dto.appform = this.readerDesc;
    // this.jsonPost('/coredefine/corenodemanage.ajax?action=datax_action&emethod=validate_reader_writer'
    //   , this.dto)
    //   .then((r) => {
    //     this.processResult(r);
    //     if (r.success) {
    //       // console.log(dto);
    //       this.nextStep.emit(this.dto);
    //     } else {
    //       this.errorItem = Item.processFieldsErr(r);
    //     }
    //   });
  }

  afterSaveReader(response: PluginSaveResponse) {
    this.formDisabled = false;
    if (!response.saveSuccess) {
      return;
    }
    if (response.hasBiz()) {
      // let selectableTabs = response.biz();
      // let tabs: Map<string /* table */, ISelectedTabMeta> = this.dto.selectableTabs;
      // selectableTabs.forEach(tab => {
      //   tabs.set(tab, {tableName: tab, selectableCols: []});
      // });
    }

    DataxAddStep5Component.rewriteProcessMeta(this, this.dto)
      .then((pmeta) => {
        if (pmeta.readerRDBMS) {
          // console.log(this.dto.processMeta);
          this.nextStep.emit(this.dto);
        } else {
          let next: IntendDirect = {"dto": this.dto, cpt: DataxAddStep5Component};
          this.nextStep.emit(next);
        }
      });


  }

}
