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

import {AfterViewInit, Component, EventEmitter, Input, NgZone, OnInit, Output, ViewChild} from "@angular/core";
import {EventSourceSubject, EventType, ExecuteStep, MessageData, TISService} from "../common/tis.service";
import {AppFormComponent, BasicFormComponent, CurrentCollection, WSMessage} from "../common/basic.form.component";
import {ActivatedRoute, ActivatedRouteSnapshot, Router} from "@angular/router";
import {NzModalService} from "ng-zorro-antd/modal";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {Observable, Subject} from "rxjs";
import {
  DataXJobWorkerStatus,
  DataxWorkerDTO,
  K8sPodState,
  LogType,
  PowerJobWorkflow,
  ProcessMeta,
  RCDeployment,
  RcHpaStatus
} from "../runtime/misc/RCDeployment";
import {ControlPanelComponent} from "../common/control.panel.component";
import {Pager} from "../common/pagination.component";
import {DataxWorkerAddStep0Component} from "./datax.worker.add.step0.component";

import {debounceTime, map} from 'rxjs/operators';
import {CreateLaunchingTarget, DataxWorkerAddStep3Component} from "./datax.worker.add.step3.component";
import {NzProgressStatusType} from "ng-zorro-antd/progress/typings";
import {NzDrawerService} from "ng-zorro-antd/drawer";
import {dataXWorkerCfg} from "./base.manage-routing.module";
import {NzTabSetComponent} from "ng-zorro-antd/tabs/tabset.component";
import {LaunchK8SClusterWaittingProcessComponent} from "../common/launch.waitting.process.component";
import {DataxWorkerComponent} from "./datax.worker.component";
import {KEY_APPNAME} from "../common/plugin/type.utils";

