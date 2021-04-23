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

import {AfterContentInit, AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild} from "@angular/core";
import {TISService} from "../service/tis.service";
import {AppFormComponent, CurrentCollection} from "../common/basic.form.component";

import {ActivatedRoute} from "@angular/router";
import {IndexIncrStatus} from "./incr.build.component";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {NzModalService} from "ng-zorro-antd";


@Component({
  template: `
      <tis-steps type="createIncr" [step]="1"></tis-steps>
      <tis-page-header [showBreadcrumb]="false" [result]="result">
          <tis-header-tool>
              <button nz-button nzType="default" (click)="createIndexStepPre()"><i nz-icon nzType="backward" nzTheme="outline"></i>上一步</button>&nbsp;
              <button nz-button nzType="primary" (click)="createIndexStepNext()" [nzLoading]="formDisabled"><i nz-icon nzType="cloud-upload" nzTheme="outline"></i>部署</button>&nbsp;
              <button nz-button nzType="default" (click)="cancelStep()">取消</button>
          </tis-header-tool>
      </tis-page-header>

      <nz-collapse [nzBordered]="false">
          <nz-collapse-panel [nzHeader]="'资源规格'" [nzActive]="true">
              <form nz-form [nzLayout]="'horizontal'" class="spec-form" [formGroup]="specForm">
                  <input type="hidden" name="event_submit_do_incr_instance" value="y"/>
                  <input type="hidden" name="action" value="incr_init_spe_action"/>

                  <nz-form-item>
                      <nz-form-label nzFor="pods" [nzSpan]="2">Pods</nz-form-label>
                      <nz-form-control>
                          <nz-input-number name="pods" formControlName="pods" [nzMin]="1" [nzMax]="20" [nzStep]="1" [ngModel]="1"></nz-input-number>
                      </nz-form-control>
                  </nz-form-item>

                  <nz-form-item>
                      <nz-form-label [nzSpan]="2">CPU</nz-form-label>
                      <nz-form-control>
                          <div class="resource-spec">
                              <div>
                                  <nz-input-group nzAddOnBefore="Request" nzCompact [nzAddOnAfter]="cpuRequestTpl">
                                      <nz-input-number name="cuprequest" class="input-number" formControlName="cuprequest" [nzMin]="1" [nzStep]="1"></nz-input-number>
                                  </nz-input-group>
                                  <ng-template #cpuRequestTpl>
                                      <nz-select formControlName="cuprequestunit">
                                          <nz-option [nzLabel]="'millicores'" [nzValue]="'m'"></nz-option>
                                          <nz-option [nzLabel]="'cores'" [nzValue]="'cores'"></nz-option>
                                      </nz-select>
                                  </ng-template>
                              </div>
                              <div>
                                  <nz-input-group nzAddOnBefore="Limit" nzCompact [nzAddOnAfter]="cpuLimitTpl">
                                      <nz-input-number formControlName="cuplimit" class="input-number" [nzMin]="1" [nzStep]="1"></nz-input-number>
                                  </nz-input-group>
                                  <ng-template #cpuLimitTpl>
                                      <nz-select formControlName="cuplimitunit">
                                          <nz-option [nzLabel]="'millicores'" [nzValue]="'m'"></nz-option>
                                          <nz-option [nzLabel]="'cores'" [nzValue]="'cores'"></nz-option>
                                      </nz-select>
                                  </ng-template>
                              </div>
                          </div>
                      </nz-form-control>
                  </nz-form-item>

                  <nz-form-item>
                      <nz-form-label [nzSpan]="2">Memory</nz-form-label>
                      <nz-form-control>
                          <div class="resource-spec">
                              <div>
                                  <nz-input-group nzAddOnBefore="Request" nzCompact [nzAddOnAfter]="memoryrequestTpl">
                                      <nz-input-number formControlName="memoryrequest" class="input-number" [nzMin]="1" [nzStep]="1"></nz-input-number>
                                  </nz-input-group>
                                  <ng-template #memoryrequestTpl>
                                      <nz-select formControlName="memoryrequestunit">
                                          <nz-option [nzLabel]="'MB'" [nzValue]="'M'"></nz-option>
                                          <nz-option [nzLabel]="'GB'" [nzValue]="'G'"></nz-option>
                                      </nz-select>
                                  </ng-template>
                              </div>
                              <div>
                                  <nz-input-group nzAddOnBefore="Limit" nzCompact [nzAddOnAfter]="memorylimitTpl">
                                      <nz-input-number formControlName="memorylimit" class="input-number" [nzMin]="1" [nzStep]="1"></nz-input-number>
                                  </nz-input-group>
                                  <ng-template #memorylimitTpl>
                                      <nz-select formControlName="memorylimitunit">
                                          <nz-option [nzLabel]="'MB'" [nzValue]="'M'"></nz-option>
                                          <nz-option [nzLabel]="'GB'" [nzValue]="'G'"></nz-option>
                                      </nz-select>
                                  </ng-template>
                              </div>
                          </div>
                      </nz-form-control>
                  </nz-form-item>

              </form>

          </nz-collapse-panel>
      </nz-collapse>
  `,
  styles: [`

      .resource-spec {
          display: flex;
      }

      .resource-spec div{
          flex: 1;
          margin-right: 20px;
      }

      .input-number {
          width: 100%;
      }

      .spec-form {
          max-width: 800px
      }

      .ant-input-group {
          width: 200px
      }

      label {
          width: 5em;
      }
  `]
})
export class IncrBuildStep2Component extends AppFormComponent implements AfterContentInit, AfterViewInit, OnInit {
  @Output() nextStep = new EventEmitter<any>();
  @Output() preStep = new EventEmitter<any>();
  @Input() dto: IndexIncrStatus;
  specForm: FormGroup;

