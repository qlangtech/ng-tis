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

import {AfterContentInit, AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild} from "@angular/core";
import {TISService} from "../service/tis.service";
import {BasicFormComponent} from "../common/basic.form.component";
import {AppDesc, ConfirmDTO} from "./addapp-pojo";
import {NzModalService, NzTreeNodeOptions} from "ng-zorro-antd";
import {Descriptor, HeteroList, Item, PluginSaveResponse} from "../common/tis.plugin";
import {PluginsComponent} from "../common/plugins.component";
import {DataxDTO, ISelectedTabMeta} from "./datax.add.component";
import {DatasourceComponent} from "../offline/ds.component";
import {IntendDirect} from "../common/MultiViewDAG";
import {DataxAddStep5Component} from "./datax.add.step5.component";
import {BasicDataXAddComponent} from "./datax.add.base";


// 文档：https://angular.io/docs/ts/latest/guide/forms.html
@Component({
  selector: 'addapp-form',
  // templateUrl: '/runtime/addapp.htm'
  template: `
      <ng-container *ngIf="componentName">{{componentName}}</ng-container>
      <tis-steps type="createDatax" [step]="1"></tis-steps>
      <!--      <tis-form [fieldsErr]="errorItem">-->
      <!--          <tis-page-header [showBreadcrumb]="false" [result]="result">-->
      <!--              <tis-header-tool>-->
      <!--                  <button nz-button nzType="primary" (click)="createStepNext()">下一步</button>-->
      <!--              </tis-header-tool>-->
      <!--          </tis-page-header>-->
      <!--      </tis-form>-->
      <nz-spin [nzSpinning]="this.formDisabled">
          <tis-steps-tools-bar (cancel)="cancel()" (goBack)="goback()" (goOn)="createStepNext()"></tis-steps-tools-bar>
          <tis-plugins (afterSave)="afterSaveReader($event)" [savePlugin]="savePlugin" [showSaveButton]="false"
                       [shallInitializePluginItems]="false" [_heteroList]="hlist" #pluginComponent></tis-plugins>
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

  savePlugin = new EventEmitter<any>();

  // 可选的数据源
  readerDesc: Array<Descriptor> = [];
  writerDesc: Array<Descriptor> = [];

  hlist: HeteroList[] = [];

  constructor(tisService: TISService, modalService: NzModalService) {
    super(tisService, modalService);
  }

  ngOnInit(): void {
    this.jsonPost(`/coredefine/corenodemanage.ajax?action=datax_action&emethod=get_reader_plugin_info&dataxName=${this.dto.dataxPipeName}`
      , this.dto.readerDescriptor)
      .then((r) => {
        // this.processResult(r);
        if (r.success) {
          this.hlist = DatasourceComponent.pluginDesc(this.dto.readerDescriptor);
          if (r.bizresult) {
            let desc: Descriptor = this.dto.readerDescriptor;
            let i: Item = Object.assign(new Item(desc), r.bizresult);
            i.wrapItemVals();
            this.hlist[0].items[0] = i;
            console.log(i);
          }
          // console.log(dto);
          // this.nextStep.emit(this.dto);
        }
        // else {
        //   this.errorItem = Item.processFieldsErr(r);
        // }
      });

    // this.hlist = DatasourceComponent.pluginDesc(this.dto.readerDescriptor);
    // console.log(this.hlist);
  }

  ngAfterViewInit(): void {
    // this.pluginComponent.errorsPageShow = true;
    // this.pluginComponent.formControlSpan = 20;
    // // this.pluginComponent.shallInitializePluginItems = false;
    // this.hlist = DatasourceComponent.pluginDesc(this.dto.readerDescriptor);
    this.pluginComponent.setPluginMeta([{name: 'dataxReader', require: true, extraParam: 'dataxName_' + this.dto.dataxPipeName}])
    // this.pluginComponent.showSaveButton = false;
    // this.pluginComponent.afterSave.subscribe((r: PluginSaveResponse) => {
    //   if (r && r.saveSuccess && r.hasBiz()) {
    //     // modalRef.close();
    //     // let db = r.biz();
    //     // let newNode: NzTreeNodeOptions[] = [{'key': `${db.dbId}`, 'title': db.name, 'children': []}];
    //     // this.nodes = newNode.concat(this.nodes);
    //     //
    //     // let e = {'type': 'db', 'id': `${db.dbId}`};
    //     // this.treeNodeClicked = true;
    //     // this.onEvent(e);
    //     //
    //     // this.notify.success("成功", `数据库${db.name}添加成功`, {nzDuration: 6000});
    //   }
    // });
  }


  // 执行下一步
  public createStepNext(): void {

    this.savePlugin.emit();

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
    if (this.dto.processMeta.readerRDBMS) {
      this.nextStep.emit(this.dto);
    } else {
      let next: IntendDirect = {"dto": this.dto, cpt: DataxAddStep5Component};
      this.nextStep.emit(next);
    }
  }

}