@Component({
  template: `
    <nz-spin size="large" [nzSpinning]="this.formDisabled">


      <nz-tabset nzSize="large" [(nzSelectedIndex)]="tabSelectIndex" [nzTabBarExtraContent]="extraTemplate"
                 #tabsetComponent>
        <ng-container *ngIf="dto.rcDeployment?.status">
          <nz-tab [nzTitle]="profileTitle" (nzSelect)="profileTabSelect()">
            <ng-template nz-tab>
              <div style="margin-top: 8px;"
                   *ngTemplateOutlet="promoteServerHost;context:{server_port_host:this.dto.payloads['server_port_host']}">
              </div>

              <pod-list *ngFor="let rc of dto.rcDeployments" [rcDeployment]="rc"
                        [processMeta]="dto.processMeta" (viewLog)="gotoViewLog($event)"></pod-list>


              <!--
                  <nz-alert *ngIf="this.dto.incrProcessLaunchHasError" nzType="error" [nzDescription]="errorTpl" nzShowIcon></nz-alert>
                  <ng-template #errorTpl>
                      增量处理节点启动有误
                      <button nz-button nzType="link" (click)="tabSelectIndex=2">查看启动日志</button>
                  </ng-template>
                  <incr-build-step4-running-tab-base [msgSubject]="msgSubject" [dto]="dto"></incr-build-step4-running-tab-base>
              -->
            </ng-template>
          </nz-tab>
          <nz-tab [nzTitle]="specificationTitle" (nzSelect)="envTabSelect()">
            <ng-template nz-tab>
              <rc-spec *ngFor="let rc of dto.rcDeployments" [rcDeployment]="rc"></rc-spec>
            </ng-template>

            <nz-descriptions class="desc-block" nzTitle="配置" nzBordered>
              <nz-descriptions-item
                nzTitle="Docker Image">{{dto.rcDeployment.dockerImage}}</nz-descriptions-item>
              <nz-descriptions-item
                nzTitle="创建时间">{{dto.rcDeployment.creationTimestamp | date : "yyyy/MM/dd HH:mm:ss"}}</nz-descriptions-item>
            </nz-descriptions>
            <nz-descriptions class="desc-block" nzTitle="当前状态" nzBordered>
              <nz-descriptions-item
                nzTitle="availableReplicas">{{dto.rcDeployment.status.availableReplicas}}</nz-descriptions-item>
              <nz-descriptions-item
                nzTitle="fullyLabeledReplicas">{{dto.rcDeployment.status.fullyLabeledReplicas}}</nz-descriptions-item>
              <nz-descriptions-item
                nzTitle="observedGeneration">{{dto.rcDeployment.status.observedGeneration}}</nz-descriptions-item>
              <nz-descriptions-item
                nzTitle="readyReplicas">{{dto.rcDeployment.status.readyReplicas}}</nz-descriptions-item>
              <nz-descriptions-item
                nzTitle="replicas">{{dto.rcDeployment.status.replicas}}</nz-descriptions-item>
            </nz-descriptions>
            <nz-descriptions class="desc-block" nzTitle="资源分配" nzBordered>
              <nz-descriptions-item nzTitle="CPU">
                <nz-tag>request</nz-tag>
                {{dto.rcDeployment.cpuRequest.val + dto.rcDeployment.cpuRequest.unit}}
                <nz-tag>limit</nz-tag>
                {{dto.rcDeployment.cpuLimit.val + dto.rcDeployment.cpuLimit.unit}}
              </nz-descriptions-item>
              <nz-descriptions-item nzTitle="Memory">
                <nz-tag>request</nz-tag>
                {{dto.rcDeployment.memoryRequest.val + dto.rcDeployment.memoryRequest.unit}}
                <nz-tag>limit</nz-tag>
                {{dto.rcDeployment.memoryLimit.val + dto.rcDeployment.memoryLimit.unit}}
              </nz-descriptions-item>
            </nz-descriptions>
            <nz-descriptions class="desc-block" nzTitle="环境变量" nzBordered>
              <nz-descriptions-item *ngFor=" let e of  dto.rcDeployment.envs | keyvalue"
                                    [nzTitle]="e.key">{{e.value}}</nz-descriptions-item>
            </nz-descriptions>


          </nz-tab>
          <nz-tab nzTitle="日志" (nzSelect)="logtypeSelect()">
            <ng-template nz-tab>

              <incr-pod-logs-status *ngIf="selectedPod" [selectedPod]="selectedPod"
                                    [processMeta]="this.dto.processMeta" [rcDeployments]="dto.rcDeployments"
                                    [msgSubject]="this.msgSubject"
                                    [logType]="logtype"
                                    (afterOnePodRelaunch)="logsStatusOnePodLauch()"></incr-pod-logs-status>
            </ng-template>
          </nz-tab>
        </ng-container>
        <nz-tab nzTitle="实例" *ngIf="dto.processMeta.runningStepCfg.showPowerJobWorkflowInstance"
                (nzSelect)="workflowSelect()">
          <ng-template nz-tab>
            <div
              *ngTemplateOutlet="promoteServerHost;context:{server_port_host:this.dto.payloads['server_port_host']}">
            </div>
            <tis-page [rows]="workflows" [pager]="pager" (go-page)="gotoPage($event)">

              <tis-col title="工作流ID/名称" width="14">
                <ng-template let-u='r'>
                  <strong>{{u.id}}</strong>/<a [routerLink]="['/x',u.wfName,'app_build_history']">{{u.wfName}}</a>
                </ng-template>
              </tis-col>
              <tis-col title="定时信息" width="14">
                <ng-template let-u='r'>
                  <button nz-button  nzType="dashed"><span nz-icon nzType="clock-circle" nzTheme="outline"></span>{{u.cronInfo}}</button>
                </ng-template>

              </tis-col>
              <tis-col title="状态">
                <ng-template let-u='r'>
                  <nz-switch [nzDisabled]="true" [ngModel]="u.enable" nzCheckedChildren="开"
                             nzUnCheckedChildren="关"></nz-switch>
                </ng-template>
              </tis-col>
              <tis-col title="创建时间">
                <ng-template let-u='r'>{{u.gmtCreate|date : "yyyy/MM/dd HH:mm:ss"}}
                </ng-template>
              </tis-col>
              <tis-col title="更新时间">
                <ng-template let-u='r'>{{u.gmtModified|date : "yyyy/MM/dd HH:mm:ss"}}
                </ng-template>
              </tis-col>
              <tis-col title="操作">
                <ng-template let-u='r'>
                  <button nz-button nzType="link"
                          (click)="startPowerJobTplAppOverwrite(u)"><span nz-icon nzType="edit"
                                                                          nzTheme="outline"></span>编辑
                  </button>
                  <button nz-button nzType="link"
                          (click)="deletePowerJobAppOverwrite(u)"><span nz-icon nzType="delete"
                                                                        nzTheme="outline"></span>删除
                  </button>
                </ng-template>
              </tis-col>
            </tis-page>

          </ng-template>
        </nz-tab>

        <nz-tab [nzTitle]="cfgTitle" (nzSelect)="k8sResConfigSelect()">
          <ng-template nz-tab>
            <k8s-res-config *ngIf="workerCfg" [dto]="workerCfg" [displayHeader]="false"></k8s-res-config>
          </ng-template>
        </nz-tab>
        <nz-tab [nzTitle]="controller" (nzSelect)="manageSelect()">

          <control-prompt panelType="danger-delete" [procDesc]="this.dto.processMeta.pageHeader"
                          (controlClick)="dataXWorkerDelete($event)"></control-prompt>

          <!--                  <nz-page-header class="danger-control-title" nzTitle="危险操作" nzSubtitle="以下操作可能造成某些组件功能不可用">-->
          <!--                  </nz-page-header>-->
          <!--                  <nz-list class="ant-advanced-search-form" nzBordered>-->
          <!--                      <nz-list-item>-->
          <!--                          <span nz-typography>删除{{this.dto.processMeta.pageHeader}}</span>-->
          <!--                          <button nz-button nzType="primary" (click)="dataXWorkerDelete()" nzDanger><i nz-icon nzType="delete" nzTheme="outline"></i>删除</button>-->
          <!--                      </nz-list-item>-->
          <!--                  </nz-list>-->
        </nz-tab>


      </nz-tabset>
      <ng-template #promoteServerHost let-server_port_host="server_port_host">
        <nz-alert style="margin: 8px;" *ngIf="server_port_host" nzType="info" [nzDescription]="unableToUseK8SController"
                  nzShowIcon>

          <ng-template #unableToUseK8SController>

            可直接打开{{this.dto.processMeta.pageHeader}}控制台 &nbsp;<a target="_blank" [href]="server_port_host"><i
            nz-icon nzType="link" nzTheme="outline"></i>控制台</a>
          </ng-template>
        </nz-alert>

      </ng-template>
      <ng-template #profileTitle>
        <span nz-icon [nzType]="dto.processMeta.endType" nzTheme="outline"></span>基本
      </ng-template>
      <ng-template #cfgTitle>
        <span nz-icon nzType="file" nzTheme="outline"></span>配置
      </ng-template>
      <ng-template #specificationTitle>
        <span nz-icon nzType="ordered-list" nzTheme="outline"></span>规格
      </ng-template>


      <ng-template #controller>
        <span nz-icon nzType="setting" nzTheme="outline"></span>操作
      </ng-template>
      <ng-template #extraTemplate>
        <button nz-button nzType="link" (click)="refreshStatus()"><i nz-icon nzType="sync" nzTheme="outline"></i>更新
        </button>
      </ng-template>
    </nz-spin>
  `
  , styles: [
    `   .h2-header {
      padding: 3px;
      background-color: #e1e1e1;
    }

    .desc-block {
      margin-top: 20px;
    }

    .danger-control-title {
      margin-top: 10px;
      padding: 0px 0;
    }

    .ant-advanced-search-form {
      padding: 10px;
      #background: #fbfbfb;
      border: 2px solid #d97f85;
      border-radius: 6px;
      margin-bottom: 10px;
      clear: both;
    }
    `]
})
export class DataxWorkerRunningComponent extends AppFormComponent implements AfterViewInit, OnInit {
  // savePlugin = new EventEmitter<any>();
  // @ViewChild('k8sReplicsSpec', {read: K8SReplicsSpecComponent, static: true}) k8sReplicsSpec: K8SReplicsSpecComponent;
  @Output() nextStep = new EventEmitter<any>();
  @Output() preStep = new EventEmitter<any>();
  // @Input() dto: DataxWorkerDTO;
  @ViewChild('tabsetComponent', {static: false}) tabsetComponent: NzTabSetComponent;
  msgSubject: Subject<WSMessage>;
  dto: DataXJobWorkerStatus = new DataXJobWorkerStatus();
  tabSelectIndex = 0;
  selectedPod: K8sPodState = null;
  logtype = LogType.DATAX_WORKER_POD_LOG;

