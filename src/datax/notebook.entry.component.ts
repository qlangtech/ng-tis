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

import {Component, OnInit, TemplateRef, ViewChild} from "@angular/core";
import {TISService} from "../common/tis.service";
import {BasicFormComponent} from "../common/basic.form.component";

import {NzModalService} from "ng-zorro-antd/modal";
import {NotebookMeta, TisResponseResult} from "../common/tis.plugin";
import {ActivatedRoute, Router} from "@angular/router";
import {NotebookwrapperComponent} from "../common/plugins.component";
import {NzDrawerService} from "ng-zorro-antd/drawer";
import {NzSafeAny} from "ng-zorro-antd/core/types";


@Component({
  template: `
      <h3>Notebook 入口</h3>
      <ul class="item-block child-block script-block">
          <li *ngFor="let note of this.notebookEntries">
              <button (click)="noteEntryClick(note)" nz-button nzType="link" nzSize="large"><i nz-icon nzType="book" nzTheme="outline"></i>Notebook of {{note.displayName}}</button>
          </li>
      </ul>
      <ng-template #notebookNotActivate>Notbook功能还未激活，如何在TIS中启用Zeppelin Notebook功能，详细请查看 <a target="_blank" href="https://tis.pub/docs/install/zeppelin">文档</a>
      </ng-template>
  `,
  styles: [
      `
          .child-block {
              list-style-type: none;
          }

          .child-block li {
              display: inline-block;
              width: 20%;
              padding-right: 8px;
          }
    `
  ]
})
export class NotebookEntryComponent extends BasicFormComponent implements OnInit {

  notebookEntries: Array<NoteBookEntry> = [];
  @ViewChild('notebookNotActivate', {read: TemplateRef, static: true}) notebookNotActivate: TemplateRef<NzSafeAny>;
  constructor(private router: Router, private route: ActivatedRoute, tisService: TISService, modalService: NzModalService, private drawerService: NzDrawerService) {
    super(tisService, modalService);
  }


  ngOnInit(): void {

    // '/coredefine/corenodemanage.ajax', "event_submit_do_relaunch_pod_process=y&action=datax_action&podName=" + this.selectedPod.name
    this.httpPost('/coredefine/corenodemanage.ajax', "event_submit_do_scan_notebooks=y&action=plugin_action")
      .then((r: TisResponseResult) => {
        // console.log(r);
        if (r.success) {
          this.notebookEntries = r.bizresult;
        }
      });
  }

  clickTab1() {
  }

  clickTab2() {
  }

  noteEntryClick(note: NoteBookEntry) {

    if (!note.notebook.activate) {
      this.modalService.warning({
        nzTitle: "错误",
        nzContent: this.notebookNotActivate,
        nzOkText: "知道啦"
      });
      return;
    }
    this.httpPost('/coredefine/corenodemanage.ajax', "event_submit_do_get_or_create_notebook=y&action=plugin_action&pluginIdVal=" + note.pluginId)
      .then((r: TisResponseResult) => {
        // console.log(r);
        if (r.success) {
          const drawerRef = this.drawerService.create<NotebookwrapperComponent, {}, {}>({
            nzWidth: "80%",
            nzPlacement: "right",
            nzContent: NotebookwrapperComponent,
            nzContentParams: {},
            nzClosable: false
          });
          this.router.navigate(["/", {outlets: {"zeppelin": `z/zeppelin/notebook/${r.bizresult}`}}], {relativeTo: this.route})
        }
      });
    // console.log("noteEntryClick");
  }
}

interface NoteBookEntry {
  pluginId: string;
  displayName: string;
  notebook: NotebookMeta;
}
