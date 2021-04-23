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

import {Component, OnInit} from "@angular/core";
import {BasicFormComponent} from "./basic.form.component";
import {TISService} from "../service/tis.service";
import {NzModalRef} from "ng-zorro-antd";

@Component({
  template: `
      <nz-alert nzType="info" nzMessage="初次使用TIS，系统需要对相关配置进行初始化" nzShowIcon></nz-alert>
      <tis-page-header [result]="this.result" [showBreadcrumb]="false">
          <button nz-button nzType="primary" (click)="startInitialize()" [nzLoading]="_startInitialize">开始初始化</button>
      </tis-page-header>
      <nz-progress *ngIf="_startInitialize" [nzPercent]="_percent" nzStatus="active"></nz-progress>
  `
})
export class InitSystemComponent extends BasicFormComponent implements OnInit {
  _startInitialize = false;
  _percent = 0;

  constructor(tisService: TISService, private activeModal: NzModalRef) {
    super(tisService);
  }

  ngOnInit(): void {
  }

  startInitialize() {

    this._startInitialize = true;
    let timer = setInterval(() => {
      if (this._percent >= 100) {
        clearInterval(timer);
        return;
      }
      this._percent += 2;
    }, 500);
    let url = '/runtime/applist.ajax?action=sys_initialize_action&emethod=init';
    this.httpPost(url, '').then((r) => {
      clearInterval(timer);
      if (r.success) {
        this.activeModal.close(r);
      } else {
        this.processResult(r);
      }
    });
  }
}
