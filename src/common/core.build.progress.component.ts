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

import {AppFormComponent, CurrentCollection, WSMessage} from "./basic.form.component";
import {ActivatedRoute, Params} from "@angular/router";
import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, TemplateRef, ViewChild} from "@angular/core";
import {TISService} from "./tis.service";


import {NgTerminal} from "ng-terminal";
import { NzModalService} from "ng-zorro-antd/modal";
import {NzDrawerRef} from "ng-zorro-antd/drawer";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {Subject} from "rxjs";
import {map} from 'rxjs/operators';


@Component({
  selector: 'tis-progress',
  template: `
      <dd class="progress">
          <ng-container *ngIf="t.success">
              <nz-progress [nzPercent]="100"></nz-progress>
          </ng-container>
          <ng-container *ngIf="!t.waiting && !t.complete">
              <nz-progress [nzPercent]="t.percent"></nz-progress>
          </ng-container>
          <div *ngIf="t.waiting" class="waiting"></div>
          <nz-progress *ngIf="t.faild" [nzPercent]="100" nzStatus="exception"></nz-progress>
      </dd>
  `,
  styles: [
      `
          .waiting {
              background-color: #d6ca64;
              border-radius: 4px;
              height: 8px;
              width: 90%;
          }
    `
  ]
})
export class ProgressComponent {
  t: any = {};

  @Input() set val(val: any) {
    this.t = val;
  }
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'tis-progress-title',
  template: `
      <h6 class="card-title">
      <span *ngIf="t.success">
         <nz-tag [nzColor]="'#87d068'"><i class="fa fa-check"
                                          aria-hidden="true"></i>成功</nz-tag></span>
          <span *ngIf="t.faild">
        <nz-tag [nzColor]="'#f50'">
              <i class="fa fa-times"
                 aria-hidden="true"></i>失败</nz-tag></span>

          <i *ngIf="t.processing" class="fa fa-cog fa-spin fa-1x fa-fw"></i>
          <ng-content></ng-content>
      </h6>  `
})
export class ProgressTitleComponent {
  t: any = {};

  @Input() set val(val: any) {
    // console.log(val);
    this.t = val;
  }
}

