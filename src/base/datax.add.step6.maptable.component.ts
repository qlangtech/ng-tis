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

import {AfterViewInit, Component, OnInit} from "@angular/core";
import {TISService} from "../service/tis.service";
import {CurrentCollection} from "../common/basic.form.component";
import {NzModalService} from "ng-zorro-antd";
import {Item, ItemPropVal} from "../common/tis.plugin";
import {BasicDataXAddComponent} from "./datax.add.base";
import {ActivatedRoute, Router} from "@angular/router";


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
          <tis-steps-tools-bar [title]="'Reader-Writer表映射关系'" (cancel)="cancel()" (goBack)="goback()" [goBackBtnShow]="_offsetStep>0"  (goOn)="createStepNext()"></tis-steps-tools-bar>
          <nz-table #basicTable [nzData]="tabAliasList" [nzShowPagination]="false">
              <thead>
              <tr>
                  <th width="40%">Reader源表</th>
                  <th width="10%"></th>
                  <th>Writer目标表</th>
              </tr>
              </thead>
              <tbody>
              <tr *ngFor="let data of basicTable.data" class="editable-row">
                  <td>{{ data.from }}</td>
                  <td align="right"><i nz-icon nzType="swap-right" nzTheme="outline"></i></td>
                  <td>
                      <nz-form-item>
                          <nz-form-control [ngSwitch]="editId === data.from || data.error !== undefined" [nzValidateStatus]="data.error !== undefined ? 'error' : ''" [nzHasFeedback]="data.error !== undefined" [nzErrorTip]="data.error">
                              <div class="editable-cell" *ngSwitchCase="false" (click)="startEdit(data)">
                                  {{ data.to }}
                              </div>
                              <input *ngSwitchCase="true" type="text" nz-input [(ngModel)]="data.to" (blur)="stopEdit()"/>
                          </nz-form-control>
                      </nz-form-item>
                  </td>
              </tr>
              </tbody>
          </nz-table>
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
export class DataxAddStep6Component extends BasicDataXAddComponent implements OnInit, AfterViewInit {
  errorItem: Item = Item.create([]);

  editId: string | null = null;
  tabAliasList: Array<ITableAlias> = [];

  constructor(tisService: TISService, modalService: NzModalService, r: Router, route: ActivatedRoute) {
    super(tisService, modalService, r, route);
  }

  startEdit(mapper: ITableAlias): void {
    this.editId = mapper.from;
    mapper.error = undefined;
  }

  stopEdit(): void {
    this.editId = null;
  }

  protected initialize(app: CurrentCollection): void {
    // this.dto.dataxPipeName
    let url = '/coredefine/corenodemanage.ajax';
    this.httpPost(url, 'action=datax_action&emethod=get_table_mapper&dataxName=' + this.dto.dataxPipeName).then((r) => {
      this.tabAliasList = r.bizresult;
    });
  }

  ngAfterViewInit(): void {
  }

  // 执行下一步
  public createStepNext(): void {
    this.jsonPost('/coredefine/corenodemanage.ajax?action=datax_action&emethod=save_table_mapper&dataxName=' + this.dto.dataxPipeName
      , this.tabAliasList)
      .then((r) => {
        this.processResult(r);
        if (r.success) {
          // console.log(dto);
          this.nextStep.emit(this.dto);
        } else {
          this.errorItem = Item.processFieldsErr(r);
          let colsMetaTest: RegExp = /tabMapperTo\[(\d+)\]/i;
          let m: RegExpExecArray = null;
          let ip: ItemPropVal = null
          let mapper: ITableAlias = null;
          for (let key in this.errorItem.vals) {
            m = colsMetaTest.exec(key);
            if (m) {
              mapper = this.tabAliasList[parseInt(m[1], 10)];
              // @ts-ignore
              ip = this.errorItem.vals[key]
              mapper.error = ip.error;
            }
          }
        }
      });
  }
}

interface ITableAlias {
  from: string;
  to: string;
  error: string;
}