  workerCfg: DataxWorkerDTO;


  podNameSub;

  /**
   * ========================
   */
  pager: Pager = new Pager(1, 2);
  workflows: PowerJobWorkflow[] = [];


  constructor(tisService: TISService, route: ActivatedRoute, modalService: NzModalService, public router: Router, notification: NzNotificationService, public _zone: NgZone) {
    super(tisService, route, modalService, notification);
  }

  refreshStatus() {
    this.reloadStatus().then((status) => {
      this.successNotify(this.dto.processMeta.pageHeader + "状态已更新");
    });
  }

  private reloadStatus(): Promise<DataXJobWorkerStatus> {
    return DataxWorkerComponent.getJobWorkerMeta(this, this.route.snapshot.params, this.dto.processMeta)
      .then((dataXWorkerStatus) => {
        if (dataXWorkerStatus.k8sReplicationControllerCreated) {
          //  Object.assign(this.dto,dataXWorkerStatus)
          for (let key in dataXWorkerStatus) {
            this.dto[key] = dataXWorkerStatus[key];
          }
          return dataXWorkerStatus;
        }
      });
  }

  logsStatusOnePodLauch() {

    this.reloadStatus().then(status => {
      this.router.navigate(["."], {relativeTo: this.route, fragment: "profile"});
      this.tabSelectIndex = 0;
    })

  }