/**
 * 全量构建索引可视化页面
 * Created by baisui on 2017/7/12 0012.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
      <tis-page-header title="构建状态" [breadcrumb]="this.breadcrumb" [showBreadcrumb]="showBreadcrumb">
          <button nz-button (click)="openReltimeLog()">实时日志</button>&nbsp;
          <button nzType="primary" nzDanger [disabled]="isSpinning || !progressStat.running" nz-button (click)="cancelJob()"><i nz-icon nzType="stop" nzTheme="outline"></i>终止</button>
      </tis-page-header>
      <nz-spin [nzSpinning]="isSpinning" [nzDelay]="1000" nzSize="large">
          <div class="stat-header">
              <nz-descriptions nzBordered [nzSize]="'small'">
                  <nz-descriptions-item nzTitle="状态">
                      <i nz-icon [nzType]="progressStat.stateClass" [nzSpin]="progressStat.stateClass === 'loading'" [ngStyle]="{'color':progressStat.stateColor}" aria-hidden="true"></i>
                      <button nz-button nzType="link" (click)="openReltimeLog()">{{progressStat.literalState}}</button>
                      <span style="color: #000088;"><i style="color: #bbb8db">耗时:</i>{{consuming | timeconsume }}</span>
                  </nz-descriptions-item>
                  <nz-descriptions-item nzTitle="开始时间">
                      {{progressStat.startTime | date:'yyyy/MM/dd HH:mm:ss'}}
                  </nz-descriptions-item>
                  <nz-descriptions-item nzTitle="阶段">
                      <nz-tag [nzColor]="'blue'">{{progressStat.startPhase}}</nz-tag>
                      <i nz-icon nzType="arrow-right" nzTheme="outline"></i>
                      <nz-tag [nzColor]="'blue'">{{progressStat.endPhase}}</nz-tag>
                  </nz-descriptions-item>
                  <nz-descriptions-item nzTitle="触发方式">
                      {{progressStat.triggerType}}
                  </nz-descriptions-item>
              </nz-descriptions>
          </div>
          <nz-collapse [nzBordered]="false">
              <nz-collapse-panel *ngIf="this.buildTask.inRange(1)" [nzHeader]="dumpTpl" [nzActive]="true">
                  <ul class='child-block' *ngIf="liveExecLog.dumpPhase">
                      <li *ngFor="let t of liveExecLog.dumpPhase.processStatus.details;">
                          <dt>{{t.name}} <span *ngIf="!t.waiting" class='percent-status'>({{t.processed}}/{{t.all}})</span></dt>
                          <tis-progress [val]="t"></tis-progress>
                      </li>
                  </ul>
              </nz-collapse-panel>
              <ng-template #dumpTpl>
                  <tis-progress-title [val]="liveExecLog.dumpPhase">数据导入</tis-progress-title>
              </ng-template>

              <nz-collapse-panel *ngIf="this.buildTask.inRange(2)" [nzHeader]="joinTpl" [nzActive]="true">
                  <ul class='child-block' *ngIf="liveExecLog.joinPhase">
                      <li *ngFor="let t of liveExecLog.joinPhase.processStatus.details;">
                          <dt>{{t.name}}<span *ngIf="!t.waiting" class='percent-status'>({{t.processed}}/{{t.all}})</span></dt>
                          <tis-progress [val]="t"></tis-progress>
                      </li>
                  </ul>
              </nz-collapse-panel>
              <ng-template #joinTpl>
                  <tis-progress-title [val]="liveExecLog.joinPhase">宽表构建</tis-progress-title>
              </ng-template>


              <nz-collapse-panel *ngIf="this.buildTask.inRange(3)" [nzHeader]="indexBuildTpl" [nzActive]="true">
                  <ul class='child-block' *ngIf="liveExecLog.buildPhase">
                      <li *ngFor="let t of liveExecLog.buildPhase.processStatus.details;">
                          <dt>{{t.name}}<span *ngIf="!t.waiting" class='percent-status'>({{t.processed}}/{{t.all}})</span></dt>
                          <tis-progress [val]="t"></tis-progress>
                      </li>
                  </ul>
              </nz-collapse-panel>
              <ng-template #indexBuildTpl>
                  <tis-progress-title [val]="liveExecLog.buildPhase">倒排索引构建</tis-progress-title>
              </ng-template>


              <nz-collapse-panel *ngIf="this.buildTask.inRange(4)" [nzHeader]="indexBackFlow" [nzActive]="true">
                  <ul class='child-block' *ngIf="liveExecLog.indexBackFlowPhaseStatus">
                      <li *ngFor="let t of liveExecLog.indexBackFlowPhaseStatus.processStatus.details;">
                          <dt>{{t.name}}<span *ngIf="!t.waiting" class='percent-status'>({{t.processed}}/{{t.all}})</span></dt>
                          <tis-progress [val]="t"></tis-progress>
                      </li>
                  </ul>
              </nz-collapse-panel>
              <ng-template #indexBackFlow>
                  <tis-progress-title [val]="liveExecLog.indexBackFlowPhaseStatus">索引回流</tis-progress-title>
              </ng-template>

          </nz-collapse>
      </nz-spin>
      <nz-drawer
              [nzWrapClassName]="'get-gen-cfg-file'"
              [nzBodyStyle]="{  overflow: 'auto' }"
              [nzMaskClosable]="false"
              [nzWidth]="'70%'"
              [nzVisible]="termVisible"
              [nzTitle]="drawerTitle"
              (nzOnClose)="termClose()"
      >
          <ng-terminal #term></ng-terminal>
      </nz-drawer>
      <ng-template #drawerTitle>
          执行日志
          <button nz-button [nzType]="'link'" (click)="downloadLogFile()"><i nz-icon nzType="download" nzTheme="outline"></i></button>
      </ng-template>

  `,
  styles: [
      `
          .percent-status {
              font-size: 6px;
              color: #c5c5c5;
          }

          .stat-header {
              margin-bottom: 10px;
          }

          .child-block {
              list-style-type: none;
          }

          .child-block li {
              display: block;
              width: 25%;
              float: left;
              padding-right: 8px;
          }

          .layout {
              height: 80vh;
          }
    `
  ]
})
export class BuildProgressComponent extends AppFormComponent implements AfterViewInit, OnDestroy {
  // 运行耗时
  consuming = 0;
  consumingTimer: any;
  @ViewChild('termTemplate', {static: false}) termTemplate: TemplateRef<{
    $implicit: { value: string };
    drawerRef: NzDrawerRef<string>;
  }>;
  breadcrumb: string[] = [];
  @ViewChild('term', {static: true}) terminal: NgTerminal;
  buildTask = new BuildTask();
  private componentDestroy = false;
  showBreadcrumb = false;
  private msgSubject: Subject<WSMessage>;
  taskid: number;

// http://localhost:8080/coredefine/corenodemanage.ajax?action=core_action&emethod=get_view_data
//   app: any;
//   config: any;
//   instanceDirDesc: any;
  @ViewChild('term', {static: true}) child: NgTerminal;
  value = 'ng';
  liveExecLog: any = {
    "buildPhase": {
      "processStatus": {
        "details": [],
        "processPercent": 0
      },
      "success": false,
      "complete": false
    },
    "joinPhase": {
      "processStatus": {
        "details": [],
        "processPercent": 0
      },
      "success": false,
      "complete": false
    },
    "dumpPhase": {
      "processStatus": {
        "details": [],
        "processPercent": 0
      },
      "success": false,
      "complete": false
    },
    "indexBackFlowPhaseStatus": {
      "processStatus": {
        "details": [],
        "processPercent": 0
      },
      "success": false,
      "complete": false,
    }
  };
  isSpinning = false;
  termVisible = false;
  progressStat: ProgressStat = new ProgressStat();
  dataxProcess = false;

  // private count: number = 1;
  constructor(tisService: TISService, modalService: NzModalService, notification: NzNotificationService
    , route: ActivatedRoute, private cd: ChangeDetectorRef) {
    super(tisService, route, modalService, notification);
    // ng-terminal说明文档
    // https://ng.ant.design/docs/introduce/zh
    this.cd.detach();
  }

  ngOnDestroy(): void {
    this.componentDestroy = true;
    if (this.msgSubject) {
      this.msgSubject.unsubscribe()
    }
  }

  cancelJob() {


    this.modalService.confirm({
      nzTitle: '确认',
      nzContent: `是否要终止当前任务执行`,
      nzOkText: '执行',
      nzCancelText: '取消',
      nzOnOk: () => {
        this.httpPost('/coredefine/corenodemanage.ajax', "event_submit_do_cancel_task=y&action=core_action&taskid=" + this.taskid)
          .then((r) => {
            if (r.success) {
             // this.successNotify(r.msg[0])
              this.progressStat = Object.assign(new ProgressStat(), r.bizresult);
            }
          });
      }
    });
  }

  ngAfterViewInit(): void {
  }

  ngOnInit(): void {

    let rdata = this.route.snapshot.data;
    this.showBreadcrumb = !!rdata['showBreadcrumb'];
    this.dataxProcess = !!rdata['datax'];
    let params = this.route.snapshot.params;

    // this.route.params
    //   .subscribe((params: Params) => {
    this.isSpinning = true;
    this.taskid = parseInt(params['taskid'], 10);

    let wfid = params['wfid'];
    if (this.dataxProcess) {
      this.buildTask = new BuildTask();
      this.buildTask.startPhase = 1;
      this.buildTask.endPhase = 1;
    }
    if (wfid) {
      this.httpPost('/coredefine/full_build_history.ajax'
        , `emethod=get_workflow&action=core_action&wfid=${wfid}&taskid=${this.taskid}`).then((r) => {
        let wf = r.bizresult.workflow;
        this.buildTask = Object.assign(new BuildTask(), r.bizresult.task);
        if (this.appNotAware) {
          this.breadcrumb = ['数据流', '/offline/wf', wf.name, `/offline/wf_update/${wf.name}`, '构建历史', `../`];
        } else {
          this.breadcrumb = ['构建历史', `../`];
        }
        this.cd.reattach();
      });
    } else {
      this.cd.reattach();
    }

    this.receiveTriggerFullBuildLog(this.taskid);
//      });
  }

  // 触发全量索引构建
  public receiveTriggerFullBuildLog(taskid: number): void {
    // 服务端生成了taskid
    this.msgSubject = <Subject<WSMessage>>this.tisService.wsconnect(`ws://${window.location.host}/tjs/download/logfeedback?taskid=${taskid}&logtype=build_status_metrics`)
      .pipe(map((response: MessageEvent) => {
        let json = JSON.parse(response.data);
        if (json.logType && json.logType === "FULL") {
          return new WSMessage('full', json);
        } else if (json.consuming) {
          // server side pojo: ExtendWorkFlowBuildHistory
          return new WSMessage('stat', json);
        } else {
          return new WSMessage('build_status_metrics', json);
        }
        // return new WSMessage('build_status_metrics', json);
      }));

    this.msgSubject.subscribe((response: WSMessage): void => {
      if (this.componentDestroy) {
        return;
      }
      // console.log(response.data);
      switch (response.logtype) {
        case "stat":
          this.progressStat = Object.assign(new ProgressStat(), response.data);
          // let now = Date.now();
          // console.log(`now:${this.progressStat.now}, createTime:${this.progressStat.createTime}`);
          this.consuming = this.progressStat.consumingTime;
          // 是否在执行中
          if (this.progressStat.state === 2 || this.progressStat.state === 22) {
            this.consumingTimer = setInterval(() => {
              this.consuming += 1000;
            }, 1000);
          } else if (this.consumingTimer) {
            // console.log("clearInterval");
            clearInterval(this.consumingTimer);
          }
          break;
        case "build_status_metrics":
          let status = response.data;
          this.liveExecLog.dumpPhase = status.dumpPhase;
          this.liveExecLog.joinPhase = status.joinPhase;
          this.liveExecLog.buildPhase = status.buildPhase;
          this.liveExecLog.indexBackFlowPhaseStatus
            = status.indexBackFlowPhaseStatus;
          break;
        case "full":
          // console.log(response.data);
          if (response.data.msg) {
            this.terminal.write(response.data.msg + "\r\n");
          }
          break;
        default:
          throw new Error(`logttype:${response.logtype} is illegal`);
      }
      this.cd.detectChanges();
      if (this.isSpinning) {
        this.isSpinning = false;
      }
    });
  }


  public stringify(o: any): string {
    return JSON.stringify(o);
  }

  protected initialize(app: CurrentCollection): void {

  }


  openReltimeLog() {
    this.termVisible = true;
    this.msgSubject.next(new WSMessage("full"));
  }

  termClose() {
    this.termVisible = false;
  }

  downloadLogFile() {
  }


}

class BuildTask {
  id: number;
  createTime: number;
  startPhase: number;
  endPhase: number;
  triggerType: number;

  inRange(phase: number): boolean {
    return phase >= this.startPhase && phase <= this.endPhase;
  }
}

class ProgressStat {
  consuming: string; // "4分钟"
  createTime: number; // 1594608772000
  endPhase: string; // "宽表构建"
  endTime: number; // 1594609013000
  id: number;
  literalState: string; // "成功"
  opTime: number; // 1594609012000
  startPhase: string; // "数据导出"
  startTime: number; // 1594608772000
  state: number; //
  stateClass: string; // "fa fa-check"
  stateColor: string; // "green"
  triggerType: string; // "手动"
  workFlowId: number; // 45
  // 当前时间
  now: number;

  get consumingTime(): number {
    let now = (this.state === 2) ? Date.now() : this.endTime;
    return (now - this.createTime);
  }

  // com.qlangtech.tis.assemble.ExecResult
  get running(): boolean {
    return this.state === 2 || this.state === 22;
  }
}

