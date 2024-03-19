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

import {AfterContentInit, Component, EventEmitter, Output} from "@angular/core";
import {TISService} from "../common/tis.service";
import {AppFormComponent, CurrentCollection} from "../common/basic.form.component";

import {ActivatedRoute} from "@angular/router";
import {NzModalService} from "ng-zorro-antd/modal";
import {IndexIncrStatus} from "./misc/RCDeployment";
import {NzNotificationService} from "ng-zorro-antd/notification";


@Component({
  template: `
      <nz-spin class="container" nzSize="large" [nzSpinning]="formDisabled">
          <nz-empty
                  [nzNotFoundImage]="notFoundImageTpl"
                  [nzNotFoundContent]="contentTpl"
                  [nzNotFoundFooter]="footerTpl"
          >
            <ng-template #notFoundImageTpl>
              <p>
                <span  nz-icon nzType="stream-computing" style="font-size: 100px;" nzTheme="outline"> </span>
              </p>
            </ng-template>
              <ng-template #contentTpl>
                <span  > <i style="font-size: 20px" nz-icon nzType="blibli" nzTheme="fill"></i>
                  <a target="_blank" href="https://www.bilibili.com/video/BV1nX4y1h7SW">MySQL同步Doris作为示例，让初次使用者能够更快熟悉操作</a>         </span>
              </ng-template>
              <ng-template #footerTpl>
                  <button nz-button nzType="primary" (click)="createIncrSyncChannal()">创建增量通道</button>
              </ng-template>
          </nz-empty>
      </nz-spin>
  `,
  styles:[
    `
      .container {
       margin-top: 30px;
      }
    `
  ]
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

    this.httpPost('/coredefine/corenodemanage.ajax', 'action=core_action&emethod=start_incr_sync_channal')
      .then((r) => {
        if (r.success) {
          let dto: IndexIncrStatus = r.bizresult;
         // console.log(dto);
          if (!dto.readerDesc.supportIncr) {
            this.errNotify(dto.readerDesc.impl + "类型的Source暂时不支持增量同步", 10000);
            return;
          }
          if (!dto.writerDesc.supportIncr) {
            // console.log(dto.writerDesc);
            this.errNotify(dto.writerDesc.impl + "类型的Sink暂时不支持增量同步", 10000);
            return;
          }
          this.nextStep.next(dto);
        }
      });
  }
}
