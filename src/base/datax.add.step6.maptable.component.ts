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
      <ng-container *ngIf="componentName">{{componentName}}</ng-container>
      <tis-steps type="createDatax" [step]="3"></tis-steps>
<!--      <tis-form [fieldsErr]="errorItem">-->
<!--          <tis-page-header [showBreadcrumb]="false" [result]="result">-->
<!--              <tis-header-tool>-->
<!--                  <button nz-button nzType="default" >上一步</button>&nbsp;<button nz-button nzType="primary" (click)="createStepNext()">下一步</button>-->
<!--              </tis-header-tool>-->
<!--          </tis-page-header>-->
<!--      </tis-form>-->

      <tis-steps-tools-bar (cancel)="cancel()" (goBack)="goback()" (goOn)="createStepNext()"></tis-steps-tools-bar>
      <nz-table #basicTable [nzData]="tabAliasList" [nzShowPagination]="false">
          <thead>
          <tr>
              <th width="40%">源表</th>
              <th width="10%"></th>
              <th>目标表</th>
          </tr>
          </thead>
          <tbody>
          <tr *ngFor="let data of basicTable.data" class="editable-row">
              <td>{{ data.from }}</td>
              <td align="right"><i nz-icon nzType="swap-right" nzTheme="outline"></i></td>
              <td>
                  <div class="editable-cell" [hidden]="editId === data.from" (click)="startEdit(data.from)">
                      {{ data.to }}
                  </div>
                  <input [hidden]="editId !== data.from" type="text" nz-input [(ngModel)]="data.to" (blur)="stopEdit()" />
              </td>
          </tr>
          </tbody>
      </nz-table>
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
    `
  ]
})
export class DataxAddStep6Component extends BasicDataXAddComponent implements OnInit, AfterViewInit {
  errorItem: Item = Item.create([]);

  editId: string | null = null;
  tabAliasList: Array<ITableAlias> = [];

  constructor(tisService: TISService, modalService: NzModalService) {
    super(tisService, modalService);
  }

  startEdit(id: string): void {
    this.editId = id;
  }

  stopEdit(): void {
    this.editId = null;
  }
  ngOnInit(): void {
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

    // this.savePlugin.emit();

    // let dto = new DataxDTO();
    // dto.appform = this.readerDesc;
    this.jsonPost('/coredefine/corenodemanage.ajax?action=datax_action&emethod=save_table_mapper&dataxName=' + this.dto.dataxPipeName
      , this.tabAliasList)
      .then((r) => {
        this.processResult(r);
        if (r.success) {
          // console.log(dto);
          this.nextStep.emit(this.dto);
        } else {
          this.errorItem = Item.processFieldsErr(r);
        }
      });
  }
}

interface ITableAlias {
  from: string;
  to: string;
}
