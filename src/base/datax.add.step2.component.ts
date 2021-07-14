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

import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {TISService} from "../service/tis.service";
import {BasicFormComponent} from "../common/basic.form.component";
import {AppDesc, ConfirmDTO} from "./addapp-pojo";
import {NzModalService} from "ng-zorro-antd";
import {PluginsComponent} from "../common/plugins.component";
import {DataxDTO} from "./datax.add.component";
import {BasicDataXAddComponent} from "./datax.add.base";
import {ActivatedRoute, Router} from "@angular/router";
import {Descriptor, Item} from "../common/tis.plugin";

// 文档：https://angular.io/docs/ts/latest/guide/forms.html
@Component({
  selector: 'addapp-form',
  // templateUrl: '/runtime/addapp.htm'
  template: `
      <tis-steps type="createDatax" [step]="0"></tis-steps>
      <!--      <tis-page-header [showBreadcrumb]="false" [result]="result">-->
      <!--          <tis-header-tool>-->
      <!--              <button nz-button nzType="primary" (click)="execNextStep()">下一步</button>-->
      <!--          </tis-header-tool>-->
      <!--      </tis-page-header>-->
      <nz-spin [nzSpinning]="this.formDisabled">
          <tis-steps-tools-bar [result]="this.result" [title]="'Reader & Writer类型'" (cancel)="cancel()" (goBack)="goback()" (goOn)="execNextStep()"></tis-steps-tools-bar>
          <tis-form [fieldsErr]="errorItem">
              <tis-ipt #readerType title="Reader类型" name="readerType" require="true">
<!--                  <nz-select nzSize="large" nzPlaceHolder="请选择" name="reader" class="form-control" [ngModel]="dto.readerImpl" (ngModelChange)="changeReaderDesc($event)">-->
<!--                      <nz-option *ngFor="let pp of readerDesc" [nzValue]="pp.impl" [nzLabel]="pp.displayName"></nz-option>-->
<!--                  </nz-select>-->

                  <nz-radio-group [ngModel]="dto.readerImpl" nzSize="large" (ngModelChange)="changeReaderDesc($event)" nzButtonStyle="solid">
                      <label class="source-lab" *ngFor="let pp of readerDesc" nz-radio-button [nzValue]="pp.impl">{{pp.displayName}}</label>
                  </nz-radio-group>
              </tis-ipt>
              <tis-ipt #writerType title="Writer类型" name="writerType" require="true">
<!--                  <nz-select nzSize="large" nzPlaceHolder="请选择" name="writer" class="form-control" [ngModel]="dto.writerImpl" (ngModelChange)="changeWriterDesc($event)">-->
<!--                      <nz-option *ngFor="let pp of writerDesc" [nzValue]="pp.impl" [nzLabel]="pp.displayName"></nz-option>-->
<!--                  </nz-select>-->


                  <nz-radio-group [ngModel]="dto.writerImpl" nzSize="large" (ngModelChange)="changeWriterDesc($event)" nzButtonStyle="solid">
                      <label class="source-lab" *ngFor="let pp of writerDesc" nz-radio-button [nzValue]="pp.impl">{{pp.displayName}}</label>
                  </nz-radio-group>
              </tis-ipt>
          </tis-form>
      </nz-spin>
      <!-- Content here -->
  `
  , styles: [
      `
            .source-lab{
                margin-top: 5px;
                margin-left: 5px;
            }
    `
  ]
})
export class DataxAddStep2Component extends BasicDataXAddComponent implements OnInit {
  errorItem: Item = Item.create([]);
  // model = new Application(
  //   '', 'Lucene6.0', -1, new Crontab(), -1, ''
  // );
  model = new AppDesc();


  // 可选的数据源
  readerDesc: Array<Descriptor> = [];
  writerDesc: Array<Descriptor> = [];

  public static getDataXReaderWriterEnum(baseForm: BasicFormComponent): Promise<DataXReaderWriterEnum> {
    return baseForm.httpPost('/coredefine/corenodemanage.ajax'
      , 'action=datax_action&emethod=get_supported_reader_writer_types')
      .then((r) => {
        if (r.success) {
          let rList = PluginsComponent.wrapDescriptors(r.bizresult.readerDesc);
          let wList = PluginsComponent.wrapDescriptors(r.bizresult.writerDesc);
          // this.readerDesc = Array.from(rList.values());
          // this.writerDesc = Array.from(wList.values());
          return {"readerDescs": Array.from(rList.values()), "writerDescs": Array.from(wList.values())};
        }
      });
  }


  constructor(tisService: TISService, modalService: NzModalService, r: Router, route: ActivatedRoute) {
    super(tisService, modalService, r, route);
  }


  ngOnInit(): void {

    DataxAddStep2Component.getDataXReaderWriterEnum(this).then((rwEnum: DataXReaderWriterEnum) => {
      this.readerDesc = rwEnum.readerDescs;
      this.writerDesc = rwEnum.writerDescs;
    });
    //  return {"readerDescs": this.readerDesc, "writerDescs": this.writerDesc};
  }


// 执行下一步
  public execNextStep(): void {
    // let dto = new DataxDTO();
    // dto.appform = this.readerDesc;
    this.jsonPost('/coredefine/corenodemanage.ajax?action=datax_action&emethod=validate_reader_writer'
      , this.dto)
      .then((r) => {
        this.processResult(r);
        if (r.success) {
          this.dto.processMeta = r.bizresult;
          this.nextStep.emit(this.dto);
        } else {
          this.errorItem = Item.processFieldsErr(r);
        }
      });
  }


  changeReaderDesc(desIml: any): void {
    // console.log(event);
    this.readerDesc.forEach((desc) => {
      if (desc.impl === desIml) {
        this.dto.readerDescriptor = desc;
      }
    });
  }

  changeWriterDesc(desIml: any): void {
    this.writerDesc.forEach((desc) => {
      if (desc.impl === desIml) {
        this.dto.writerDescriptor = desc;
      }
    });
  }
}

export interface DataXReaderWriterEnum {
  readerDescs: Array<Descriptor>;
  writerDescs: Array<Descriptor>;
}
