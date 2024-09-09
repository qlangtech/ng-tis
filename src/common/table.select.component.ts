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

import {AfterViewInit, Component, EventEmitter, forwardRef, Input, OnInit, Output} from "@angular/core";
import {BasicFormComponent} from "./basic.form.component";
import {TISService} from "./tis.service";
import {NzSelectSizeType} from "ng-zorro-antd/select";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {NzCascaderOption} from "ng-zorro-antd/cascader";
import {DatasourceComponent} from "../offline/ds.component";
import {DataBase, IColumnMeta, SuccessAddedDBTabs} from "./tis.plugin";
import {NzModalService} from "ng-zorro-antd/modal";

@Component({
  selector: 'tis-table-select',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TableSelectComponent),
      multi: true
    }
  ],
  template: `
    <nz-cascader [nzLoadData]="loadData" [style]="nzStyle" [nzSize]="this.nzSize" name="dbTable" class="clear"
                 [nzOptionRender]="renderTpl"
                 [nzOptions]="cascaderOptions" [(ngModel)]="value"
                 (ngModelChange)="onCascaderChanges($event)"></nz-cascader>

    <ng-template #renderTpl let-option let-index="index">
      {{ option.label }}
      <button *ngIf="index===0" (click)="manageDbTable(option,$event)" nz-button nzSize="small" nzType="link">
        <i nz-icon nzType="edit" nzTheme="outline"></i></button>
    </ng-template>

  `
})
export class TableSelectComponent extends BasicFormComponent implements OnInit, AfterViewInit, ControlValueAccessor {
  cascaderOptions: NzCascaderOption[] = [];
  // 应该是这样的结构 [dumpTab.dbid, dumpTab.cascaderTabId];
  cascadervalues: any = {};
  @Input()
  nzSize: NzSelectSizeType = 'default';

  @Input()
  nzStyle: string;
  @Output() onCascaderSQLChanges = new EventEmitter<Array<IColumnMeta>>();
  private onChangeCallback: (val: Array<any>) => void = function (val: Array<any>) {

  };

  constructor(tisService: TISService, modalService: NzModalService) {
    super(tisService, modalService);
  }

  manageDbTable(opt: NzCascaderOption, e: MouseEvent): void {
    // console.log(opt);
    let db = new DataBase(opt.value, opt.label);
    // console.log(opt);
    DatasourceComponent.openAddTableDialog(this, db).then((r: SuccessAddedDBTabs) => {
      opt.children = r.tabKeys.map((tab) => {
        return {value: tab, label: tab, isLeaf: true}
      });
    }, (_) => {
    });

    e.stopPropagation();
  }

  get value() {
    return this.cascadervalues;
  }

  @Input() set value(v) {
    if (v !== this.cascadervalues) {
      this.cascadervalues = v;
      this.onChangeCallback(v);
    }
  }

  /** load data async execute by `nzLoadData` method */
  loadData(node: NzCascaderOption, index: number): PromiseLike<void> {
    // console.log([node, index]);
    if (index === 0) {
      if(!node.value){
        console.log(node);
        throw new Error("node.value can not be empty");
      }
      let action = `emethod=get_datasource_db_by_id&action=offline_datasource_action&id=${node.value}`;

      let cpt: BasicFormComponent = node.basicCpt;
      if (!cpt) {
        throw new Error("cpt can not be null");
      }

      return cpt.httpPost('/offline/datasource.ajax', action)
        .then((result) => {
          let biz = result.bizresult;

          let detail = biz.detailed;
          let db = DatasourceComponent.createDB(node.value, detail, biz.dataReaderSetted, biz.supportDataXReader);
          let tabs: Array<string> = biz.selectedTabs;
          node.children = tabs.map((tab) => {
            return {value: tab, label: tab, isLeaf: true}
          });
          return Promise.resolve();
        });
    } else {
      return Promise.resolve();
    }
  }

  registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any): void {
  }

  setDisabledState(isDisabled: boolean): void {
  }

  writeValue(obj: any): void {
    this.cascadervalues = obj;
    if (obj && Array.isArray(obj)) {
      this.onCascaderChanges(obj);
    }
  }

  onCascaderChanges(evt: any[]) {

    TableSelectComponent.reflectTabCols(this, evt[0], evt[1]).then((cols: Array<IColumnMeta>) => {
      this.onCascaderSQLChanges.emit(cols);
    });

  }

  public static reflectTabCols(cpt: BasicFormComponent, dbId: string, tabName: string): Promise<Array<IColumnMeta>> {
    let action = `emethod=get_datasource_table_cols&action=offline_datasource_action&id=${dbId}&tabName=${tabName}`;
    return cpt.httpPost('/offline/datasource.ajax', action)
      .then((result) => {
        if (result.success) {
          let r = result.bizresult;
          return <Array<IColumnMeta>>r
        } else {
          return Promise.reject(result);
        }
        // this.onCascaderSQLChanges.emit(<Array<IColumnMeta>>r);
      });
  }

  ngAfterViewInit(): void {
    // console.log(this.cascadervalues);
    // this.onCascaderChanges(this.cascadervalues);
  }

  ngAfterContentInit(): void {

  }

  ngOnInit(): void {

    let action = 'event_submit_do_get_datasource_info=y&action=offline_datasource_action&filterSupportReader=true';
    this.httpPost('/offline/datasource.ajax', action)
      .then(result => {
        if (result.success) {
          this.cascaderOptions = [];
          const dbs = result.bizresult.dbsSupportDataXReader;
          if (!Array.isArray(dbs) || dbs.length < 1) {
            throw new Error("dbsSupportDataXReader can not be empty");
          }
          for (let db of dbs) {
            let children = [];
            if (db.tables) {
              for (let table of db.tables) {
                let c: NzCascaderOption = {
                  'value': `${table.id}%${table.name}`,
                  'label': table.name,
                  'isLeaf': true
                };
                children.push(c);
              }
            }
            let dbNode: NzCascaderOption = {'value': `${db.id}`, 'label': db.name, "basicCpt": this};
            this.cascaderOptions.push(dbNode);
          }
        }
      });


  }
}
