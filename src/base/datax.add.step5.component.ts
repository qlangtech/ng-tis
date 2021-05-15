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
import {BasicDataXAddComponent} from "./datax.add.base";


// 文档：https://angular.io/docs/ts/latest/guide/forms.html
@Component({
  template: `
      <tis-steps type="createDatax" [step]="2"></tis-steps>
<!--      <tis-form [fieldsErr]="errorItem">-->
<!--          <tis-page-header [showBreadcrumb]="false" [result]="result">-->
<!--              <tis-header-tool>-->
<!--                  <button nz-button nzType="primary" (click)="createStepNext()">下一步</button>-->
<!--              </tis-header-tool>-->
<!--          </tis-page-header>-->
<!--      </tis-form>-->
      <tis-steps-tools-bar (cancel)="cancel()" (goBack)="goback()" (goOn)="createStepNext()"></tis-steps-tools-bar>
      <tis-plugins (afterSave)="afterSaveReader($event)" [pluginMeta]="[{name: 'dataxWriter', require: true, extraParam: 'dataxName_' + this.dto.dataxPipeName}]"
                   [savePlugin]="savePlugin" [showSaveButton]="false" [shallInitializePluginItems]="false" [_heteroList]="hlist" #pluginComponent></tis-plugins>
  `
  , styles: [
      `
    `
  ]
})
export class DataxAddStep5Component extends BasicDataXAddComponent implements OnInit, AfterViewInit {
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
    this.hlist = DatasourceComponent.pluginDesc(this.dto.writerDescriptor);
    // console.log(this.hlist);
  }

  ngAfterViewInit(): void {
  }
  // 执行下一步
  public createStepNext(): void {

    this.savePlugin.emit();
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
    // console.log(this.dto);
    this.nextStep.emit(this.dto);
  }


}
