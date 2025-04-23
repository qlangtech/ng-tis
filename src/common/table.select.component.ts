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
import {DataBase, HeteroList, IColumnMeta, SuccessAddedDBTabs} from "./tis.plugin";
import {NzModalService} from "ng-zorro-antd/modal";
import {NzDrawerService} from "ng-zorro-antd/drawer";

import {createDrawer} from "./ds.quick.manager.component";
import {createDB, loadDSWithDesc} from "./ds.utils";
import {NzNotificationService} from "ng-zorro-antd/notification";


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
    <nz-cascader [nzLoadData]="cascaderOptions.length>0?loadData: null" [nzShowSearch]="true" [style]="nzStyle"
                 [nzSize]="this.nzSize" name="dbTable"
                 class="clear"
                 [nzOptionRender]="renderTpl"
                 [nzNotFoundContent]="notFoundTpl"
                 [nzOptions]="cascaderOptions" [(ngModel)]="value"
                 (ngModelChange)="onCascaderChanges($event)"
    ></nz-cascader>

    <ng-template #renderTpl let-option let-index="index">

      <span nz-icon [nzType]="option.endType" nzTheme="outline"></span> {{ option.label }}
      <button *ngIf="index===0" (click)="manageDbTable(option,$event)" nz-button nzSize="small" nzType="link">
        <i nz-icon nzType="edit" nzTheme="outline"></i></button>
    </ng-template>

    <ng-template #notFoundTpl>
      <button nz-button nzType="primary" nzSize="small" (click)="addDataSource()"><span nz-icon nzType="plus"
                                                                                        nzTheme="outline"></span>数据源
      </button>
    </ng-template>

    <!--      <ng-template #labelTpl let-nodes="nodes">-->
    <!--        <span nz-icon nzType="home"></span>-->
    <!--        {{nodes|json}}-->
    <!--        <span *ngFor="let node of nodes; let last = last" class="custom-label">-->
    <!--    {{ node.label }} ({{ node.value }})-->
    <!--    <span *ngIf="!last">/</span>-->
    <!--  </span>-->
    <!--      </ng-template>-->

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

  constructor(tisService: TISService, modalService: NzModalService, private drawerService: NzDrawerService, notification: NzNotificationService) {
    super(tisService, modalService, notification);
  }

  manageDbTable(opt: NzCascaderOption, e: MouseEvent): void {
    // console.log(opt);
    let db = new DataBase(opt.value, opt.label);
    if (opt.path && Array.isArray(opt.path)) {
      // 通过suggest查询获得的db列表，db信息在path中，需要通过path内的第一个元素获取
      for (let child of opt.path) {
        db = new DataBase(child.value, child.label);
        break;
      }
    }
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
      console.log(v);
      this.cascadervalues = v;
      this.onChangeCallback(v);
    }
  }

  writeValue(obj: any): void {
    this.cascadervalues = obj;
    if (obj && Array.isArray(obj)) {
      this.onCascaderChanges(obj);
    }
  }

  /** load data async execute by `nzLoadData` method */
  loadData(node: NzCascaderOption, index: number): PromiseLike<void> {

    if (index === 0) {
      if (!node.value) {
        console.log(node);
        throw new Error("node.value can not be empty");
      }
      let action = `emethod=get_datasource_db_by_id&action=offline_datasource_action&id=${node.value}`;

      let cpt: BasicFormComponent = node.basicCpt;
      if (!cpt) {
        throw new Error("cpt can not be null");
      }
      console.log(node);
      return cpt.httpPost('/offline/datasource.ajax', action)
        .then((result) => {
          let biz = result.bizresult;

          let detail = biz.detailed;
          let db = createDB(node.value, detail, biz.dataReaderSetted, biz.supportDataXReader);
          let tabs: Array<string> = biz.selectedTabs;

          node.children = tabs.map((tab) => {
            return {value: tab, label: tab, isLeaf: true}
          });
          // console.log([tabs, tabs.length, tabs.length < 1, this.notification]);
          if (tabs.length < 1) {

            // this.notification.error('错误', "xxxxx", {nzDuration: 6000, nzPlacement: "topLeft"});
            cpt.errNotify("'" + node.label + "'下还没有选中的表，请点击编辑，选择您所需要的表", 12000);
          }
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


  onCascaderChanges(evt: any[]) {
     console.log(evt);
    if (evt.length < 1) {
      this.onCascaderSQLChanges.emit([]);
    } else {
      TableSelectComponent.reflectTabCols(this, evt[0], evt[1]).then((cols: Array<IColumnMeta>) => {
        this.onCascaderSQLChanges.emit(cols);
      });
    }


  }

  public static reflectTabCols(cpt: BasicFormComponent, dbId: string, tabName: string): Promise<Array<IColumnMeta>> {
    if (!tabName) {
      return Promise.resolve([]);
    }
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


    loadDSWithDesc(this, true)
      .then(({dbs, dbsWhichSupportDataXReader, desc}) => {
        this.cascaderOptions = [];
        // const dbs = dbsWhichSupportDataXReader;
        if (!Array.isArray(dbsWhichSupportDataXReader) || dbsWhichSupportDataXReader.length < 1) {
          //  throw new Error("dbsSupportDataXReader can not be empty");
          return;
        }
        for (let db of dbsWhichSupportDataXReader) {

          let dbNode: NzCascaderOption = {
            'value': `${db.id}`,
            'label': db.name,
            "basicCpt": this,
            "endType": db.iconEndtype
          };
          this.cascaderOptions.push(dbNode);
        }
      })


    // let action = 'event_submit_do_get_datasource_info=y&action=offline_datasource_action&filterSupportReader=true';
    // this.httpPost('/offline/datasource.ajax', action)
    //   .then(result => {
    //     if (result.success) {
    //       this.cascaderOptions = [];
    //       const dbs = result.bizresult.dbsSupportDataXReader;
    //       if (!Array.isArray(dbs) || dbs.length < 1) {
    //         throw new Error("dbsSupportDataXReader can not be empty");
    //       }
    //       for (let db of dbs) {
    //         // let children = [];
    //         // if (db.tables) {
    //         //   for (let table of db.tables) {
    //         //     let c: NzCascaderOption = {
    //         //       'value': `${table.id}%${table.name}`,
    //         //       'label': table.name,
    //         //       'isLeaf': true
    //         //     };
    //         //     children.push(c);
    //         //   }
    //         // }
    //         let dbNode: NzCascaderOption = {
    //           'value': `${db.id}`,
    //           'label': db.name,
    //           "basicCpt": this,
    //           "endType": db.iconEndtype
    //         };
    //         //  this.cascaderOptions.push(dbNode);
    //       }
    //     }
    //   });


  }

  /**
   * 系统初始化时，还没有数据源，需要添加数据源
   */
  addDataSource() {
    const drawerRef = createDrawer(this.drawerService, null, true);
    // this.drawerService.create<
    //   DatasourceQuickManagerComponent
    //   , { hetero: HeteroList[] }
    //   , { hetero: HeteroList }>({
    //   nzWidth: "30%",
    //   nzTitle: `数据源列表`,
    //   nzContent: DatasourceQuickManagerComponent,
    //   nzPlacement: "left",
    //   nzContentParams: {}
    // });


    drawerRef.afterClose.subscribe(hetero => {
      let cpt = drawerRef.getContentComponent();
      if (cpt.hasSaved) {
        this.ngOnInit();
      }
      // if (!hetero) {
      //   return;
      // }
    });
  }
}
