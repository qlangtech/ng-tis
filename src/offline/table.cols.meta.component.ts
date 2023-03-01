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

import {Component, ComponentFactoryResolver, Input, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {TISService} from '../common/tis.service';
import {BasicFormComponent} from '../common/basic.form.component';

import {ActivatedRoute} from '@angular/router';
// @ts-ignore
import * as $ from 'jquery';
import {NzModalRef} from "ng-zorro-antd/modal";
import {
  DataBase,
  HeteroList,
  IColumnMeta,
  Item,
  ItemPropVal,
  SuccessAddedDBTabs,
  TisResponseResult
} from "../common/tis.plugin";
import {MultiViewDAG} from "../common/MultiViewDAG";
import {DataxAddStep3Component} from "../base/datax.add.step3.component";
import {DataxAddStep4Component} from "../base/datax.add.step4.component";
import {ExecModel} from "../base/datax.add.step7.confirm.component";
import {TableAddStep1Component} from "./table.add.step1.component";
import {DataxDTO} from "../base/datax.add.component";
import {NzNotificationService} from "ng-zorro-antd/notification";


@Component({
  selector: "table-cols-meta",
  template: `
    <tis-page [bordered]="true" [rows]="this.colsMeta" [tabSize]="'small'" [showPagination]="false">
      <tis-col title="index" width="10" field="index"></tis-col>
      <tis-col title="pk" width="10">
        <ng-template let-col="r">
          <i nz-icon *ngIf="col.pk" nzType="check" nzTheme="outline"></i>
        </ng-template>
      </tis-col>
      <tis-col title="name" field="key"></tis-col>
      <tis-col title="type">
        <ng-template let-col="r">
          {{col.type.typeDesc}}
        </ng-template>
      </tis-col>
      <tis-col title="nullable">
        <ng-template let-col="r">
          <i nz-icon *ngIf="col.nullable" nzType="check" nzTheme="outline"></i>
        </ng-template>

      </tis-col>

      <!--                          <tis-col title="comment" width="14" field="comment"></tis-col>-->
    </tis-page>

  `
})
export class TableColsMetaComponent extends BasicFormComponent {
  @Input()
  colsMeta: Array<IColumnMeta>;


  constructor(tisService: TISService) {
    super(tisService);
  }
}
