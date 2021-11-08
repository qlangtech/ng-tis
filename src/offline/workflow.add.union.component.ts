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

import {AfterContentInit, AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {BasicSideBar, IDataFlowMainComponent} from '../common/basic.form.component';
import {TISService} from '../common/tis.service';
// @ts-ignore
// import * as $ from 'jquery';
import 'codemirror/mode/sql/sql.js';
import 'codemirror/lib/codemirror.css';
import {EditorConfiguration, fromTextArea} from 'codemirror';
import {NzModalService} from "ng-zorro-antd/modal";


@Component({
  template: `
      <div>
          <sidebar-toolbar (close)="_closeSidebar()"
                           (save)="_saveClick()" (delete)="_deleteNode()"></sidebar-toolbar>

          <form class="clear" nz-form [nzLayout]="'vertical'">

              <p class="item-head"><label>依赖表</label></p>
              <div>
                  <nz-select name="depsTab" nzMode="tags" style="width: 100%;" nzPlaceHolder="Tag Mode"
                             [(ngModel)]="listOfTagOptions">
                      <nz-option *ngFor="let option of listOfOption" [nzLabel]="option.label"
                                 [nzValue]="option.value"></nz-option>
                  </nz-select>
              </div>
              <p class="item-head"><label>SQL</label></p>
              <div id="sqleditorBlock">
                  <textarea #sqleditor name="code-html"></textarea>
              </div>


          </form>

      </div>

  `,

  styles: [
      `
          .CodeMirror {
              width: 100%;
              height: 600px;
              border: #2f2ded;
          }

          .item-head {
              margin: 20px 0px 0px 0px;
          }

          #sqleditorBlock {
              width: 100%;
          }

          .clear {
              clear: both;
          }
    `]
})
// JOIN 节点设置
export class WorkflowAddUnionComponent
  extends BasicSideBar implements OnInit, AfterContentInit, AfterViewInit {


  @ViewChild('sqleditor', {static: false}) sqleditor: ElementRef;
  listOfOption: Array<{ label: string; value: string }> = [];
  listOfTagOptions: any[] = [];

  constructor(tisService: TISService, //
              modalService: NzModalService) {
    super(tisService, modalService);
  }

  ngOnInit(): void {
    const children: Array<{ label: string; value: string }> = [];
    for (let i = 10; i < 36; i++) {
      children.push({label: i.toString(36) + i, value: i.toString(36) + i});
    }
    this.listOfOption = children;
  }


  ngAfterViewInit(): void {
    let sqlmirror = fromTextArea(this.sqleditor.nativeElement, this.sqleditorOption);
    sqlmirror.setValue("select * from mytable;");
  }

  ngAfterContentInit(): void {
  }

  private get sqleditorOption(): EditorConfiguration {
    return {
      mode: "text/x-hive",
      lineNumbers: true,
    };
  }

  subscribeSaveClick(graph: any, $: any, model: any, _: IDataFlowMainComponent): void {

  }

  initComponent(_: IDataFlowMainComponent): void {
  }


  _deleteNode() {
  }
}