  public gotoPage(page: number): void {
    // this.tisService._zone.runOutsideAngular(()=>{
    this.httpPost('/coredefine/corenodemanage.ajax'
      , 'action=datax_action&emethod=get_all_powerjob_workflow_record&page=' + page)
      .then((r) => {
        if (r.success) {
          this.workflows = r.bizresult.rows;
          this.pager = new Pager(r.bizresult.curPage, r.bizresult.totalPage);
        }
      });
    // })

  }

  get currentApp(): CurrentCollection {
    return new CurrentCollection(0, this.dto.processMeta.targetNameGetter(this.route.snapshot.params));
  }

  ngOnInit(): void {
    // super.ngOnInit();
    // console.log("==========================");
    let params = this.route.snapshot.params;
    this.route.fragment.subscribe((fragment) => {
      let targetTab = fragment;//['targetTab'];
      //console.log(targetTab);
      switch (targetTab) {
        case 'log':
          if (!this.podNameSub) {
            this.podNameSub = this.route.queryParams.subscribe((query) => {
              //  console.log(`podName:${podName}`);
              let podName = query['pod']
              // console.log(`podName:${podName}`);
              // if (this.route.snapshot.params['targetTab'] !== 'log') {
              //   return;
              // }
              if (!this.selectedPod) {
                // 取得容器第一个pod
                let pods = this.dto.rcDeployment.pods;
                if (pods.length < 1) {
                  this.errNotify("容器还未分配Pod资源");
                  return;
                }
                this.selectedPod = pods[0];
              }
              // console.log(this.selectedPod);
              if (!!podName && podName !== this.selectedPod.name) {
                this.selectedPod = this.dto.findPod(podName);//.pods.find((pp) => (pp.name === podName));
                if (!this.selectedPod) {
                  throw new Error("can not find podName:" + podName + " in:" + this.dto.rcDeployment.pods.map((pp) => pp.name).join(","));
                }
              }
              let logtype = this.logtype + ":" + this.selectedPod.name;
              if (!this.msgSubject) {
                this.msgSubject = this.getWSMsgSubject(logtype);
              } else {
                this.msgSubject.next(new WSMessage(logtype));
              }
              // this.tabSelectIndex = 2;
            });
          }

          break;
        case 'profile':
          this.profileViewSelect();
          // this.tabSelectIndex = 0;
          break;
        case 'config': {
          this.tisService.currentApp = this.currentApp;
          //  console.log(this.workerCfg);
          if (this.workerCfg) {
            break;
          }
          this._zone.run(() => {

            if (this.dto.processMeta.targetName === dataXWorkerCfg.processMeta.targetName) {
              this.httpPost('/coredefine/corenodemanage.ajax?action=datax_action'
                , "emethod=get_datax_worker_config&targetName=" + this.dto.processMeta.targetNameGetter(params))
                .then((r) => {
                  //     console.log(r);

                  if (r.success) {

                    // setTimeout(()=>{

                    this.workerCfg = Object.assign(new DataxWorkerDTO(), r.bizresult, {"processMeta": this.dto.processMeta});

                    // },3000);
                    // DataxWorkerDTO
                  }

                }, (err) => {
                  console.log(err);
                });

            } else {
              this.workerCfg = Object.assign(new DataxWorkerDTO(), {"processMeta": this.dto.processMeta});
            }
          });
          break;
        }
        case 'manage':
          // this.tabSelectIndex = 3;
          break;
        case 'env':
          break;
        case 'wf-list':
          if (!this.dto.processMeta.runningStepCfg.showPowerJobWorkflowInstance) {
            throw new Error("powerJob workflow instance can not be present")
          }
          this.gotoPage(this.pager.curPage)
          break;
        default : {
          this.dto.processMeta.runningStepCfg.defaultTabExecute(this);
          //  this.tabSelectIndex = 0;
          // this.workflowSelect();
          break;
        }
      }
    });
  }


  protected initialize(app: CurrentCollection): void {
  }

  ngAfterViewInit() {

    //console.log(this.tabsetComponent.allTabs.get(0).content);
  }


  prestep() {
    // this.preStep.next(this.dto);
  }

  dataXWorkerDelete(cpt: ControlPanelComponent) {

    this.jsonPost('/coredefine/corenodemanage.ajax?action=datax_action&emethod=remove_datax_worker&targetName=' + this.currentApp.name //this.dto.processMeta.targetName
      , {})
      .then((r) => {
        cpt.enableComponent();
        if (r.success) {
          this.dto.processMeta.afterSuccessDelete(this);
          // this.nextStep.emit(Object.assign(new DataxWorkerDTO(), {processMeta: this.dto.processMeta}));
        }
      });

  }

  profileTabSelect() {
    this.activeTab('profile');
  }