  constructor(tisService: TISService, route: ActivatedRoute, modalService: NzModalService, private fb: FormBuilder) {
    super(tisService, route, modalService);
  }

  protected initialize(app: CurrentCollection): void {

  }


  ngOnInit(): void {
    super.ngOnInit();
    this.specForm = this.fb.group({
      pods: [1, Validators.required],
      cuprequest: [500, [Validators.required]],
      cuprequestunit: ['m', [Validators.required]],
      cuplimitunit: ['cores', [Validators.required]],
      cuplimit: [1, [Validators.required]],
      memoryrequest: [500, [Validators.required]],
      memoryrequestunit: ['M', [Validators.required]],
      memorylimit: [2, [Validators.required]],
      memorylimitunit: ['G', [Validators.required]]
    });
  }

  ngAfterViewInit(): void {
  }

  ngAfterContentInit(): void {
  }

  cancelStep() {

  }

  createIndexStepNext() {
    let url = '/coredefine/corenodemanage.ajax?event_submit_do_deploy_incr_sync_channal=y&action=core_action';
    // 保存MQ消息
    this.jsonPost(url, this.specForm.value).then((r) => {
      if (r.success) {
        this.nextStep.emit(this.dto);
      }
    });
    // 服务端生成了taskid
    // this.tisService.wsconnect('ws://' + window.location.host
    //   + '/tjs/download/tasklogfeedback?taskid=' + 1)
    //   .subscribe((response: MessageEvent): void => {
    //     // let status = JSON.parse(response.data);
    //     // // console.log(status);
    //     // // console.info(status.dumpPhase);
    //     // this.liveExecLog.dumpPhase = status.dumpPhase;
    //     // this.liveExecLog.joinPhase = status.joinPhase;
    //     // this.liveExecLog.buildPhase = status.buildPhase;
    //     // this.liveExecLog.indexBackFlowPhaseStatus
    //     //   = status.indexBackFlowPhaseStatus;
    //     // if (this.isSpinning){
    //     //   this.isSpinning = false;
    //     // }
    //   });
    //
    // this.nextStep.emit(this.dto);
  }

  public createIndexStepPre() {
    this.preStep.emit(this.dto);
  }
}
