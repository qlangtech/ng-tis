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

import {
  AfterContentInit,
  AfterViewInit,
  Component,
  OnInit
} from '@angular/core';
import {BasicSideBar, DumpTable, IDataFlowMainComponent} from '../common/basic.form.component';
import {TISService} from '../common/tis.service';


/*
["defaults", "optionHandlers", "defineInitHook", "defineOption", "Init", "helpers",
"registerHelper", "registerGlobalHelper", "inputStyles", "defineMode", "defineMIME",
"defineExtension", "defineDocExtension", "fromTextArea", "off", "on", "wheelEventPixels",
 "Doc", "splitLines", "countColumn", "findColumn", "isWordChar", "Pass", "signal", "Line",
  "changeEnd", "scrollbarModel", "Pos", "cmpPos", "modes", "mimeModes", "resolveMode",
  "getMode", "modeExtensions", "extendMode", "copyState", "startState", "innerMode",
  "commands", "keyMap", "keyName", "isModifierKey", "lookupKey", "normalizeKeyMap",
   "StringStream", "SharedTextMarker", "TextMarker", "LineWidget", "e_preventDefault",
    "e_stopPropagation", "e_stop", "addClass", "contains", "rmClass", "keyNames", "version"]
*/
// import {EditorConfiguration, fromTextArea} from 'codemirror';
import {WorkflowAddComponent} from "./workflow.add.component";
import {NzModalService} from "ng-zorro-antd/modal";
import {NzDrawerRef} from "ng-zorro-antd/drawer";
import {IColumnMeta} from "../common/tis.plugin";
import {NzNotificationService} from "ng-zorro-antd/notification";


//
@Component({
  template: `
    <nz-spin [nzSpinning]="formDisabled" nzSize="large">
      <sidebar-toolbar (close)="_closeSidebar($event)" (save)="_saveClick()"
                       (delete)="deleteNode()"></sidebar-toolbar>

      <form class="clear" nz-form [nzLayout]="'vertical'">
        <div class="item-head"><label>数据库表</label></div>
        <p>
          <tis-table-select [ngModelOptions]="{standalone: true}" [(ngModel)]="cascadervalues"
                            (onCascaderSQLChanges)="this.colsMeta=$event"></tis-table-select>
        </p>

        <ng-container *ngIf="this.colsMeta">
          <div class="item-head"><label>列（s）</label></div>
          <p>
            <table-cols-meta [colsMeta]="this.colsMeta"></table-cols-meta>

          </p>
        </ng-container>
      </form>

    </nz-spin>
  `,

  styles: [
    ` .item-head label {
      font-weight: bold;
    }

    .clear {
      clear: both;
    }`]
})
export class WorkflowAddDbtableSetterComponent
  extends BasicSideBar implements OnInit, AfterContentInit, AfterViewInit {

  // cascaderOptions: NzCascaderOption[] = [];
  cascadervalues: any = {};
  private dto: DumpTable;


  colsMeta: Array<IColumnMeta>;

  constructor(tisService: TISService, //
              modalService: NzModalService, drawerRef: NzDrawerRef<BasicSideBar>, notification: NzNotificationService) {
    super(tisService, modalService, drawerRef, notification);
  }

  ngOnInit(): void {
  }


  initComponent(_: WorkflowAddComponent, dumpTab: DumpTable): void {
    if (dumpTab.tableName) {
      this.cascadervalues = [dumpTab.dbid, dumpTab.tableName];
    }
    //  console.log(this.cascadervalues);
    this.dto = dumpTab;
  }


  ngAfterViewInit(): void {
  }

  ngAfterContentInit(): void {
  }

  // 点击保存按钮
  _saveClick() {
    // console.log(this.cascadervalues);
    let dbId: string = this.cascadervalues[0];
    let tabName: string = this.cascadervalues[1];

    //console.log([dbId, tabName]);
    if (!dbId || !tabName) {
      this.errNotify("请选择表", 12000);
      return;
    }

    this.saveClick.emit(new DumpTable(this.nodeMeta, this.dto.nodeid
      , dbId, tabName));
    this._closeSidebar(null);
  }

  public subscribeSaveClick(graph: any, $: any, nodeid: string
    , addComponent: IDataFlowMainComponent, d: DumpTable): boolean {
    let old = graph.findById(nodeid);
    let nmodel = {'label': d.tabname, 'nodeMeta': d};

    // console.log(nodeid);
    // 更新label值
    graph.updateItem(old, nmodel);
    // console.log(old);
    // 将节点注册到map中存储起来
    // console.log(model.id);
    addComponent.dumpTabs.set(nodeid, d);
    addComponent.closePanel();
    return true;
  }

  // 删除节点
  deleteNode() {

    let id = this.dto.nodeid;
    // let node = this.g6Graph.findById(id);
    // this.g6Graph.removeItem(node);

    this.parentComponent.removeDumpNode(id);


    this._closeSidebar(null);
  }
}