  private activeTab(tabName: string) {
    // let params = this.route.snapshot.params;
    let currentTab = this.route.snapshot.fragment;// params['targetTab'];
    if (currentTab !== tabName) {
      let commands = DataxWorkerRunningComponent.createRouterCommands(this.dto.processMeta, this.route.snapshot);
      this.router.navigate(commands, {relativeTo: this.route, fragment: tabName});
    }
  }

  static createRouterCommands(processMeta: ProcessMeta, snapshot: ActivatedRouteSnapshot): string[] {
    let params = snapshot.params;
    let commands = ['/base'];
    processMeta.runningTabRouterGetter(params)
      .forEach((path) => {
        commands.push(path);
      })
    return commands;
    // commands.push(tabName);
    // this.router.navigate(commands, {relativeTo: this.route, fragment: tabName});

  }

  envTabSelect() {
    this.activeTab('env');
  }

  workflowSelect() {
    // this.gotoPage(this.pager.curPage)
    this.activeTab('wf-list');
  }

  profileViewSelect(): void {
    // this.jsonPost(`/coredefine/corenodemanage.ajax?action=datax_action&emethod=get_datax_worker_hpa&targetName=${this.dto.processMeta.targetName}`
    //   , {})
    //   .then((r) => {
    //     if (r.success) {
    //       // this.rcHpaStatus = r.bizresult;
    //     }
    //   });
  }

  logtypeSelect() {
    this.activeTab('log');
    // if (!this.route.snapshot.params['targetTab']) {
    //   this.router.navigate(["/base/datax-worker/log"], {relativeTo: this.route});
    // }
  }


  manageSelect() {
    this.activeTab('manage');
  }

  k8sResConfigSelect() {
    // dto: DataxWorkerDTO
    this.activeTab('config');
  }

  deletePowerJobAppOverwrite(u: PowerJobWorkflow) {

    this.confirm("是否要删除id为" + u.id + "的PowerJob 工作流", () => {
      this.httpPost('/coredefine/corenodemanage.ajax'
        , 'action=datax_action&emethod=delete_power_job_workflow&id=' + u.id)
        .then((r) => {
          if (r.success) {
            // this.workflows = r.bizresult.rows;
            // this.pager = new Pager(r.bizresult.curPage, r.bizresult.totalPage);
            let idxOf = this.workflows.findIndex((wf) => u.id === wf.id);
            if (idxOf > -1) {
              this.workflows.splice(idxOf, 1);
              this.workflows = [...this.workflows];
            }

            this.successNotify("已经成功删除id为" + u.id + "的PowerJob 工作流");
          }
        });
    })


  }

  startPowerJobTplAppOverwrite(u: PowerJobWorkflow) {
    if (!u.wfName) {
      throw new Error("property wfName can not be null");
    }
    DataxWorkerAddStep0Component.startPowerJobTplAppOverwrite(this, [{
      key: KEY_APPNAME,
      val: u.wfName
    }]).subscribe((plugin: PowerJobWorkflow) => {
      // console.log(plugin);
      // this.workflowSelect();

      let idxOf = this.workflows.findIndex((wf) => wf.id === plugin.id);
      if (idxOf > -1) {
        this.workflows[idxOf] = plugin;
        this.workflows = [...this.workflows];
      }
    });
  }


  gotoViewLog(podState: K8sPodState) {
    PodsListComponent.viewPodLog(this.dto.processMeta, this.route, this.router, podState);
    this.tabSelectIndex = 2;
  }
}

