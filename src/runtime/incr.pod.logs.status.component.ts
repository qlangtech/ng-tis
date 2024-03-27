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

import {AfterContentInit, AfterViewInit, Component, Input, OnDestroy, ViewChild} from "@angular/core";
import {TISService} from "../common/tis.service";
import {AppFormComponent, CurrentCollection, WSMessage} from "../common/basic.form.component";
import {ActivatedRoute, Router} from "@angular/router";
import {NgTerminal} from "ng-terminal";
import {NzModalService} from "ng-zorro-antd/modal";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {Subject} from "rxjs";

import {IndexIncrStatus, K8sPodState, LogType, ProcessMeta, RCDeployment} from "./misc/RCDeployment";
import {PodsListComponent} from "../base/datax.worker.running.component";

@Component({
  selector: 'incr-pod-logs-status',
  template: `
    <nz-spin [nzSize]="'large'" [nzSpinning]="this._transactionProcessing || this.formDisabled">
      <div style="height: 800px;">
        <nz-alert *ngIf="this.logMonitorTimeout" nzType="warning" [nzDescription]="warnTpl" nzShowIcon></nz-alert>
        <ng-template #warnTpl>
          日志监听已经超时，请重连
          <button nz-button nzType="primary" nzSize="small" (click)="reconnLogMonitor()">重连</button>
        </ng-template>
        <nz-page-header>
          <nz-page-header-title>
            <nz-space>

              <span *nzSpaceItem><nz-tag >
                <ng-container [ngSwitch]="this.logMonitorTimeout">
                  <span *ngSwitchCase="false" nz-icon [nzType]="'sync'" [nzSpin]="true"></span>
                  <span *ngSwitchCase="true" nz-icon nzType="stop" nzTheme="outline"></span>
                </ng-container>
                {{this._selectedPod?.phase}}</nz-tag>
<!--                {{this._selectedPod?.name}}--></span>
              <nz-select  *nzSpaceItem nzPlaceHolder="Choose" nzShowSearch [ngModel]="this._selectedPod?.name" (ngModelChange)="targetPodChange($event)">
                <nz-option-group *ngFor="let rc of this.rcDeployments" [nzLabel]="rc.name">
                  <nz-option *ngFor="let pod of rc.pods" [nzValue]="pod.name" [nzLabel]="pod.name"></nz-option>
                </nz-option-group>
              </nz-select>

            </nz-space>
          </nz-page-header-title>
          <nz-page-header-extra>
            <nz-space>
              <button *nzSpaceItem nz-button nzType="primary" (click)="relauchIncrProcess()"><span nz-icon nzType="reload" nzTheme="outline"></span>重启</button>
            </nz-space>


          </nz-page-header-extra>
        </nz-page-header>
        <ng-terminal #term></ng-terminal>
      </div>
    </nz-spin>
  `,
  styles: [
    `  nz-page-header {
      padding: 4px;
    }

    nz-alert {
      margin: 10px 0 10px 0;
    }
    `
  ]
})
export class IncrPodLogsStatusComponent extends AppFormComponent implements AfterContentInit, AfterViewInit, OnDestroy {
  private currCollection: CurrentCollection;
  @ViewChild('term', {static: true}) terminal: NgTerminal;
  private componentDestroy = false;
  @Input() processMeta: ProcessMeta
  @Input()
  msgSubject: Subject<WSMessage>;
  @Input()
  incrStatus: IndexIncrStatus;
  logMonitorTimeout = false;
  _selectedPod: K8sPodState;

  @Input()
  rcDeployments: Array<RCDeployment> =[];

  // podStatChange: Subject<K8sPodState> = new Subject<K8sPodState>();
  targetPodChange(targetPod: any) {
 // console.log(event);

    PodsListComponent.viewPodLog(this.processMeta, this.route, this.router, {name:targetPod});
  }
  @Input()
  set selectedPod(podStat: K8sPodState) {
    // console.log("set selectedPod");
    // this.podStatChange.next(podStat);
    this._selectedPod = podStat;
  }

  get selectedPod(): K8sPodState {
    return this._selectedPod;
  }

