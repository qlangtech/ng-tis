import {AfterViewInit, Component, Input, NgZone, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {NgTerminal} from "ng-terminal";
import {EventSourceSubject, EventType, ExecuteStep, MessageData, TISService} from "./tis.service";
import {NzStatusType} from "ng-zorro-antd/steps/steps.component";
import {ScalaLog} from "../runtime/misc/RCDeployment";
import {NzDrawerRef, NzDrawerService} from "ng-zorro-antd/drawer";
import {HeteroList} from "./tis.plugin";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {Subscription} from "rxjs";
import {CreateLaunchingTarget, DataxWorkerAddStep3Component} from "../base/datax.worker.add.step3.component";

export function openWaittingProcessComponent(drawerService: NzDrawerService, subject: EventSourceSubject, launchTarget?: CreateLaunchingTarget): NzDrawerRef {
  let ctParams = {"obserable": subject};
  if (launchTarget) {
    ctParams["launchTarget"] = launchTarget;
  }
  const drawerRef = drawerService.create<LaunchK8SClusterWaittingProcessComponent, {}, {}>({
    nzWidth: "60%",
    nzHeight: "100%",
    nzPlacement: "right",
    nzContent: LaunchK8SClusterWaittingProcessComponent,
    nzContentParams: ctParams,
    nzClosable: false,
    nzMaskClosable: false
  });
  return drawerRef;
}

/**
 * private _zone: NgZone
 */
@Component({
  selector: "k8s-cluster-launching",
  template: `
    <nz-spin [nzSpinning]="this.formDisabled" nzSize="large">
      <nz-page-header [nzGhost]="true">
        <nz-page-header-title>
          <ng-container [ngSwitch]="execStatus">
              <span *ngSwitchCase="'error'" nz-icon nzType="close-circle" [nzTheme]="'twotone'" nzTheme="outline"
                    [nzTwotoneColor]="'#e30000'"></span>
            <span *ngSwitchCase="'finish'" nz-icon [nzType]="'check-circle'" [nzTheme]="'twotone'"
                  [nzTwotoneColor]="'#52c41a'"></span>
            <span *ngSwitchCase="'process'" nz-icon [nzType]="'sync'" [nzSpin]="true"></span>
          </ng-container>
          启动执行状态
        </nz-page-header-title>
        <nz-page-header-extra>
          <button nz-button nzType="primary" *ngIf="!this.errScalaLog && this.execStatus === 'error'"
                  (click)="reExecute()">
            <span nz-icon nzType="reload" nzTheme="outline"></span> 重新执行
          </button>
          <button nz-button (click)="closeDrawer()">
            <span nz-icon nzType="close-circle" nzTheme="outline"></span>关闭
          </button>
        </nz-page-header-extra>
        <nz-page-header-content>
          <div nz-row class="item-block">
            <div nz-col nzSpan="8" class="process-height">
              <nz-steps nzDirection="vertical" [nzStatus]="execStatus" [nzCurrent]="index"
                        (nzIndexChange)="onIndexChange($event)">
                <!--nzIcon="loading"-->
                <nz-step *ngFor="let step of execSteps" [nzTitle]="step.name" [nzIcon]="step.processIcon"
                         [nzDescription]="step.describe"></nz-step>
              </nz-steps>
            </div>
            <div nz-col nzSpan="16" class="process-height">

              <ng-terminal  #term></ng-terminal>

            </div>
          </div>
        </nz-page-header-content>
      </nz-page-header>
    </nz-spin>


  `
  , styles: [
    `
      .process-height {
        height: 800px
      }

      nz-page-header {
        padding: 0 0 0 20px;
      }
    `
  ]
})
export class LaunchK8SClusterWaittingProcessComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('term', {static: true}) terminal: NgTerminal;
  @Input()
  obserable: EventSourceSubject;

  execSteps: Array<ExecuteStep> = [];

  _execStatus: NzStatusType;
  _currentExecIndex: number = -1;
  formDisabled: boolean = true;

  @Input()
  launchTarget: CreateLaunchingTarget = new CreateLaunchingTarget("datax_action", "relaunch_datax_worker");

  @Input()
  errScalaLog: ScalaLog;

  constructor(private drawer: NzDrawerRef<{ hetero: HeteroList }>
    , protected tisService: TISService, public _zone: NgZone, private notification: NzNotificationService) {
  }

  get execStatus(): NzStatusType {
    if (!this._execStatus && this.execSteps.length > 0) {
      let execStep: ExecuteStep = null;
      let allComplete = true;
      // console.log(this.execSteps);
      for (let i = 0; i < this.execSteps.length; i++) {
        execStep = this.execSteps[i];
        if (execStep.complete) {
          if (!execStep.success) {
            this.execSteps.forEach((s) => s._processing = false);
            return this._execStatus = 'error'

          }
        } else {
          allComplete = false;
        }
      }
      return this._execStatus = allComplete ? 'finish' : 'process';
    }
    return this._execStatus;
  }

  get index(): number {
    let execStepsLength = this.execSteps.length;
    if (this._currentExecIndex < 0 && execStepsLength > 0) {
      let execStep: ExecuteStep = null;
      try {
        for (let i = execStepsLength - 1; i >= 0; i--) {
          execStep = this.execSteps[i];
          if (execStep.complete) {
            this._currentExecIndex = i;
            // 设置当前步骤的后一步为执行的状态
            if (execStep.success && (i + 1) <= (execStepsLength - 1)) {
              this.execSteps.forEach((s) => s._processing = false);
              this.execSteps[i + 1]._processing = true;
            }
            return this._currentExecIndex;
          }
        }
      } catch (e) {
        throw e;
      }
      return this._currentExecIndex = 0;
    }
    return this._currentExecIndex;
  }

  private subscript: Subscription;

  ngAfterViewInit(): void {
    if (this.errScalaLog) {
      // console.log(this.errScalaLog);
      //this._zone.runOutsideAngular(()=>{


      // throw new Error("errScalaLog shall not be empty");
      this.errScalaLog.logs.forEach((log) => {
        if (log) {
          this.terminal.write(log.msg + "\r\n");
        }
      });
      //});

    }
  }


  reExecute() {
    this.subscript.unsubscribe();
    this.obserable.close();
    this.resortInitState();
    this.execSteps = [];
    this.formDisabled = true;
    this.obserable = DataxWorkerAddStep3Component.createLaunchingEventSubject(
      this.launchTarget
      , this.tisService, this.obserable.targetResName);
    this.ngOnInit();
  }

  ngOnInit(): void {
    // console.log(this.obserable);
    if (!this.obserable) {
      this.formDisabled = false;
      if (this.errScalaLog) {
        this._execStatus = this.errScalaLog.faild ? 'error' : 'finish';
        this.execSteps = [];
        this.errScalaLog.milestones.forEach((mile) => {
          let et = new ExecuteStep();
          et.success = mile.success;
          et.name = mile.name;
          et.complete = mile.complete;
          et.describe = mile.describe;
          this.execSteps.push(et);
        });
      }
      return;
    }
    this.subscript = this.obserable.events.subscribe((msg: [EventType, Array<ExecuteStep> | MessageData | ExecuteStep | Event]) => {
     // console.log(msg);
      // console.log(msg[1]);

      switch (msg[0]) {
        case EventType.LOG_MESSAGE:
          let msgLog: MessageData = <MessageData>msg[1];
          this.terminal.write(msgLog.msg + "\r\n");
          break;
        case EventType.TASK_EXECUTE_STEPS:
          let steps = <Array<ExecuteStep>>msg[1];
          let copys = [];
          for (let i = 0; i < steps.length; i++) {
            copys.push(Object.assign(new ExecuteStep(), steps[i]));
          }
          this.execSteps = copys;
          this.formDisabled = false;
          break;
        case EventType.TASK_MILESTONE:

          let execStep = Object.assign(new ExecuteStep(), <ExecuteStep>msg[1]);
          let idxOf = this.execSteps.findIndex((s) => s.name === execStep.name);

          if (idxOf > -1) {
            this.execSteps[idxOf] = execStep;
            this.resortInitState();
          }
          // console.log([execStep, idxOf, this.execStatus, this.index])
          break;
        case  EventType.SSE_CLOSE:
          // console.log(msg);
          this.formDisabled = false;
          let evt = <Event> msg[1];
          if (evt) {

            let ref = this.notification.info("启动流程结束", "可以关闭'启动执行状态'对话框拉");
            ref.onClose.subscribe((_) => {
              //  this.closeDrawer();
            });
          }


          break;
        default:
          throw new Error("err event type:" + msg[0]);
      }
    }, (err) => {
      console.log(err);
    });
  }

  private resortInitState() {
    this._currentExecIndex = -1;
    this._execStatus = undefined;
    this.execStatus;
    this.index;
  }

  ngOnDestroy(): void {
    if (this.subscript) {
      this.subscript.unsubscribe();
    }
  }

  active(event: any) {
  }

  onIndexChange($event: number) {

  }

  closeDrawer() {
    this.drawer.close(this.execStatus);
  }


}
