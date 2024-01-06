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

import {
  AfterContentInit,
  AfterViewInit,
  Component,
  EventEmitter,
  Input, NgZone,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from "@angular/core";
import {EventSourceSubject, EventType, ExecuteStep, MessageData, TISService} from "../common/tis.service";
import {BasicFormComponent, CurrentCollection} from "../common/basic.form.component";


import {NzModalService} from "ng-zorro-antd/modal";
import {NzNotificationService} from "ng-zorro-antd/notification";

import {K8SReplicsSpecComponent} from "../common/k8s.replics.spec.component";
import {DataxWorkerDTO, ScalaLog} from "../runtime/misc/RCDeployment";
import {DataxWorkerComponent, PowerjobCptType} from "./datax.worker.component";
import {NzDrawerRef, NzDrawerService} from "ng-zorro-antd/drawer";
import {NgTerminal} from "ng-terminal";
import {Subscription} from "rxjs";
import {HeteroList} from "../common/tis.plugin";
import {NzStatusType} from "ng-zorro-antd/steps/steps.component";


@Component({
  selector: 'k8s-res-config',
  template: `
    <ng-container *ngIf="displayHeader">
      <tis-steps [type]="this.dto.processMeta.stepsType" [step]="3"></tis-steps>
      <tis-page-header [showBreadcrumb]="false">
        <tis-header-tool>
          <button nz-button nzType="default" [disabled]="formDisabled" (click)="prestep()">上一步</button>&nbsp;
          <button [disabled]="formDisabled" nz-button nzType="primary" (click)="launchK8SController()">
            <i nz-icon
               nzType="rocket"
               nzTheme="outline"></i>启动
          </button>
        </tis-header-tool>
      </tis-page-header>
    </ng-container>

    <ng-container *ngFor="let cpt of dto.processMeta.confirmStepCpts">
      <nz-page-header *ngIf="cpt.cptShow(dto)" [nzGhost]="true">
        <nz-page-header-title>{{cpt.cptType.toString()}}</nz-page-header-title>

        <nz-page-header-content>
          <h4>基本配置</h4>
          <div class="item-block">

            <tis-plugins [formControlSpan]="20" [shallInitializePluginItems]="false"
                         [plugins]="[{name: 'datax-worker', require: true,extraParam:'dataxName_'+ cpt.cptType}]"
                         [disabled]="true" [showSaveButton]="false"></tis-plugins>
          </div>
          <ng-container *ngTemplateOutlet="cpuMemorySpec;context:{spec:cpt.cpuMemorySpecGetter(dto)}">

          </ng-container>

        </nz-page-header-content>


      </nz-page-header>
    </ng-container>
    <ng-template #cpuMemorySpec let-spec='spec'>
      <ng-container *ngIf="spec">
        <h4>资源规格</h4>
        <div class="item-block">
          <k8s-replics-spec [rcSpec]="spec" [disabled]="true" [labelSpan]="5"></k8s-replics-spec>
        </div>
      </ng-container>
    </ng-template>

    <!--      <nz-page-header [nzGhost]="true">-->
    <!--          <nz-page-header-title>PowerJob-Server</nz-page-header-title>-->


    <!--          <nz-page-header-content>-->
    <!--              <h4>基本配置</h4>-->
    <!--              <div class="item-block">-->

    <!--                  <tis-plugins [formControlSpan]="20" [shallInitializePluginItems]="false"-->
    <!--                               [plugins]="[{name: 'datax-worker', require: true,extraParam:'dataxName_'+ PowerjobCptType.Server}]"-->
    <!--                               [disabled]="true" [showSaveButton]="false"></tis-plugins>-->
    <!--              </div>-->
    <!--              <ng-container *ngIf="!dto.usingPowderJobUseExistCluster">-->
    <!--                  <h4>资源规格</h4>-->
    <!--                  <div class="item-block">-->
    <!--                      <k8s-replics-spec [rcSpec]="this.dto.powderJobServerRCSpec" [disabled]="true"-->
    <!--                                        [labelSpan]="5"></k8s-replics-spec>-->
    <!--                  </div>-->
    <!--              </ng-container>-->
    <!--          </nz-page-header-content>-->


    <!--      </nz-page-header>-->


    <!--      <ng-container *ngIf="!dto.usingPowderJobUseExistCluster">-->

    <!--          <nz-page-header [nzGhost]="true">-->
    <!--              <nz-page-header-title>PowerJob-Worker</nz-page-header-title>-->
    <!--              <nz-page-header-content>-->
    <!--                  <h4>基本配置</h4>-->
    <!--                  <div class="item-block">-->
    <!--                      <tis-plugins [formControlSpan]="20" [shallInitializePluginItems]="false"-->
    <!--                                   [plugins]="[{name: 'datax-worker', require: true,extraParam:'dataxName_'+ PowerjobCptType.Worker}]"-->
    <!--                                   [disabled]="true"-->
    <!--                                   [showSaveButton]="false"-->
    <!--                      ></tis-plugins>-->
    <!--                  </div>-->
    <!--                  <h4>资源规格</h4>-->
    <!--                  <div class="item-block">-->
    <!--                      <k8s-replics-spec [rcSpec]="this.dto.powderJobWorkerRCSpec" [disabled]="true"-->
    <!--                                        [labelSpan]="5"></k8s-replics-spec>-->
    <!--                  </div>-->
    <!--              </nz-page-header-content>-->
    <!--          </nz-page-header>-->
    <!--      </ng-container>-->

    <!--      <nz-page-header [nzGhost]="true">-->
    <!--          <nz-page-header-title>PowerJob-Job</nz-page-header-title>-->
    <!--          <nz-page-header-content>-->
    <!--              <h4>基本配置</h4>-->
    <!--              <div class="item-block">-->
    <!--                  <tis-plugins [formControlSpan]="20" [shallInitializePluginItems]="false"-->
    <!--                               [plugins]="[{name: 'datax-worker', require: true,extraParam:'dataxName_'+ PowerjobCptType.JobTpl}]"-->
    <!--                               [disabled]="true"-->
    <!--                               [showSaveButton]="false"-->
    <!--                  ></tis-plugins>-->
    <!--              </div>-->
    <!--          </nz-page-header-content>-->
    <!--      </nz-page-header>-->


    <!--      <ng-container *ngIf="dto.processMeta.supportK8SReplicsSpecSetter">-->
    <!--      </ng-container>-->
  `
  , styles: [
    `
    `]
})
export class DataxWorkerAddStep3Component extends BasicFormComponent implements AfterViewInit, OnInit, OnDestroy {
  savePlugin = new EventEmitter<any>();
  @ViewChild('k8sReplicsSpec', {read: K8SReplicsSpecComponent, static: true}) k8sReplicsSpec: K8SReplicsSpecComponent;
  @Output() nextStep = new EventEmitter<any>();
  @Output() preStep = new EventEmitter<any>();
  @Input() dto: DataxWorkerDTO;

  @Input() displayHeader = true;

  constructor(tisService: TISService, modalService: NzModalService, notification: NzNotificationService, private drawerService: NzDrawerService) {
    super(tisService, modalService, notification);
  }

  ngOnInit(): void {
    // console.log(this.dto);
    if (this.dto.processMeta.supportK8SReplicsSpecSetter && !this.dto.usingPowderJobUseExistCluster && !this.dto.primaryRCSpec) {
      throw new Error("rcSpec can not be null");
    }

    let appTisService: TISService = this.tisService;
    // console.log(this.dto);
    appTisService.currentApp = new CurrentCollection(0, this.dto.processMeta.targetName);

  }

  get currentApp(): CurrentCollection {
    // console.log(this.dto.processMeta);
    return new CurrentCollection(0, this.dto.processMeta.targetName);
  }

  // private drawerRef: NzDrawerRef<LaunchK8SClusterWaittingProcessComponent>


  launchK8SController() {
    // console.log(this.dto);
    let subject = DataxWorkerAddStep3Component.createLaunchingEventSubject(this.dto.processMeta.launchClusterMethod, this.tisService, this.dto.processMeta.targetName);


    const drawerRef = this.drawerService.create<LaunchK8SClusterWaittingProcessComponent, {}, {}>({
      nzWidth: "60%",
      nzHeight: "100%",
      nzPlacement: "right",
      nzContent: LaunchK8SClusterWaittingProcessComponent,
      nzContentParams: {"obserable": subject},
      nzClosable: false,
      nzMaskClosable: false
    });

    drawerRef.afterClose.subscribe((status: NzStatusType) => {
      subject.close();
      if (status === 'finish') {
        this.successNotify("已经成功在K8S集群中启动" + this.dto.processMeta.pageHeader);
        // let dataXWorkerStatus: DataXJobWorkerStatus
        //   = Object.assign(new DataXJobWorkerStatus(), r.bizresult, {'processMeta': this.dto.processMeta});

        DataxWorkerComponent.getJobWorkerMeta(this, this.dto.processMeta)
          .then((dataXWorkerStatus) => {
            this.nextStep.emit(dataXWorkerStatus);
          });


      }
    })

    // let e = new SavePluginEvent();
    // e.notShowBizMsg = true;
    //
    // this.jsonPost(`/coredefine/corenodemanage.ajax?action=datax_action&emethod=launch_datax_worker&targetName=${this.dto.processMeta.targetName}`
    //   , {'usingPowderJobUseExistCluster': this.dto.usingPowderJobUseExistCluster}, e)
    //   .then((r) => {
    //     if (r.success) {
    //       this.successNotify("已经成功在K8S集群中启动" + this.dto.processMeta.pageHeader);
    //       let dataXWorkerStatus: DataXJobWorkerStatus
    //         = Object.assign(new DataXJobWorkerStatus(), r.bizresult, {'processMeta': this.dto.processMeta});
    //       this.nextStep.emit(dataXWorkerStatus);
    //     }
    //   });
  }

  /**
   * 'launch_datax_worker'
   * @param targetMethodName
   * @param tisService
   * @param targetName
   */
  public static createLaunchingEventSubject(targetMethodName: string, tisService: TISService, targetName: string, extraParams?: string): EventSourceSubject {
    let sseUrl = `/coredefine/corenodemanage.ajax?resulthandler=exec_null&action=datax_action&emethod=${targetMethodName}&targetName=${targetName}`;
    if (extraParams) {
      sseUrl += ('&' + extraParams);
    }
    return tisService.createEventSource(targetName, sseUrl);

  }

  ngOnDestroy(): void {
  }

  protected initialize(app: CurrentCollection): void {
    // console.log(app);
  }

  ngAfterViewInit() {
  }


  prestep() {
    this.preStep.next(this.dto);
  }

  public readonly PowerjobCptType = PowerjobCptType;
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
          <button nz-button nzType="primary" *ngIf="!this.errScalaLog&&this.execStatus === 'error'"
                  (click)="reExecute()">
            重新执行
          </button>
          <button nz-button (click)="closeDrawer()">
            关闭
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

              <ng-terminal #term></ng-terminal>

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
  errScalaLog: ScalaLog;

  constructor(private drawer: NzDrawerRef<{ hetero: HeteroList }>, protected tisService: TISService, public _zone: NgZone) {
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
      "relaunch_datax_worker", this.tisService, this.obserable.targetResName);
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
    this.subscript = this.obserable.events.subscribe((msg: [EventType, Array<ExecuteStep> | MessageData | ExecuteStep]) => {
      // console.log(msg[0]);
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

