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

import {Component, EventEmitter, forwardRef, Input, OnInit, Output} from "@angular/core";
import {BasicFormComponent} from "./basic.form.component";
import {TISService} from "./tis.service";
import {NzSelectSizeType} from "ng-zorro-antd/select";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {NzCascaderOption} from "ng-zorro-antd/cascader";
import {DatasourceComponent} from "../offline/ds.component";

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
      <nz-cascader [nzLoadData]="loadData" [style]="nzStyle" [nzSize]="this.nzSize" name="dbTable" class="clear" [nzOptions]="cascaderOptions" [(ngModel)]="value"
                   (ngModelChange)="onCascaderChanges($event)"></nz-cascader>
  `
})
export class TableSelectComponent extends BasicFormComponent implements OnInit, ControlValueAccessor {
  cascaderOptions: NzCascaderOption[] = [];
  // 应该是这样的结构 [dumpTab.dbid, dumpTab.cascaderTabId];
  cascadervalues: any = {};
  @Input()
  nzSize: NzSelectSizeType = 'default';

  @Input()
  nzStyle: string;
  @Output() onCascaderSQLChanges = new EventEmitter<string>();
  private onChangeCallback: (_: any) => void = function () {
  };

  constructor(tisService: TISService) {
    super(tisService);
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
    console.log([node, index]);
    if (index === 0) {
      let action = `emethod=get_datasource_db_by_id&action=offline_datasource_action&id=${node.value}`;

      let cpt :BasicFormComponent = node.basicCpt;
      if(!cpt){
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

    // let tabidtuple = evt[1].split('%');
    // let action = `emethod=get_datasource_table_by_id&action=offline_datasource_action&id=${tabidtuple[0]}`;
    // this.httpPost('/offline/datasource.ajax', action)
    //   .then((result) => {
    //     let r = result.bizresult;
    //     // this.sql = r.selectSql;
    //     this.onCascaderSQLChanges.emit(r.selectSql);
    //   });
    // return new Promise(resolve => {
    //   setTimeout(() => {
    //     // if (index < 0) {
    //     //   // if index less than 0 it is root node
    //     //   node.children = provinces;
    //     // } else if (index === 0) {
    //     //   node.children = cities[node.value];
    //     // } else {
    //     //   node.children = scenicspots[node.value];
    //     // }
    //     resolve();
    //   }, 1000);
    // });
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
  }

  onCascaderChanges(evt: any[]) {
   // console.log(evt);
   // let tabidtuple = evt[1].split('%');
    let action = `emethod=get_datasource_table_by_id&action=offline_datasource_action&id=${evt[0]}&tabName=${evt[1]}`;
    this.httpPost('/offline/datasource.ajax', action)
      .then((result) => {
        let r = result.bizresult;
        // this.sql = r.selectSql;
        this.onCascaderSQLChanges.emit(r.selectSql);
      });

  }

  ngOnInit(): void {

    let action = 'event_submit_do_get_datasource_info=y&action=offline_datasource_action';
    this.httpPost('/offline/datasource.ajax', action)
      .then(result => {
        if (result.success) {
          this.cascaderOptions = [];
          const dbs = result.bizresult.dbs;
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
            let dbNode: NzCascaderOption = {'value': `${db.id}`, 'label': db.name , "basicCpt" : this };
            this.cascaderOptions.push(dbNode);
          }
          //       console.log(this.cascaderOptions);
        }
      });
  }
}