@Component({
  selector: `pod-list`,
  template: `
    <nz-page-header [nzGhost]="true">
      <nz-page-header-title>{{rcDeployment.name}}</nz-page-header-title>
      <nz-page-header-content class="item-block">
        <div nz-row>
          <div nz-col nzSpan="4">
            <nz-progress
              nzType="circle"
              [nzFormat]="podProgress"
              [nzPercent]="progressPercent"
              [nzStatus]="progressStat"
            ></nz-progress>
            <ng-template #podProgress>
              <span nz-icon *ngIf="progressStat === 'active'" [nzType]="'sync'" [nzSpin]="true"></span>
              {{this.rcDeployment.pods.length}}/{{this.toPodNum.targetPodNum}} <i class="union-pod">pod</i> <br/>
              <button *ngIf="showErrorLogs" nz-button nzType="link" (click)="openError()">error</button>
            </ng-template>
            <nz-button-group *ngIf="this.rcDeployment.replicaScalable" style="margin-left: 5px">
              <button nz-button [disabled]="this.formDisabled || this.toPodNum.targetPodNum<2"
                      (click)="minusPod()"><span nz-icon nzType="minus"></span>
              </button>
              <button nz-button [disabled]="this.formDisabled" (click)="plusPod()"><span nz-icon
                                                                                         nzType="plus"></span>
              </button>
            </nz-button-group>
          </div>
          <div nz-col nzSpan="20">
            <h4>pods</h4>
            <nz-table #pods nzSize="small" nzBordered="true" nzShowPagination="false"
                      [nzData]="rcDeployment.pods">
              <thead>
              <tr>
                <th width="20%">名称</th>
                <th>状态</th>
                <th>重启次数</th>
                <th>创建时间</th>
              </tr>
              </thead>
              <tbody>
              <tr *ngFor="let pod of pods.data">
                <td>
                  <button nz-button nzType="link"
                          (click)="viewPodLog(pod)">{{pod.name}}</button>
                </td>
                <td>
                  <nz-tag [nzColor]="'blue'"> {{pod.phase}}</nz-tag>
                </td>
                <td>
                  {{pod.restartCount}}
                </td>
                <td>{{pod.startTime | date:'yyyy/MM/dd HH:mm:ss'}}</td>
              </tr>
              </tbody>
            </nz-table>
            <ng-container *ngIf="rcHpaStatus">
              <h4>hap</h4>
              <div class="item-block">
                <h2 class="ant-descriptions-title h2-header">扩缩容</h2>
                <nz-descriptions class="desc-block" nzTitle="规格" nzBordered>
                  <nz-descriptions-item
                    nzTitle="minReplicas">{{rcHpaStatus.autoscalerSpec.minReplicas}}</nz-descriptions-item>
                  <nz-descriptions-item
                    nzTitle="maxReplicas">{{rcHpaStatus.autoscalerSpec.maxReplicas}}</nz-descriptions-item>
                  <nz-descriptions-item nzTitle="targetCPUUtilizationPercentage"
                                        nzSpan="1">{{rcHpaStatus.autoscalerSpec.targetCPUUtilizationPercentage}}
                    %
                  </nz-descriptions-item>
                </nz-descriptions>
                <nz-descriptions class="desc-block" nzTitle="当前状态" nzBordered>
                  <nz-descriptions-item
                    nzTitle="currentCPUUtilizationPercentage">{{rcHpaStatus.autoscalerStatus.currentCPUUtilizationPercentage}}</nz-descriptions-item>
                  <nz-descriptions-item
                    nzTitle="currentReplicas">{{rcHpaStatus.autoscalerStatus.currentReplicas}}</nz-descriptions-item>
                  <nz-descriptions-item
                    nzTitle="desiredReplicas">{{rcHpaStatus.autoscalerStatus.desiredReplicas}}</nz-descriptions-item>
                  <nz-descriptions-item *ngIf="rcHpaStatus.autoscalerStatus.lastScaleTime > 0"
                                        nzTitle="lastScaleTime">{{rcHpaStatus.autoscalerStatus.lastScaleTime | date: 'yyyy/MM/dd HH:mm'}}</nz-descriptions-item>
                </nz-descriptions>
                <div class="ant-descriptions desc-block">
                  <h3 class="ant-descriptions-title">扩缩容事件</h3>
                  <tis-page [tabSize]="'small'" [showPagination]="false"
                            [rows]="rcHpaStatus.conditions">
                    <tis-col title="类型" width="5" field="type"></tis-col>
                    <tis-col title="状态" width="5" field="status"></tis-col>
                    <tis-col title="时间" width="14" field="lastTransitionTime"></tis-col>
                    <tis-col title="原因" width="14" field="reason"></tis-col>
                    <tis-col title="描述" field="message"></tis-col>
                  </tis-page>
                </div>
              </div>
            </ng-container>
          </div>
        </div>

      </nz-page-header-content>
    </nz-page-header>

  `
  ,
  styles: [
    `.union-pod {
      font-size: 9px;
      color: #5d5d5d;
    }`
  ]
})
export class PodsListComponent extends BasicFormComponent implements AfterViewInit, OnInit {

  // @Input() caption:string;
  @Input() rcHpaStatus: RcHpaStatus;
  @Input() public rcDeployment: RCDeployment;
  @Input() processMeta: ProcessMeta;

  @Output() viewLog = new EventEmitter<K8sPodState>();

  toPodNum = new PodNumberDebounce(0);

  podNumberChange$ = new Subject<PodNumberChange>();
  _progressStat: NzProgressStatusType;


  constructor(tisService: TISService, modalService: NzModalService, notification: NzNotificationService
    , private route: ActivatedRoute, private router: Router, private drawerService: NzDrawerService) {
    super(tisService, modalService, notification);
  }

  openError(): void {
    this.rcDeployment.rcScalaLog
    const drawerRef = this.drawerService.create<LaunchK8SClusterWaittingProcessComponent, {}, {}>({
      nzWidth: "60%",
      nzHeight: "100%",
      nzPlacement: "right",
      nzContent: LaunchK8SClusterWaittingProcessComponent,
      nzContentParams: {"errScalaLog": this.rcDeployment.rcScalaLog},
      nzClosable: false,
      nzMaskClosable: false
    });
  }

