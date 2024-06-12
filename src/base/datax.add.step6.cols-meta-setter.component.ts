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

import {AfterViewInit, Component, OnInit} from "@angular/core";
import {TISService} from "../common/tis.service";
import {CurrentCollection} from "../common/basic.form.component";
import {NzModalService} from "ng-zorro-antd/modal";
import {Item, ItemPropVal, ReaderColMeta} from "../common/tis.plugin";
import {BasicDataXAddComponent} from "./datax.add.base";
import {ActivatedRoute, Router} from "@angular/router";
import {MongoColsTabletView} from "../common/multi-selected/schema.edit.component";


// 文档：https://angular.io/docs/ts/latest/guide/forms.html
@Component({
  template: `
    <tis-steps [type]="stepType" [step]="offsetStep(3)"></tis-steps>
    <!--      <tis-form [fieldsErr]="errorItem">-->
    <!--          <tis-page-header [showBreadcrumb]="false" [result]="result">-->
    <!--              <tis-header-tool>-->
    <!--                  <button nz-button nzType="default" >上一步</button>&nbsp;<button nz-button nzType="primary" (click)="createStepNext()">下一步</button>-->
    <!--              </tis-header-tool>-->
    <!--          </tis-page-header>-->
    <!--      </tis-form>-->
    <nz-spin [nzSpinning]="this.formDisabled">
      <tis-steps-tools-bar [result]="result" [title]="'Writer 目标表元数据'" (cancel)="cancel()" (goBack)="goback()"
                           [goBackBtnShow]="_offsetStep>0" (goOn)="createStepNext()"></tis-steps-tools-bar>
      <tis-form [spinning]="formDisabled" [fieldsErr]="errorItem">
        <tis-ipt #targetTableName title="Writer目标表" name="writerTargetTabName" require="true">
          <input nz-input [(ngModel)]="writerTargetTabName"/>
        </tis-ipt>
        <tis-ipt #targetColsEnum title="Writer列描述" name="targetColsEnum">
          <db-schema-editor [tabletView]="this.tabView"></db-schema-editor>
        </tis-ipt>
      </tis-form>
    </nz-spin>
  `
  , styles: [
    `
      .editable-cell {
        position: relative;
        padding: 5px 12px;
        cursor: pointer;
      }

      .editable-row:hover .editable-cell {
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        padding: 4px 11px;
      }

      nz-form-item {
        margin: 0px;
      }
    `
  ]
})
/**
 * 只有在reader为非rdbms，writer为rdbms的情况下进入该component设置
 * 具体流程请参照：https://www.processon.com/diagraming/60a08c5b7d9c0830243f070f
 */
export class DataxAddStep6ColsMetaSetterComponent extends BasicDataXAddComponent implements OnInit, AfterViewInit {
  errorItem: Item = Item.create([]);

  writerTargetTabName: string;
  writerFromTabName: string;
  // colsMeta: Array<ReaderColMeta> = [];
  // typeMetas: Array<DataTypeMeta> = [];
  tabView: MongoColsTabletView = new MongoColsTabletView([], [], [], []);

  constructor(tisService: TISService, modalService: NzModalService, r: Router, route: ActivatedRoute) {
    super(tisService, modalService, r, route);
  }

  protected initialize(app: CurrentCollection): void {

    let url = '/coredefine/corenodemanage.ajax';
    this.httpPost(url, 'action=datax_action&emethod=get_writer_cols_meta&dataxName=' + this.dto.dataxPipeName)
      .then((r) => {
        let typeMetas = r.bizresult.colMetas;


        //  this.typeMetas = typeMetas;
        // let typeMap: Map<number, DataTypeMeta> = new Map();
        //  for (let type of this.typeMetas) {
        //    typeMap.set(type.type.type, type);
        //  }
        // console.log(typeMetas);
        let tabMapper = r.bizresult.tabMapper;

        this.tabView = new MongoColsTabletView([], null, tabMapper.sourceCols, typeMetas);

        this.writerTargetTabName = tabMapper.to;
        this.writerFromTabName = tabMapper.from;
      });

  }

  ngAfterViewInit(): void {
  }

  // 执行下一步
  public createStepNext(): void {


    this.jsonPost('/coredefine/corenodemanage.ajax?action=datax_action&emethod=save_writer_cols_meta&dataxName=' + this.dto.dataxPipeName
      , {
        "writerTargetTabName": this.writerTargetTabName,
        "writerFromTabName": this.writerFromTabName,
        "colsMeta": this.tabView.mcols
      })
      .then((r) => {
        this.processResult(r);
        if (r.success) {
          // console.log(dto);
          this.nextStep.emit(this.dto);
        } else {
          this.errorItem = Item.processFieldsErr(r);
          let colsMetaTest: RegExp = /colsMeta\[(\d+)\]/i;
          let m: RegExpExecArray = null;
          let ip: ItemPropVal = null
          let colMeta: ReaderColMeta = null;
          for (let key in this.errorItem.vals) {
            m = colsMetaTest.exec(key);
            if (m) {
              colMeta = this.tabView.mcols[parseInt(m[1], 10) - 1];
              // @ts-ignore
              ip = this.errorItem.vals[key]
              colMeta.ip = ip;
              // console.log(`key:${key},${m[1]}`);
            }
          }
        }
      });
  }


}



