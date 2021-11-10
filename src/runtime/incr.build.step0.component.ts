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

import {AfterContentInit, Component, EventEmitter, Output} from "@angular/core";
import {TISService} from "../common/tis.service";
import {AppFormComponent, CurrentCollection} from "../common/basic.form.component";

import {ActivatedRoute} from "@angular/router";
import {NzModalService} from "ng-zorro-antd/modal";
import {IndexIncrStatus} from "./misc/RCDeployment";
import {NzNotificationService} from "ng-zorro-antd/notification";


@Component({
  template: `
      <nz-spin nzSize="large" [nzSpinning]="formDisabled">
          <nz-empty
                  [nzNotFoundImage]="
        'https://gw.alipayobjects.com/mdn/miniapp_social/afts/img/A*pevERLJC9v0AAAAAAAAAAABjAQAAAQ/original'
      "
                  [nzNotFoundContent]="contentTpl"
          >
              <ng-template #contentTpl>
                  <button nz-button nzType="primary" (click)="createIncrSyncChannal()">创建增量通道</button>
              </ng-template>
          </nz-empty>
      </nz-spin>
  `
})
export class IncrBuildStep0Component extends AppFormComponent implements AfterContentInit {
  @Output() nextStep = new EventEmitter<any>();

  constructor(tisService: TISService, route: ActivatedRoute, modalService: NzModalService, notification: NzNotificationService) {
    super(tisService, route, modalService, notification);
  }

  protected initialize(app: CurrentCollection): void {
  }

  ngAfterContentInit(): void {
  }

  public createIncrSyncChannal(): void {

    this.httpPost('/coredefine/corenodemanage.ajax', 'action=core_action&emethod=create_incr_sync_channal')
      .then((r) => {
        if (r.success) {
          let dto: IndexIncrStatus = r.bizresult;
         // console.log(dto);
          if (!dto.readerDesc.endType) {
            this.errNotify(dto.readerDesc.impl + "类型的Source暂时不支持增量同步", 10000);
            return;
          }
          if (!dto.writerDesc.endType) {
            // console.log(dto.writerDesc);
            this.errNotify(dto.writerDesc.impl + "类型的Sink暂时不支持增量同步", 10000);
            return;
          }
          this.nextStep.next(dto);
        }
      });
  }
}