  get progressPercent(): number {
    let p = this.rcDeployment.pods.length * 100 / this.toPodNum.targetPodNum;
    // console.log(p);
    return p;
  }

  get showErrorLogs(): boolean {
    let scalaLog = this.rcDeployment.rcScalaLog;
    return (scalaLog && scalaLog.faild);
  }

  get progressStat(): NzProgressStatusType {
    let scalaLog = this.rcDeployment.rcScalaLog;
    if (scalaLog && scalaLog.faild) {
      return 'exception';
    }
    return this._progressStat;
  }

  ngAfterViewInit(): void {
  }

  static viewPodLog(processMeta: ProcessMeta, route: ActivatedRoute, router: Router, podname: K8sPodState) {

    let commands = DataxWorkerRunningComponent.createRouterCommands(processMeta, route.snapshot);

    router.navigate(commands, {
      relativeTo: route,
      fragment: "log",
      queryParams: {pod: podname.name}
    });
  }


  minusPod(): void {
    this.podNumberChange$.next(new PodNumberChange(false, 1));
  }

  plusPod(): void {
    // console.log("plusPod");
    this.podNumberChange$.next(new PodNumberChange(true, 1));
  }

  viewPodLog(podname: K8sPodState) {
    this.viewLog.emit(podname);//


    // this.router.navigate([`/base/${this.processMeta.targetName}/log`], {
    //   relativeTo: this.route,
    //   fragment: podname.name
    // });
    // this.tabSelectIndex = 2;
  }

  ngOnInit(): void {

    //const getIndeNameList = (podChange: PodNumberChange) => {
    // return this._http
    //   .get(`/tjs/runtime/applist.ajax?emethod=query_app&action=app_view_action&query=${fuzzName}`)
    //   .pipe(map((res: any) => res.bizresult))
    //   .pipe(
    //     map((list: any) => {
    //       return list.map((item: any) => {
    //         let app = new SelectedIndex(item.projectName, item.appType);
    //         // `${item.projectName}`
    //         return app;
    //       });
    //     })
    //   );
    //   return new Observable();// podChange;
    // };

    this.toPodNum = new PodNumberDebounce(this.rcDeployment.pods.length);
    // let podNum  = new PodNumberDebounce(this.rcDeployment.pods.length);
    // const count = ones.pipe(reduce((acc, one) => acc + one, seed));
    // count.subscribe(x => console.log(x))
    // this.podNumberChange$.pipe(// restart counter on every click
    //    switchMap((e) => this.podNumberChange$.pipe() ),takeUntil(timer(5000)) ).subscribe(console.log);
    const optionList$: Observable<PodNumberDebounce> = this.podNumberChange$
      .asObservable()
      .pipe(map((val) => {
        let pn = this.toPodNum.change(val);
        if (pn.targetPodNum < 1) {
          let err = 'Pod数不能小于1';
          this.toPodNum.targetPodNum = 1;
          this.errNotify(err, 6000);
          //throw new Error(err);

        }
        return pn;
      }))
      .pipe(debounceTime(3000));//.pipe(distinctUntilChanged());


    // reduce((acc, change: PodNumberChange) => {
    //   if (!acc) {
    //     acc = new PodNumberDebounce(this.rcDeployment.pods.length);
    //   }
    //
    //   let f = acc.change(change);
    //   console.log(['reduce', acc, f.targetPodNum]);
    //   // if (acc.targetPodNum > 7) {
    //   //   this.podNumberChange$.complete();
    //   // }
    //   return f;
    // }, null)

    // // .pipe(debounceTime(2000));
    // // .pipe(switchMap(getIndeNameList));
    //
    optionList$.subscribe(data => {
      // this.toPodNum = data;
      // console.log(data);
      // this.collectionOptionList = data;
      // this.isLoading = false;
      this.formDisabled = true;
      this._progressStat = 'active';
      this.rcDeployment.rcScalaLog = undefined;
      let evtSubject: EventSourceSubject = DataxWorkerAddStep3Component.createLaunchingEventSubject(
        new CreateLaunchingTarget("datax_action", "apply_pod_number"
          , "cptType=" + this.rcDeployment.name + "&podNumber=" + data.targetPodNum)
        , this.tisService, this.processMeta.targetName
      );
      //
      //?resulthandler=exec_null&action=datax_action&emethod=apply_pod_number&targetName=datax-worker&cptType=powerjob-worker&podNumber=2
      evtSubject.events.subscribe((e: [EventType, Array<ExecuteStep> | MessageData | ExecuteStep]) => {
        ;
        switch (e[0]) {
          case EventType.TASK_MILESTONE:
            let milestone: ExecuteStep = <ExecuteStep>e[1];
            if (!milestone.success) {
              this._progressStat = 'exception';
            }
            let match = /^(.+?)([+|-]{1})$/.exec(milestone.name)
            // console.log(match)
            if (!match) {
              throw new Error('podName is not illegal:' + milestone.name);
            }
            let podName = match[1];

            switch (match[2]) {
              case '+':
                this.rcDeployment.pods.push({'name': podName})
                this.rcDeployment.pods = [...this.rcDeployment.pods];
                break;
              case '-':
                let idxOf = this.rcDeployment.pods.findIndex((pod) => pod.name === podName);
                if (idxOf > -1) {
                  this.rcDeployment.pods.splice(idxOf, 1);
                  this.rcDeployment.pods = [...this.rcDeployment.pods];
                }

                break;
              default:
                throw new Error('podName:' + milestone.name + ",exec action is illegal:" + match[2]);
            }

            // match[2];
            break;
          case EventType.SSE_CLOSE:
            if (this._progressStat === 'active') {
              this._progressStat = 'success';
              this.formDisabled = false;
            }
          case EventType.TASK_EXECUTE_STEPS:
            break;
          case EventType.LOG_MESSAGE:
            break;
        }

      });
    });
  }

}

