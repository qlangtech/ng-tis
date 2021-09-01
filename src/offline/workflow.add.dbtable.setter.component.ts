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
import {CascaderOption, NzCascaderOption, NzModalService} from "ng-zorro-antd";


//
@Component({
  template: `
      <nz-spin [nzSpinning]="formDisabled" nzSize="large">

          <sidebar-toolbar (close)="_closeSidebar()" (save)="_saveClick()" (delete)="deleteNode()"></sidebar-toolbar>

          <form class="clear" nz-form [nzLayout]="'vertical'">
              <div class="item-head"><label>数据库表</label></div>
              <p>
                  <!--                  <nz-cascader name="dbTable" class="clear" [nzOptions]="cascaderOptions" [(ngModel)]="cascadervalues"-->
                  <!--                               (ngModelChange)="onCascaderChanges($event)"></nz-cascader>-->
                  <tis-table-select [(ngModel)]="cascadervalues" (onCascaderSQLChanges)="this.sql=$event"></tis-table-select>
              </p>

              <label>SQL</label>
              <div>
                  <tis-codemirror name="sqltext" [(ngModel)]="sql"
                                  [size]="{width:'100%',height:600}" [config]="sqleditorOption"></tis-codemirror>
              </div>
          </form>

      </nz-spin>
  `,

  styles: [
      `.clear {
          clear: both;
      }`]
})
export class WorkflowAddDbtableSetterComponent
  extends BasicSideBar implements OnInit, AfterContentInit, AfterViewInit {

  // cascaderOptions: NzCascaderOption[] = [];
  cascadervalues: any = {};
  private dto: DumpTable;
  sql = 'select * from usertable;';

  constructor(tisService: TISService, //
              modalService: NzModalService) {
    super(tisService, modalService);
  }

  ngOnInit(): void {
  }


  initComponent(_: WorkflowAddComponent, dumpTab: DumpTable): void {

    if (dumpTab.tabid) {
      this.cascadervalues = [dumpTab.dbid, dumpTab.cascaderTabId];
      this.sql = dumpTab.sqlcontent;
    }
    //  console.log(this.cascadervalues);
    this.dto = dumpTab;
  }


  ngAfterViewInit(): void {
  }

  ngAfterContentInit(): void {
  }

  get sqleditorOption(): any {
    return {
      'readOnly': true,
    };
  }

  onChanges(event: any) {

  }

  // onCascaderChanges(evt: any[]) {
  //
  //   let tabidtuple = evt[1].split('%');
  //   let action = `emethod=get_datasource_table_by_id&action=offline_datasource_action&id=${tabidtuple[0]}`;
  //   this.httpPost('/offline/datasource.ajax', action)
  //     .then((result) => {
  //       let r = result.bizresult;
  //       this.sql = r.selectSql;
  //     });
  //
  // }

  // 点击保存按钮
  _saveClick() {

    let tab: string = this.cascadervalues[1];
    let tabinfo: string[] = tab.split('%');

    // console.log(this.dto);

    this.saveClick.emit(new DumpTable(this.nodeMeta, this.dto.nodeid
      , this.sql, this.cascadervalues[0], tabinfo[0], tabinfo[1]));
  }

  public subscribeSaveClick(graph: any, $: any, nodeid: string
    , addComponent: IDataFlowMainComponent, d: DumpTable): void {
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
  }

  // 删除节点
  deleteNode() {

    let id = this.dto.nodeid;
    let node = this.g6Graph.findById(id);
    this.g6Graph.removeItem(node);
    this.parentComponent.dumpTabs.delete(id);
    this._closeSidebar();
  }
}







