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

import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TISService} from '../service/tis.service';
import {TableAddStep} from './table.add.step';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';

import {TabColReflect, TablePojo} from './table.add.component';
import {FormComponent} from "../common/form.component";
import {NzModalService} from "ng-zorro-antd";

declare var jQuery: any;


@Component({
  selector: 'tableAddStep1',
  template: `
      <tis-form [spinning]="formDisabled" #form>
          <tis-page-header [showBreadcrumb]="false" [result]="result">
              <input type="hidden" name="event_submit_do_check_table_logic_name_repeat" value="y"/>
              <input type="hidden" name="action" value="offline_datasource_action"/>
              <button nz-button nzType="primary" (click)="createNextStep(form)" [disabled]="!tablePojo.tableName">下一步</button>
          </tis-page-header>
          <tis-ipt #dbname title="数据库" name="dbname" require>
              <nz-select *ngIf="!updateMode" [name]="dbname.name" [id]="dbname.name" (ngModelChange)="dbChange($event)" [(ngModel)]="tablePojo.dbId">
                  <nz-option *ngFor="let db of dbs" [nzValue]="db.value" [nzLabel]="db.name"></nz-option>
              </nz-select>
              <input nz-input *ngIf="updateMode" [name]="dbname.name" [id]="dbname.name" disabled [value]="tablePojo.dbName"/>
          </tis-ipt>

          <tis-ipt #table *ngIf='tbs.length>0 && !updateMode' title="表名" name="table" require>
              <nz-select [name]="table.name" [id]="table.name" [nzShowSearch]="true" (change)="tabChange()" [(ngModel)]="tablePojo.tableName">
                  <nz-option *ngFor="let t of tbs" [nzValue]="t.value" [nzLabel]="t.name"></nz-option>
              </nz-select>
          </tis-ipt>

          <tis-ipt *ngIf='updateMode' title="表名" name="table" require>
              <input nz-input tis-ipt-prop disabled [value]="tablePojo.tableName"/>
          </tis-ipt>
      </tis-form>
  `
})
export class TableAddStep1Component extends TableAddStep implements OnInit {
  switchType = 'single';
  dbs: { name: string, value: string }[] = [];
  tbs: { name: string, value: string }[] = [];
  @Input() tablePojo: TablePojo;

  @Output() processHttpResult: EventEmitter<any> = new EventEmitter();

  constructor(tisService: TISService, protected router: Router,
              private activateRoute: ActivatedRoute, protected location: Location) {
    super(tisService, router, location);
  }


  get updateMode(): boolean {
    return !this.tablePojo.isAdd;
  }

  // DB名称选择
  public dbChange(dbid: string) {
    this.tbs = [];
    // this.tablePojo.tableName = null;
    this.tabChange();
    this.httpPost('/offline/datasource.ajax'
      , `event_submit_do_select_db_change=y&action=offline_datasource_action&dbid=${dbid}`
    ).then(result => {
      if (result.success) {
        this.tbs = result.bizresult;
      }
    });
  }

  public tabChange(): void {

  }


  ngOnInit(): void {
    if (this.tablePojo && this.tablePojo.dbId) {
      this.dbChange(this.tablePojo.dbId);
    }

    this.httpPost('/offline/datasource.ajax',
      'event_submit_do_get_usable_db_names=y&action=offline_datasource_action')
      .then(
        result => {
          this.processHttpResult.emit(result);
          if (result.success) {
            this.dbs = result.bizresult;
          }
        });
  }

  changeType(value: string): void {
    console.log(value);
    this.switchType = value;
  }


  showSpy(spy1: any): void {
    console.log(spy1);
  }

  public createNextStep(form: any): void {
    // console.log(this.tablePojo);
    // 校验库名和表名是否存在
    this.jsonPost('/offline/datasource.ajax?event_submit_do_check_table_logic_name_repeat=y&action=offline_datasource_action', this.tablePojo)
      .then(
        result => {
          if (result.success) {
            let biz = result.bizresult;
            this.tablePojo.selectSql = biz.sql;
            this.tablePojo.cols = [];
            if (biz.cols) {
              biz.cols.forEach((col: any) => {
                let c = Object.assign(new TabColReflect(), col);
                this.tablePojo.cols.push(c);
              });
            }
            this.nextStep.emit(this.tablePojo);
          } else {
            this.processResult(result);
            this.processHttpResult.emit(result);
          }
        }
      );
  }
}
