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

import {AfterContentInit, AfterViewInit, Component, EventEmitter, Input, Output, ViewChild} from "@angular/core";
import {TISService} from "../common/tis.service";
import {AppFormComponent, CurrentCollection} from "../common/basic.form.component";

import {ActivatedRoute, Router} from "@angular/router";
import {IncrBuildComponent} from "./incr.build.component";
import {NzModalService} from "ng-zorro-antd/modal";
import {IndexIncrStatus} from "./misc/RCDeployment";


@Component({
  template: `
      <tis-steps type="createIncr" [step]="3"></tis-steps>
      <tis-page-header [showBreadcrumb]="false" [result]="result">
          <tis-header-tool>
              <!--
                   <button nz-button nzType="default" (click)="createIndexStepPre()">上一步</button>
                   <button nz-button nzType="primary" (click)="createIndexStepNext()">回到首页</button>
                   <button nz-button nzType="default" (click)="cancelStep()">取消</button>
              -->
          </tis-header-tool>
      </tis-page-header>


      <nz-result
              nzStatus="success"
              [nzTitle]="'已经成功为'+this.currentApp.name+'创建增量通道'"
              nzSubTitle="接下来请进入增量通道管理页面"
      >
          <div nz-result-extra>
              <button nz-button nzType="primary" (click)="gotoManage()">进入</button>
          </div>
      </nz-result>`
})
export class IncrBuildStep3Component extends AppFormComponent implements AfterContentInit, AfterViewInit {
  @Output() nextStep = new EventEmitter<any>();
  @Output() preStep = new EventEmitter<any>();
  @Input() dto: IndexIncrStatus;
  private currCollection: CurrentCollection;

  constructor(tisService: TISService, route: ActivatedRoute, modalService: NzModalService, private router: Router) {
    super(tisService, route, modalService);
  }

  protected initialize(app: CurrentCollection): void {
    this.currCollection = app;
  }

  ngAfterViewInit(): void {
  }

  ngAfterContentInit(): void {
  }

  public createIndexStepPre() {
    this.preStep.emit(this.dto);
  }

  createIncrSyncChannal() {

  }

  createIndexStepNext() {
    this.nextStep.emit(this.dto);
  }

  cancelStep() {
  }

  gotoManage() {
    // this.router.navigate(["."], {relativeTo: this.route});

    IndexIncrStatus.getIncrStatusThenEnter(this, (incrStatus) => {
      let k8sRCCreated = incrStatus.k8sReplicationControllerCreated;
      if (k8sRCCreated) {
        this.nextStep.emit(incrStatus);
      }
    });
  }
}
