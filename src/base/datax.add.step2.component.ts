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

import {Component, OnInit} from "@angular/core";
import {TISService} from "../common/tis.service";
import {BasicFormComponent} from "../common/basic.form.component";
import {AppDesc} from "./addapp-pojo";
import {NzModalService} from "ng-zorro-antd/modal";
import {BasicDataXAddComponent} from "./datax.add.base";
import {ActivatedRoute, Router} from "@angular/router";
import {Descriptor, Item} from "../common/tis.plugin";
import {StepType} from "../common/steps.component";
import {AddStep2ComponentCfg} from "./common/datax.common";


// 文档：https://angular.io/docs/ts/latest/guide/forms.html
@Component({
  selector: 'addapp-form',
  template: `
    <tis-steps *ngIf="cfg.stepToolbarNeed" [type]="dto.processModel" [step]="cfg.stepIndex"></tis-steps>
    <nz-spin [nzSpinning]="this.formDisabled">
      <tis-steps-tools-bar [result]="this.result" [title]="cfg.headerCaption" (cancel)="cancel()"
                           (goBack)="goback()" (goOn)="execNextStep()"></tis-steps-tools-bar>
      <tis-form [fieldsErr]="errorItem">
        <tis-ipt *ngIf="cfg.readerCptNeed" #readerType title="Reader类型" name="readerType"
                 require="true">

          <nz-radio-group [ngModel]="dto.readerImpl" nzSize="large" (ngModelChange)="changeReaderDesc($event)"
                          nzButtonStyle="solid">
            <label [id]="'source_'+pp.endtype" nz-tooltip [nzTooltipTitle]="pp.endTypeDesc" class="source-lab" *ngFor="let pp of readerDesc" nz-radio-button
                   [nzValue]="pp.impl">
              <i nz-icon class="icon"  *ngIf="pp.supportIcon" [nzType]="pp.endtype"  nzTheme="outline"></i>
              <i class="txt">{{pp.displayName}}</i>
            </label>
          </nz-radio-group>
        </tis-ipt>
        <tis-ipt #writerType [title]="cfg.writerTypeLable" name="writerType" require="true">

          <nz-radio-group [ngModel]="dto.writerImpl" nzSize="large" (ngModelChange)="changeWriterDesc($event)"
                          nzButtonStyle="solid">
            <label [id]="'sink_'+pp.endtype" class="source-lab" nz-tooltip [nzTooltipTitle]="pp.endTypeDesc" *ngFor="let pp of writerDesc" nz-radio-button
                   [nzValue]="pp.impl">
              <i nz-icon class="icon" *ngIf="pp.supportIcon" [nzType]="pp.endtype"  nzTheme="outline"></i>
              <i class="txt">{{pp.displayName}}</i></label>
          </nz-radio-group>
        </tis-ipt>
        <tis-ipt title="插件安装" require="false">
          <tis-plugin-add-btn (afterPluginAddClose)="ngOnInit()"
                              [filterTags]="this.descFilterTags"
                              [extendPoint]="this.dto.addStep2ComponentCfg.installableExtension"
                              [descriptors]="[]">添加</tis-plugin-add-btn>
        </tis-ipt>
      </tis-form>
    </nz-spin>
  `
  , styles: [
    `
        .source-lab {
            margin-top: 5px;
            margin-left: 5px;
          display: inline-block;
        }

        .source-lab .icon {
            font-size: 40px;
            display: inline-block;
            margin: 2px;
        }

        .source-lab .txt {
            font-size: 12px;
            padding-bottom: 5px;
        }
    `
  ]
})
export class DataxAddStep2Component extends BasicDataXAddComponent implements OnInit {
  errorItem: Item = Item.create([]);
  model = new AppDesc();


  // 可选的数据源
  readerDesc: Array<Descriptor> = [];
  writerDesc: Array<Descriptor> = [];

  public static getDataXReaderWriterEnum(baseForm: BasicFormComponent, cfg: AddStep2ComponentCfg): Promise<DataXReaderWriterEnum> {
    return baseForm.httpPost('/coredefine/corenodemanage.ajax'
      , 'action=datax_action&emethod=get_supported_reader_writer_types&writerPluginTag=' + cfg.writerPluginTag)
      .then((r) => {
        if (r.success) {
          let rList = Descriptor.wrapDescriptors(r.bizresult.readerDesc);
          let wList = Descriptor.wrapDescriptors(r.bizresult.writerDesc);
          return {"readerDescs": Array.from(rList.values()), "writerDescs": Array.from(wList.values())};
        }
      });
  }

  get descFilterTags(): Array<string> {

    if (this.stepType === StepType.CreateWorkflow) {
      return ['offline_parser'];
    } else {
      return [];
    }
  }

  constructor(tisService: TISService, modalService: NzModalService, r: Router, route: ActivatedRoute ) {
    super(tisService, modalService, r, route);
   // this.iconService.addIconLiteral('ng-zorro:sqlserver', ngZorroIconSqlserver);
  }

  get cfg(): AddStep2ComponentCfg {
    return this.dto.addStep2ComponentCfg;
  }

  ngOnInit(): void {

    DataxAddStep2Component.getDataXReaderWriterEnum(this, this.cfg).then((rwEnum: DataXReaderWriterEnum) => {
      this.readerDesc = rwEnum.readerDescs;
      this.writerDesc = rwEnum.writerDescs;
    });
  }


// 执行下一步
  public execNextStep(): void {
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
