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
import {TISService} from "../service/tis.service";
import {AppFormComponent, CurrentCollection} from "../common/basic.form.component";

import {ActivatedRoute} from "@angular/router";
import {NzModalService} from "ng-zorro-antd";


@Component({
  template: `
<nz-spin nzSize="large" [nzSpinning]="formDisabled" >
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

  constructor(tisService: TISService, route: ActivatedRoute, modalService: NzModalService) {
    super(tisService, route, modalService);
  }

  protected initialize(app: CurrentCollection): void {
  }

  ngAfterContentInit(): void {
  }

  public createIncrSyncChannal(): void {

    this.httpPost('/coredefine/corenodemanage.ajax', 'action=core_action&emethod=create_incr_sync_channal')
      .then((r) => {
        if (r.success) {
          this.nextStep.next(r.bizresult);
        }
      });
  }
}
