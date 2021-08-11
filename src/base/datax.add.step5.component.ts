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

import {AfterViewInit, Component, EventEmitter, OnInit, ViewChild} from "@angular/core";
import {TISService} from "../service/tis.service";
import {CurrentCollection} from "../common/basic.form.component";
import {AppDesc} from "./addapp-pojo";
import {NzModalService} from "ng-zorro-antd";
import {Descriptor, HeteroList, Item, PluginSaveResponse} from "../common/tis.plugin";
import {PluginsComponent} from "../common/plugins.component";
import {DataXCreateProcessMeta} from "./datax.add.component";
import {BasicDataXAddComponent} from "./datax.add.base";
import {IntendDirect} from "../common/MultiViewDAG";
import {DataxAddStep7Component} from "./datax.add.step7.confirm.component";
import {DataxAddStep6Component} from "./datax.add.step6.maptable.component";
import {DataxAddStep6ColsMetaSetterComponent} from "./datax.add.step6.cols-meta-setter.component";
import {DataxAddStep3Component} from "./datax.add.step3.component";
import {ActivatedRoute, Router} from "@angular/router";
import {AddAppDefSchemaComponent} from "./addapp-define-schema.component";


// 文档：https://angular.io/docs/ts/latest/guide/forms.html
@Component({
  template: `
      <tis-steps [type]="stepType" [step]="offsetStep(2)"></tis-steps>
      <!--      <tis-form [fieldsErr]="errorItem">-->
      <!--          <tis-page-header [showBreadcrumb]="false" [result]="result">-->
      <!--              <tis-header-tool>-->
      <!--                  <button nz-button nzType="primary" (click)="createStepNext()">下一步</button>-->
      <!--              </tis-header-tool>-->
      <!--          </tis-page-header>-->
      <!--      </tis-form>-->
      <nz-spin [nzSpinning]="this.formDisabled">
          <tis-steps-tools-bar [title]="'Writer '+ dto.writerDescriptor.displayName" (cancel)="cancel()" [goBackBtnShow]="_offsetStep>0" (goBack)="goback()" (goOn)="createStepNext()">
          </tis-steps-tools-bar>
          <tis-plugins (afterSave)="afterSaveReader($event)" [pluginMeta]="[{name: 'dataxWriter', require: true, extraParam: 'dataxName_' + this.dto.dataxPipeName}]"
                       [savePlugin]="savePlugin" [showSaveButton]="false" [shallInitializePluginItems]="false" [_heteroList]="hlist" #pluginComponent></tis-plugins>
      </nz-spin>
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

  constructor(tisService: TISService, modalService: NzModalService, r: Router, route: ActivatedRoute) {
    super(tisService, modalService, r, route);
  }

  protected initialize(app: CurrentCollection): void {
    // this.hlist = DatasourceComponent.pluginDesc(this.dto.writerDescriptor);
    // console.log(this.hlist);
    DataxAddStep3Component.initializeDataXRW(this, "writer", this.dto)
      .then((i: { "desc": Descriptor, "item": Item }) => {
        this.hlist = PluginsComponent.pluginDesc(i.desc);
       // console.log(this.hlist);
        if (i.item) {
          this.hlist[0].items[0] = i.item;
        }
      });
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
    }

    let processMeta: DataXCreateProcessMeta = this.dto.processMeta;
    let n: IntendDirect = null;

    if (this.dto.writerDescriptor.displayName === 'Elasticsearch') {
      // ES的Schema编辑是特别定制的
      n = {'dto': this.dto, 'cpt': AddAppDefSchemaComponent};
      this.nextStep.emit(n);
      return;
    }

    // 流程图： https://www.processon.com/view/link/60a1d0bc7d9c083024412ec0
    if (processMeta.readerRDBMS) {
      if (processMeta.writerRDBMS) {
        n = {'dto': this.dto, 'cpt': DataxAddStep6Component};
      } else {
        // 直接确认
        n = {'dto': this.dto, 'cpt': DataxAddStep7Component};
      }
    } else {
      n = {'dto': this.dto, 'cpt': DataxAddStep6ColsMetaSetterComponent};
      // if (this.dto.writerDescriptor.displayName === 'Elasticsearch') {
      //   // ES的Schema编辑是特别定制的
      //   n = {'dto': this.dto, 'cpt': AddAppDefSchemaComponent};
      // } else {
      //
      // }
    }
    this.nextStep.emit(n);
    // if (processMeta.writerRDBMS) {
    //   if (processMeta.readerRDBMS) {
    //     // 表映射设置
    //     n = {'dto': this.dto, 'cpt': DataxAddStep6Component};
    //   } else {
    //     n = {'dto': this.dto, 'cpt': DataxAddStep6ColsMetaSetterComponent};
    //   }
    // } else {
    //   // 直接确认
    //   n = {'dto': this.dto, 'cpt': DataxAddStep7Component};
    //   // this.nextStep.emit(n);
    // }

  }
}
