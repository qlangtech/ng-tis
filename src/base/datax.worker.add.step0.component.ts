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

import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {TISService} from "../service/tis.service";
import {BasicFormComponent, CurrentCollection} from "../common/basic.form.component";
import {NzModalService} from "ng-zorro-antd";

import {DataxWorkerDTO} from "../runtime/misc/RCDeployment";

@Component({
  template: `
      <nz-empty style="height: 500px"
                nzNotFoundImage="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                [nzNotFoundFooter]="footerTpl"
                [nzNotFoundContent]="contentTpl"
      >
          <ng-template #contentTpl>
              <span> 还未创建DataX执行器，创建之后可以将DataX构建任务提交到K8S集群，高效并行执行DataX数据同步任务</span>
          </ng-template>
          <ng-template #footerTpl>
              <button nz-button nzType="primary" (click)="onClick()">创建DataX执行器</button>
          </ng-template>
      </nz-empty>
  `
})
export class DataxWorkerAddStep0Component extends BasicFormComponent implements AfterViewInit, OnInit {

  @Input() dto: DataxWorkerDTO;
  @Output() nextStep = new EventEmitter<any>();

  constructor(tisService: TISService, modalService: NzModalService) {
    super(tisService, modalService);
  }

  protected initialize(app: CurrentCollection): void {
  }

  ngAfterViewInit() {
  }


  ngOnInit(): void {

  }

  onClick() {
    this.nextStep.emit(this.dto);
  }
}