class PodNumberChange {
  constructor(private _plus: boolean, private _changeNum: number) {
  }

  get plus(): boolean {
    return this._plus;
  }

  get changeNum(): number {
    return this._changeNum;
  }
}

class PodNumberDebounce {
  change(change: PodNumberChange): PodNumberDebounce {
    this.targetPodNum += (change.plus ? 1 : -1) * change.changeNum;
    return this;
  }

  constructor(public targetPodNum: number) {
  }
}


@Component({
  selector: `rc-spec`,
  template: `

    <nz-page-header [nzGhost]="true">
      <nz-page-header-title>{{rcDeployment.name}}</nz-page-header-title>
      <nz-page-header-content class="item-block">
        <nz-descriptions class="desc-block" nzTitle="配置" nzBordered>
          <nz-descriptions-item
            nzTitle="Docker Image">{{rcDeployment.dockerImage}}</nz-descriptions-item>
          <nz-descriptions-item
            nzTitle="创建时间">{{rcDeployment.creationTimestamp | date : "yyyy/MM/dd HH:mm:ss"}}</nz-descriptions-item>
        </nz-descriptions>
        <nz-descriptions class="desc-block" nzTitle="当前状态" nzBordered>
          <nz-descriptions-item
            nzTitle="availableReplicas">{{rcDeployment.status.availableReplicas}}</nz-descriptions-item>
          <nz-descriptions-item
            nzTitle="fullyLabeledReplicas">{{rcDeployment.status.fullyLabeledReplicas}}</nz-descriptions-item>
          <nz-descriptions-item
            nzTitle="observedGeneration">{{rcDeployment.status.observedGeneration}}</nz-descriptions-item>
          <nz-descriptions-item
            nzTitle="readyReplicas">{{rcDeployment.status.readyReplicas}}</nz-descriptions-item>
          <nz-descriptions-item
            nzTitle="replicas">{{rcDeployment.status.replicas}}</nz-descriptions-item>
        </nz-descriptions>
        <nz-descriptions class="desc-block" nzTitle="资源分配" nzBordered>
          <nz-descriptions-item nzTitle="CPU">
            <nz-tag>request</nz-tag>
            {{rcDeployment.cpuRequest.val + rcDeployment.cpuRequest.unit}}
            <nz-tag>limit</nz-tag>
            {{rcDeployment.cpuLimit.val + rcDeployment.cpuLimit.unit}}
          </nz-descriptions-item>
          <nz-descriptions-item nzTitle="Memory">
            <nz-tag>request</nz-tag>
            {{rcDeployment.memoryRequest.val + rcDeployment.memoryRequest.unit}}
            <nz-tag>limit</nz-tag>
            {{rcDeployment.memoryLimit.val + rcDeployment.memoryLimit.unit}}
          </nz-descriptions-item>
        </nz-descriptions>
        <nz-descriptions class="desc-block" nzTitle="环境变量" nzBordered>
          <nz-descriptions-item *ngFor=" let e of  rcDeployment.envs | keyvalue"
                                [nzTitle]="e.key">{{e.value}}</nz-descriptions-item>
        </nz-descriptions>
      </nz-page-header-content>
    </nz-page-header>
  `, styles: [
    ``
  ]
})
export class RCSpecComponent extends BasicFormComponent implements AfterViewInit, OnInit {
  @Input() public rcDeployment: RCDeployment;

  constructor(tisService: TISService, modalService: NzModalService, notification: NzNotificationService, private route: ActivatedRoute, private router: Router) {
    super(tisService, modalService, notification);
  }


  ngAfterViewInit(): void {
  }


  ngOnInit(): void {
  }
}