  @Input()
  logType: LogType = LogType.INCR_DEPLOY_STATUS_CHANGE;

  _transactionProcessing = false;


  constructor(tisService: TISService, route: ActivatedRoute, modalService: NzModalService, notification: NzNotificationService, private router: Router) {
    super(tisService, route, modalService, notification);
  }


  ngOnInit(): void {
    super.ngOnInit();
    // console.log("podStatChange.subscribe");
    this.sendIncrdeployChange();
    //  this.podStatChange.subscribe((podStat) => {
    //    console.log("set selectedPod:"+ podStat.name);
    //    let lt = this.logType + ":" + podStat.name;
    //    if (!this.msgSubject) {
    //      this.msgSubject = this.getWSMsgSubject(lt);
    //
    //    } else {
    //      this.msgSubject.next(new WSMessage(lt));
    //    }
    //  });
  }

  ngAfterViewInit(): void {
    this.msgSubject.subscribe((response: WSMessage): void => {
      if (!response || this.componentDestroy) {
        return;
      }
      // console.log(response);
      switch (response.logtype) {
        case LogType.DATAX_WORKER_POD_LOG:
        case LogType.INCR_DEPLOY_STATUS_CHANGE:

          if (response.data.msg.timeout) {
            this.logMonitorTimeout = true;
          } else {
            this.logMonitorTimeout = false;
            this.terminal.write(response.data.msg + "\r\n");
          }
          break;
      }
    });
  }

  ngOnDestroy(): void {
    this.componentDestroy = true;
  }

  ngAfterContentInit(): void {

  }

  protected initialize(app: CurrentCollection): void {
    this.currCollection = app;
  }

  /**
   * 重新连接
   */
  reconnLogMonitor() {
    // this.msgSubject.next();
    this.sendIncrdeployChange();
    this.successNotify("已经成功发送重连");
  }

  private sendIncrdeployChange() {
    if (this.selectedPod) {
      this.msgSubject.next(new WSMessage(`${this.logType}:${this.selectedPod.name}`));
    } else {
      this.selectedPod = this.incrStatus.getFirstPod();
      if (this.selectedPod) {
        this.msgSubject.next(new WSMessage(`${this.logType}:${this.selectedPod.name}`));
      }
    }
  }


  /**
   * 重启增量执行
   */
  relauchIncrProcess() {
    this._transactionProcessing = true;

   // this.processMeta.targetNameGetter()
    console.log(this.logType);
    switch (this.logType) {
      case LogType.DATAX_WORKER_POD_LOG:
        this.httpPost('/coredefine/corenodemanage.ajax'
          , "event_submit_do_relaunch_pod_process=y&action=datax_action&podName=" + this.selectedPod.name + "&targetName=" + this.processMeta.targetNameGetter(this.route.snapshot.params)// this.processMeta.targetName
        )
          .then((r) => {

            if (r.success) {
              this.successNotify(`已经成功触发重启Powerjob实例${this.selectedPod.name}`);
              setTimeout(() => {
                // console.log("navigate");
                this.router.navigate(["/base/datax-worker", "profile"], {relativeTo: this.route});
                this._transactionProcessing = false;
              }, 3000);
            } else {
              this._transactionProcessing = false;
            }
          }, (reason) => {
            this._transactionProcessing = false;
          });
        return;
      case LogType.INCR_DEPLOY_STATUS_CHANGE:
        this.httpPost('/coredefine/corenodemanage.ajax', "event_submit_do_relaunch_incr_process=y&action=core_action")
          .then((r) => {
            if (r.success) {
              this.successNotify(`已经成功触发重启增量实例${this.currentApp.appName}`);

              setTimeout(() => {
                IndexIncrStatus.getIncrStatusThenEnter(this, (incrStat: IndexIncrStatus) => {
                  this.incrStatus = incrStat;
                  this.sendIncrdeployChange();
                  this._transactionProcessing = false;
                }, false);
              }, 3000);
            } else {
              this._transactionProcessing = false;
            }
          }, (reason) => {
            this._transactionProcessing = false;
          });
    }
  }


}
