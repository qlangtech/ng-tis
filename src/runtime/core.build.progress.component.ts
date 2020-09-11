import {AppFormComponent, CurrentCollection} from "../common/basic.form.component";
import {ActivatedRoute, Params} from "@angular/router";
import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, TemplateRef, ViewChild} from "@angular/core";
import {TISService} from "../service/tis.service";


import {NgTerminal} from "ng-terminal";
import {NzDrawerRef, NzDrawerService, NzModalService} from "ng-zorro-antd";
import {Observable, Subject} from "rxjs";
import {map} from 'rxjs/operators';


@Component({
  selector: 'tis-progress',
  template: `
      <dd class="progress">
          <nz-progress *ngIf="t.success" [nzPercent]="100"></nz-progress>
          <nz-progress *ngIf="!t.waiting && !t.complete" [nzPercent]="t.percent">{{t.percent}}%({{t.processed}}/{{t.all}})</nz-progress>
          <div *ngIf="t.waiting" class="waiting" ></div>
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
      <span *ngIf="t.success" class="badge badge-pill badge-success">
        <i class="fa fa-check"
           aria-hidden="true"></i>成功</span>
          <span *ngIf="t.faild" class="badge badge-pill badge-danger">
        <i class="fa fa-times"
           aria-hidden="true"></i>失败</span>
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
          <button nz-button (click)="openReltimeLog()">实时日志</button>
      </tis-page-header>
      <nz-spin [nzSpinning]="isSpinning" [nzDelay]="1000" nzSize="large">
          <div class="stat-header">
              <nz-descriptions nzBordered [nzSize]="'small'">
                  <nz-descriptions-item nzTitle="状态">
                      <i [ngClass]="progressStat.stateClass" [ngStyle]="{'color':progressStat.stateColor}" aria-hidden="true"></i>
                      <button nz-button nzType="link" (click)="openReltimeLog()">{{progressStat.literalState}}</button>
                      <span style="color: #000088;font-size: 24px"><i style="color: #bbb8db">耗时:</i>{{consuming | timeconsume }}</span>
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
                          <dt>{{t.name}}</dt>
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
                          <dt>{{t.name}}</dt>
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
                          <dt>{{t.name}}</dt>
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
                          <dt>{{t.name}}</dt>
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
              [nzBodyStyle]="{ height: 'calc(100% - 55px)', overflow: 'auto', 'padding-bottom': '53px' }"
              [nzMaskClosable]="false"
              [nzWidth]="'70%'"
              [nzVisible]="termVisible"
              nzTitle="执行日志"
              (nzOnClose)="termClose()"
      >
          <ng-terminal #term></ng-terminal>
      </nz-drawer>

  `,
  styles: [
      `
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

  // private count: number = 1;
  constructor(tisService: TISService, modalService: NzModalService
    , route: ActivatedRoute, private cd: ChangeDetectorRef) {
    super(tisService, route, modalService);
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

  ngAfterViewInit(): void {
    // this.invalidate();
    // this.child.keyEventInput.subscribe( e => {
    //   console.log('keyboard event:' + e.domEvent.keyCode + ', ' + e.key);
    //
    //   const ev = e.domEvent;
    //   const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;
    //
    //   if (ev.keyCode === 13) {
    //     this.child.write('\r\n$ ');
    //   } else if (ev.keyCode === 8) {
    //     // Do not delete the prompt
    //     if (this.child.underlying.buffer.cursorX > 2) {
    //       this.child.write('\b \b');
    //     }
    //   } else if (printable) {
    //     this.child.write(e.key);
    //   }
    // });
  }

  ngOnInit(): void {

    let rdata = this.route.snapshot.data;
    this.showBreadcrumb = !!rdata['showBreadcrumb'];
    this.route.params
      .subscribe((params: Params) => {
        this.isSpinning = true;
        let taskid: number = parseInt(params['taskid'], 10);

        let wfid = params['wfid'];
        if (wfid) {
          this.httpPost('/coredefine/full_build_history.ajax'
            , `emethod=get_workflow&action=core_action&wfid=${wfid}&taskid=${taskid}`).then((r) => {
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

        this.receiveTriggerFullBuildLog(taskid);
      });
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
      switch (response.logtype) {
        case "stat":
          this.progressStat = Object.assign(new ProgressStat(), response.data);
          // let now = Date.now();
          // console.log(`now:${this.progressStat.now}, createTime:${this.progressStat.createTime}`);
          this.consuming = this.progressStat.consumingTime;
          // 是否在执行中
          if (this.progressStat.state === 2) {
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
          this.terminal.write(response.data.msg + "\r\n");
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
    // this.httpPost('/coredefine/corenodemanage.ajax?action=core_action&emethod=get_view_data', '')
    //   .then((r) => {
    //     if (r.success) {
    //       this.app = r.bizresult.app;
    //       this.config = r.bizresult.config;
    //       this.instanceDirDesc = r.bizresult.instanceDirDesc;
    //     }
    //   });
  }


  openReltimeLog() {
    this.termVisible = true;
    this.msgSubject.next(new WSMessage("full"));
    // this.tisService.wsconnect(`ws://${window.location.host}/tjs/download/logfeedback?taskid=${taskid}&logtype=full`)
    //   .subscribe((response: MessageEvent): void => {});
  }

  termClose() {
    this.termVisible = false;
  }
}

export class WSMessage {
  constructor(public logtype: string, public data?: any) {

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
}

