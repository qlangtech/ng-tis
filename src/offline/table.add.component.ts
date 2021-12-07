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

import {Component, Input, OnInit} from '@angular/core';
import {TISService} from '../common/tis.service';
import {BasicFormComponent} from '../common/basic.form.component';

import {ActivatedRoute} from '@angular/router';
// @ts-ignore
import * as $ from 'jquery';
import {NzModalRef, NzModalService} from "ng-zorro-antd/modal";
import {DbPojo} from "./db.add.component";
import {TisResponseResult} from "../common/tis.plugin";

@Component({
  // templateUrl: '/offline/tableaddstep.htm'
  template: `
      <tis-msg [result]="result"></tis-msg>
      <div>
          <tableAddStep1 *ngIf="currentIndex===0"
                         (nextStep)="goToNextStep($event)"
                         [tablePojo]="tablePojo"></tableAddStep1>
          <tableAddStep2 *ngIf="currentIndex===1" (previousStep)="goToPreviousStep($event)"
                         (processSuccess)="processTableAddSuccess($event)"
                         [step1Form]="step1Form"
                         [tablePojo]="tablePojo"></tableAddStep2>
      </div>
  `
})
export class TableAddComponent extends BasicFormComponent implements OnInit {
  // title: string = 'table add step';
  currentIndex = 0;
  stepsNum = 2;
  step1Form: TablePojo;
  tablePojo: TablePojo;
  // id: number;

  @Input() processMode: { tableid?: number, dbId?: string, isNew: boolean } = {isNew: true};

  constructor(tisService: TISService
    , private activateRoute: ActivatedRoute
    , private activeModal: NzModalRef) {
    super(tisService);
    this.tablePojo = new TablePojo();
    this.step1Form = new TablePojo();
  }


  get updateMode(): boolean {
    return !this.processMode.isNew;
  }

  ngOnInit(): void {
    // let queryParams = this.activateRoute.snapshot.queryParams;
    // console.log(queryParams);

    // let mparams = this.activeModal.getConfig().nzComponentParams;

    // DbPojo
    if (this.processMode.dbId) {
        this.tablePojo.dbId = this.processMode.dbId;
    }
    // console.log(this.tablePojo);
    let mode = this.processMode;
    // console.log(mode);
    this.tablePojo.isAdd = true;
    if (!mode.isNew) {
      // this.id = mode['tableId'];
      this.tablePojo.isAdd = false;
      this.tablePojo.id = mode.tableid;
      // this.title = '修改数据表';

      let action = `action=offline_datasource_action&event_submit_do_get_datasource_table_by_id=y&id=${mode.tableid}`;
      this.httpPost('/offline/datasource.ajax', action)
        .then(result => {
          if (result.success) {
            let t = result.bizresult;
            this.tablePojo = $.extend(this.tablePojo, t);
          }
        });
    }
  }

  goToNextStep(form: TablePojo) {
    this.currentIndex = (this.currentIndex + 1) % this.stepsNum;
    this.step1Form = form;
  }

  goToPreviousStep(form: any) {
    this.currentIndex = (this.currentIndex - 1) % this.stepsNum;
  }


  processTableAddSuccess(e: TisResponseResult) {
    this.activeModal.close(e);
  }
}

export class TablePojo {
  public cols: TabColReflect[] = [];

  constructor(
    // public tableLogicName?: string,
    public partitionNum?: number,
    public dbName?: string,
    public partitionInterval?: number,
    public selectSql?: string,
    public sqlAnalyseResult?: any,
    public isAdd?: boolean,
    public id?: number,
    public dbId?: string,
    public tableName?: string,
  ) {

  }

}

export class TabColReflect {
  public key: string;
  public pk: boolean;
  public type: number;
}
