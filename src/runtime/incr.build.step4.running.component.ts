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
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  Output
} from "@angular/core";
import {TISService} from "../common/tis.service";
import {
  AppFormComponent,
  CurrentCollection,
  KEY_INCR_CONTROL_WEBSOCKET_PATH,
  WSMessage
} from "../common/basic.form.component";
import {ActivatedRoute, Router} from "@angular/router";
import {NzModalService} from "ng-zorro-antd/modal";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {Subject, Subscription} from "rxjs";
import {IndexIncrStatus} from "./misc/RCDeployment";
import {EXTRA_PARAM_TARGET_PIPELINE_NAME_AWARE, TisResponseResult} from "../common/tis.plugin";
import {ControlPanelComponent} from "../common/control.panel.component";
import {ChartOptions} from "chart.js";
import {ChartDataset} from 'chart.js';
import {openParamsCfg, TargetPluginCfg} from "src/common/plugins.component";

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
      <nz-spin size="large" [nzSpinning]="this.formDisabled">
          <div style="margin-top: 8px;" *ngIf="true">
              <nz-alert *ngIf="true" nzType="info" [nzDescription]="unableToUseK8SController" nzShowIcon></nz-alert>
              <ng-template #unableToUseK8SController>
                  可直接打开Flink控制台
<!--                <a target="_blank"-->
<!--                                          [href]="this.dto.flinkJobDetail.clusterCfg.jobManagerAddress.url+'/#/job/'+this.dto.flinkJobDetail.jobId+'/overview'">-->
                <a target="_blank"
                   [href]="this.dto.flinkJobDetail.jobManagerUrl">
                  <i nz-icon nzType="link" nzTheme="outline"></i>控制台</a>
              </ng-template>
          </div>

          <nz-tabset [nzTabBarExtraContent]="extraTemplate" nzSize="large" [(nzSelectedIndex)]="tabSelectIndex">
              <nz-tab nzTitle="基本">
                  <ng-template nz-tab [ngSwitch]="this.dto.faildDown ">
                      <!--                      <nz-alert *ngIf="this.dto.incrProcessLaunchHasError" nzType="error" [nzDescription]="errorTpl" nzShowIcon></nz-alert>-->
                      <!--                      <ng-template #errorTpl>-->
                      <!--                          增量处理节点启动有误-->
                      <!--                          <button nz-button nzType="link" (click)="tabSelectIndex=2">查看启动日志</button>-->
                      <!--                      </ng-template>-->
                      <!--                      <incr-build-step4-running-tab-base [msgSubject]="msgSubject" [dto]="dto"></incr-build-step4-running-tab-base>-->

                      <ng-container *ngSwitchCase="true">
                          <nz-alert class="alter-notice"
                                    nzType="warning"
                                    nzMessage="异常状态"
                                    [nzDescription]="alterNotice"
                                    nzShowIcon
                          ></nz-alert>
                          <ng-template #alterNotice>服务端获取不到该Job（状态为：{{this.dto.state}}
                              ），可能是因为Flink-Cluster重启导致，请手动
                              <button (click)="route2SavepointTab()" nz-button nzSize="small" nzType="primary"><i
                                      nz-icon
                                      nzType="rollback"
                                      nzTheme="outline"></i>恢复
                              </button>
                          </ng-template>
                      </ng-container>
                      <ng-container *ngSwitchCase="false">

                          <nz-descriptions style="margin-left: 10px" [nzTitle]="descTitle" [nzExtra]="extraTpl">
                              <nz-descriptions-item
                                      nzTitle="ID">{{this.dto.flinkJobDetail.jobId}}</nz-descriptions-item>
                              <nz-descriptions-item
                                      nzTitle="Start Time"><i nz-icon nzType="field-time"
                                                              nzTheme="outline"></i>{{this.dto.flinkJobDetail.startTime | date : "yyyy/MM/dd HH:mm:ss"}}
                              </nz-descriptions-item>
                              <nz-descriptions-item *ngIf="dto.state !== 'RUNNING'"
                                                    nzTitle="End Time"><i nz-icon nzType="field-time"
                                                                          nzTheme="outline"></i>{{this.dto.flinkJobDetail.endTime | date : "yyyy/MM/dd HH:mm:ss"}}
                              </nz-descriptions-item>
                              <nz-descriptions-item
                                      nzTitle="Duration">{{this.dto.flinkJobDetail.duration | timeconsume}}</nz-descriptions-item>
                          </nz-descriptions>
                          <ng-template #descTitle>
                              <nz-space [nzSplit]="spaceSplit">
                                  <ng-template #spaceSplit>
                                      <nz-divider nzType="vertical"></nz-divider>
                                  </ng-template>
                                  <span *nzSpaceItem>{{this.dto.flinkJobDetail.name}}</span>
                                  <span *nzSpaceItem>
                              <nz-tag [nzColor]="this.dto.flinkJobDetail.statusColor">
                                  <i *ngIf="this.dto.flinkJobDetail.statusColor === 'processing'" nz-icon nzType="sync"
                                     nzSpin></i> {{this.dto.flinkJobDetail.jobStatus}}</nz-tag>
                              <button *ngIf="dto.state === 'STOPED'" (click)="route2SavepointTab()" nz-button
                                      nzSize="small" nzType="primary"><i nz-icon nzType="rollback"
                                                                         nzTheme="outline"></i>恢复</button>
                              </span>
                                  <span *nzSpaceItem>
                                  <nz-tag style="margin: 0"
                                          *ngFor="let s of this.dto.flinkJobDetail.jobVerticesPerState"
                                          [nzColor]="s.stateColor">{{s.count}}</nz-tag>
                              </span>
                              </nz-space>
                          </ng-template>
                          <ng-template #extraTpl>
                              <nz-space *ngIf="this.dto.flinkJobDetail.cancelable">
                                  <button [nzLoading]="this.formDisabled" (click)="reload()" *nzSpaceItem nz-button><i
                                          nz-icon
                                          nzType="reload"
                                          nzTheme="outline"></i>
                                  </button>
                                  <button *nzSpaceItem nz-button [nzLoading]="this.formDisabled"
                                          (click)="manageChannel()"><i nz-icon nzType="setting" nzTheme="outline"></i>操作
                                  </button>
                              </nz-space>
                          </ng-template>
                          <div style="padding: 10px 0px 10px 10px;border-top: 1px solid #cccccc;border-bottom: 1px solid #cccccc">
                              <nz-row [nzGutter]="16">
                                  <nz-col [nzSpan]="24">
                                      <nz-space>
                                          <strong *nzSpaceItem>实时流量</strong> &nbsp;
                                          <nz-button-group *nzSpaceItem>
                                              <ng-container [ngSwitch]="tisIncrStatus.controllerType">
                                                  <!-- NoLimitParam -->
                                                  <button *ngSwitchCase="3" nzSize="small" nz-button nzType="default"
                                                          style="background-color: rgb(0,145,0) ;color:white;letter-spacing: 8px;">
                                                      无<strong>限流</strong>
                                                  </button>
                                                  <!-- Paused-->
                                                  <button *ngSwitchCase="1" nzSize="small" nz-button nzType="primary"
                                                          nzDanger
                                                          style="color:white;letter-spacing: 8px;">
                                                      <span nz-icon nzType="pause-circle" nzTheme="outline"></span>暂停中
                                                  </button>
                                                  <!--FloodDischargeRate-->
                                                  <button *ngSwitchCase="2" nzSize="small" nz-button nzType="default"
                                                          style="background-color: rgb(129,125,3) ;color:white;letter-spacing: 8px;">
                                                      正在泄洪
                                                  </button>
                                                  <!--RateLimit-->
                                                  <button *ngSwitchCase="4" nzSize="small" nz-button nzType="default"
                                                          style="background-color: rgb(104,0,145) ;color:white;letter-spacing: 8px;">
                                                      限流，每秒处理上限：{{tisIncrStatus.perSecRateNums}}条
                                                  </button>
                                              </ng-container>

                                              <button (click)="editLocalJob()" [disabled]="formDisabled" nzSize="small"
                                                      nz-button
                                                      nzType="default"><span nz-icon nzType="setting"
                                                                             nzTheme="outline"></span>流控
                                              </button>
                                          </nz-button-group>
                                          <nz-tag *nzSpaceItem nzColor="cyan">
                                              <strong>Insert：</strong>{{(tisIncrStatus?.summary.tableInsertCount | number)!}}
                                          </nz-tag>
                                          <nz-tag *nzSpaceItem nzColor="cyan">
                                              <strong>Update：</strong>{{(tisIncrStatus?.summary.tableUpdateCount | number)!}}
                                          </nz-tag>
                                          <nz-tag *nzSpaceItem nzColor="cyan">
                                              <strong>Delete：</strong>{{(tisIncrStatus?.summary.tableDeleteCount | number)!}}
                                          </nz-tag>
                                      </nz-space>
                                  </nz-col>
                              </nz-row>
                              <nz-row [nzGutter]="16">
                                  <nz-col [nzSpan]="3">
                                      <nz-statistic id="income-rate" [class.flash]="incomeRateFlash"
                                                    [nzSuffix]="suffixTplOne"
                                                    [nzValue]="(tisIncrStatus?.summary.tableConsumeCount | number)!"
                                                    [nzTitle]="statisticTitle"></nz-statistic>
                                      <ng-template #suffixTplOne>
                                          <li style="font-size: 12px">avg/10 sec
                                              <button (click)="editRateConfig()" [disabled]="formDisabled"
                                                      nzSize="small" nz-button
                                                      nzType="link"><span nz-icon nzType="edit"
                                                                          nzTheme="outline"></span></button>
                                          </li>
                                      </ng-template>
                                      <ng-template #statisticTitle>


                                      </ng-template>
                                  </nz-col>
                                  <nz-col [nzSpan]="21">
                                      <div class="chart-container" style="height: 100px">
                                          <canvas baseChart [datasets]="barChartData" [labels]="barChartLabels"
                                                  [options]="lineChartOptions" [legend]="false" [type]="'line'">
                                          </canvas>
                                      </div>
                                  </nz-col>
                              </nz-row>
                          </div>

                          <tis-page [rows]="this.dto.flinkJobDetail.sources" [showPagination]="false">
                              <tis-col title="Name" width="20">
                                  <ng-template let-rr="r">
                                      <a target="_blank" nz-tooltip [nzTooltipTitle]="rr.fullName"
                                         nzOverlayClassName="tooltip-pree"
                                         [href]="this.dto.flinkJobDetail.clusterCfg.jobManagerAddress.url +'/#/job/running/'+ this.dto.flinkJobDetail.jobId +'/overview/'+ rr.jobVertexId +'/detail'">{{rr.name}}</a>
                                  </ng-template>
                              </tis-col>
                              <tis-col title="Status" width="10">
                                  <ng-template let-rr="r">
                                      <nz-tag [nzColor]="rr.executionStateColor"><i
                                              *ngIf="rr.executionStateColor === 'processing'"
                                              nz-icon nzType="sync" nzSpin></i>{{rr.executionState}}
                                      </nz-tag>
                                  </ng-template>
                              </tis-col>
                              <tis-col title="Bytes Received" width="10">
                                  <ng-template let-rr="r">
                                      {{rr.jobVertexMetrics.bytesRead}}B
                                  </ng-template>
                              </tis-col>
                              <tis-col title="Records Received" width="10">
                                  <ng-template let-rr="r">
                                      {{rr.jobVertexMetrics.recordsRead}}
                                  </ng-template>
                              </tis-col>
                              <tis-col title="Bytes Sent" width="10">
                                  <ng-template let-rr="r">
                                      {{rr.jobVertexMetrics.bytesWritten}}
                                  </ng-template>
                              </tis-col>
                              <tis-col title="Records Sent" width="10">
                                  <ng-template let-rr="r">
                                      {{rr.jobVertexMetrics.recordsWritten}}
                                  </ng-template>
                              </tis-col>
                              <tis-col title="Parallelism" width="10">
                                  <ng-template let-rr="r">
                                      {{rr.parallelism}}
                                  </ng-template>
                              </tis-col>
                              <tis-col title="Start Time" width="10">
                                  <ng-template let-rr="r">
                                      {{rr.startTime | date : "yyyy/MM/dd HH:mm:ss"}}
                                  </ng-template>
                              </tis-col>
                              <tis-col title="Duration" width="10">
                                  <ng-template let-rr="r">
                                      {{rr.duration | timeconsume}}
                                  </ng-template>
                              </tis-col>
                              <!--                <tis-col title="End Time" width="10">-->
                              <!--                  <ng-template let-rr="r">-->
                              <!--                    <ng-container [ngSwitch]="rr.endTime > 0">-->
                              <!--                                      <span *ngSwitchCase="true">-->
                              <!--                                       {{rr.endTime | date : "yyyy/MM/dd HH:mm:ss"}}-->
                              <!--                                      </span>-->
                              <!--                    </ng-container>-->
                              <!--                  </ng-template>-->
                              <!--                </tis-col>-->
                          </tis-page>
                      </ng-container>
                  </ng-template>
              </nz-tab>
              <nz-tab nzTitle="配置">
                  <ng-template nz-tab>
                      <h3>基本信息</h3>
                      <div class="item-block">
                          <tis-plugins [disabled]="true" [errorsPageShow]="false" [shallInitializePluginItems]="false"
                                       [plugins]="[{name: 'incr-config', require: true}]"></tis-plugins>
                      </div>
                      <h3>Source/Sink信息</h3>
                      <div class="item-block">
                          <tis-plugins [disabled]="true" [errorsPageShow]="false" [shallInitializePluginItems]="false"
                                       [plugins]="[{    name: 'mq', require: true  }, {    name: 'sinkFactory', require: true  }]"></tis-plugins>
                      </div>
                  </ng-template>
              </nz-tab>
              <nz-tab [nzTitle]="settingTemplate">
                  <ng-template #settingTemplate>
                      <i nz-icon nzType="setting" nzTheme="outline"></i>操作
                  </ng-template>

                  <control-prompt panelType="normal-stop-incr"
                                  [procDesc]="'停止增量实例 停止过程中会记录当前任务的savepoint，以便重启之用'"
                                  [disabled]="dto.state !== 'RUNNING'" (controlClick)="incrChannelStop($event)">
                  </control-prompt>


                  <control-prompt panelType="danger-delete" [procDesc]="'删除增量实例'"
                                  (controlClick)="incrChannelDelete($event)">
                  </control-prompt>

                  <!--                  <nz-page-header class="danger-control-title" nzTitle="危险操作" nzSubtitle="以下操作可能造成某些组件功能不可用">-->
                  <!--                  </nz-page-header>-->

                  <!--                  <nz-list class="ant-advanced-search-form ant-advanced-search-form-danger" nzBordered>-->
                  <!--                      <nz-list-item>-->
                  <!--                          <span nz-typography>删除增量实例</span>-->
                  <!--                          <button nz-button nzType="primary" nzDanger (click)="incrChannelDelete()"><i nz-icon nzType="delete" nzTheme="outline"></i>删除</button>-->
                  <!--                      </nz-list-item>-->
                  <!--                  </nz-list>-->
              </nz-tab>
              <nz-tab nzTitle="Savepoint">
                  <ng-template nz-tab>
                      <incr-build-step4-running-savepoint (afterRelaunch)="afterRelaunch($event)"
                                                          [dto]="this.dto"></incr-build-step4-running-savepoint>
                  </ng-template>
              </nz-tab>
          </nz-tabset>
          <ng-template #extraTemplate>
              <!--
               <button nz-button nz-dropdown [nzDropdownMenu]="menu4">
                   操作
                   <i nz-icon nzType="down"></i>
               </button>
               <nz-dropdown-menu #menu4="nzDropdownMenu">
                   <ul nz-menu>
                       <li nz-menu-item><i nz-icon nzType="delete" nzTheme="outline"></i>删除</li>
                   </ul>
               </nz-dropdown-menu>
              -->
          </ng-template>
      </nz-spin>
  `,
  styles: [
    `

      ::ng-deep #income-rate span.ant-statistic-content-value-int {
        font-weight: bold;
        padding: 2px 5px 2px 5px;
        color: white;
        background-color: green;
        animation: none; /* 应用闪烁动画，但默认不执行，通过类控制 */
        /* animation: blink 0.5s linear infinite;  应用闪烁动画，但默认不执行，通过类控制 */
        transition: background-color 0.5s; /* 添加平滑的颜色过渡效果 */
      }

      /* 定义闪烁动画 */
      @keyframes blink {
        0% {
          background-color: #fff;
        }
        50% {
          background-color: green;
        }
        /* 闪烁时的颜色，这里设置为红色 */
        100% {
          background-color: #fff;
        }
      }

      ::ng-deep #income-rate.flash span.ant-statistic-content-value-int {
        animation: blink 0.3s linear infinite; /* 应用闪烁动画，但默认不执行，通过类控制 */
      }

      .chart-container {

        position: relative;
        height: 100px;
        width: 100%;
      }

      .chart-container canvas {
        display: block;
        height: 100px !important;
        width: 100% !important;
      }

      .pods {
        margin-top: 12px;
      }

      nz-descriptions {
        margin-top: 15px;
      }

      nz-tab {
        padding-left: 10px;
      }

      .danger-control-title {
        margin-top: 10px;
        padding: 0px 0;
      }

      .ant-advanced-search-form {
        padding: 10px;
        #background: #fbfbfb;
        border: 2px solid;
        border-radius: 6px;
        margin-bottom: 10px;
        clear: both;
      }

      .ant-advanced-search-form-danger {
        border-color: #d97f85;
      }

      .ant-advanced-search-form-normal {
        border-color: #91d5ff;
      }

      .typography-desc {
        font-size: 10px;
        color: #999999;
      }

      [nz-row] {
        margin-bottom: 10px;
      }
    `
  ]
})
export class IncrBuildStep4RunningComponent extends AppFormComponent implements AfterContentInit, OnDestroy {
  private componentDestroy: boolean;
  tabSelectIndex = 0;
  @Output() nextStep = new EventEmitter<any>();
  @Output() preStep = new EventEmitter<any>();
  dto: IndexIncrStatus = new IndexIncrStatus();
  msgSubject: Subject<WSMessage>;
  subscription: Subscription;
  incomeRateFlash = false;
  public barChartData: ChartDataset<'line'>[] = [
    // {data: [], label: 'updateCount'}
    {backgroundColor: '#95e4fa',fill: true,borderColor: 'blue', tension: 0.5,data: [], label: 'Event Nums'},
  ];
  barChartLabels: Array<any> = [];// [];
  tisIncrStatus = new DefaultTisIncrStatus(LimitRateControllerType.NoLimitParam, -1, {
      tableConsumeCount: 0, tableUpdateCount: 0, tableInsertCount: 0, tableDeleteCount: 0
    }, []
  );
  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        display: false,
        beginAtZero: true,
        min: 0,
        grid: {
          display: false // 隐藏X轴网格线
        }
      }
    }
  };

  // 实时流量配置
  constructor(tisService: TISService, route: ActivatedRoute, private router: Router, modalService: NzModalService, notification: NzNotificationService,private cd: ChangeDetectorRef) {
    super(tisService, route, modalService, notification);
   // cd.detach();
  }

  editLocalJob() {

    let targetDesc = new TargetPluginCfg( 'IncrRateController');

   //

    openParamsCfg(targetDesc, EXTRA_PARAM_TARGET_PIPELINE_NAME_AWARE,null, this, "设置流控参数");
  }

  editRateConfig() {

    let targetDesc =  new TargetPluginCfg('IndexCollectionConfig');
 //targetPipelineNameAware_true
    openParamsCfg(targetDesc,EXTRA_PARAM_TARGET_PIPELINE_NAME_AWARE ,null, this, "设置采集参数").finally(()=>{
     // this.cd.detectChanges();
    });
  }


  protected initialize(app: CurrentCollection): void {
  }

  /**
   * message
   * <pre>
   *   {
   *     "summary": {
   *         "tableConsumeCount": 70,
   *         "solrConsume": 17
   *     },
   *     "tags": [
   *         {
   *             "binlogIncr": 33,
   *             "lastUpdate": "01/01 08:00:00",
   *             "tag": "tableConsumeCount",
   *             "trantransferIncr": 57
   *         }
   *     ]
   * }
   *   </pre>
   */
  // taskIdx = 0;
  ngAfterContentInit(): void {
    // console.log(this.dto);
    if (this.dto.faildDown) {
      return;
    }
    //const index = this.taskIdx++;
    let serial = new FixedLengthQueue<TagState>(10);
    this.subscription = this.msgSubject.subscribe((response: WSMessage): void => {
        if (this.componentDestroy) {
          return;
        }
        //  console.log(index);
        switch (response.logtype) {
          case "mq_tags_status":
            // console.log(response);
            this.incomeRateFlash = true;
            let msg: TisIncrStatus = response.data.msg;
            this.tisIncrStatus = new DefaultTisIncrStatus(msg.controllerType, msg.perSecRateNums, msg.summary, msg.tags);
            this.tisIncrStatus.tags.forEach((tag) => {
              serial.enqueue(tag);
            });

            this.barChartLabels = serial.items.map((t) => t.lastUpdate);
            this.barChartData[0].data = serial.items.map((t) => t.trantransferIncr);

            setTimeout(() => {

              this.incomeRateFlash = false;
              // 这里可以重新开启闪烁动画，如果需要的话，不过通常一次变化后保持静止更常见
            }, 500); // 0.5秒后移除高亮，根据需要调整时间
            // if (!this.tisIncrStatus) {
            //
            //
            // } else {
            //   this.tisIncrStatus = response.data.msg;
            //    = this.tisIncrStatus.tags.map((t) => t.trantransferIncr);
            // }
            break;
        }
      },
      (error: any): void => {
        console.log(error);
      }, () => {
        console.log("complete");

      }
    );
  }


  ngOnInit(): void {
    super.ngOnInit();
    this.route.fragment.subscribe((r) => {
      if (r === 'podlog') {
        this.tabSelectIndex = 2;

        let firstPod = this.dto.getFirstPod();
        if (firstPod) {
          this.startMonitorMqTagsStatus('incrdeploy-change:' + firstPod.name);
        } else {
          throw  new Error("have not found any pod");
        }
      } else {
        if (this.dto.faildDown) {
          return;
        }
        this.focusOnMQ_tags_status();
      }
    })
  }

  private focusOnMQ_tags_status() {
    this.startMonitorMqTagsStatus('mq_tags_status');
  }

  reload() {
    IndexIncrStatus.getIncrStatusThenEnter(this, (incrStatus) => {
      //  if(this.dto.state !== incrStatus.state){
      //  console.log(this.dto);
      this.dto = incrStatus;
      this.ngOnDestroy();

      this.focusOnMQ_tags_status();
      this.componentDestroy = false;
      this.ngAfterContentInit();
      this.successNotify("状态已更新");
      // }
    }, false);
  }

  public startMonitorMqTagsStatus(logtype: string) {
    // console.log(this.currentApp);
    this.msgSubject = this.getWSMsgSubject(logtype, KEY_INCR_CONTROL_WEBSOCKET_PATH);
  }


  ngOnDestroy(): void {
    this.componentDestroy = true;
    if (this.subscription) {
      this.subscription.unsubscribe();
      // console.log("unsubscribe");
      this.subscription = null;
    }
  }

  incrChannelStop(cpt: ControlPanelComponent) {
    // this.modalService.confirm({
    //   nzTitle: '停止',
    //   nzContent: `是否要停止增量实例'${this.currentApp.appName}'`,
    //   nzOkText: '执行',
    //   nzCancelText: '取消',
    //   nzOnOk: () => {
    this.httpPost('/coredefine/corenodemanage.ajax', "event_submit_do_incr_stop=y&action=core_action").then((r) => {
      cpt.restoreInitialState();
      if (r.success) {
        this.successNotify(`已经成功停止增量实例${this.currentApp.appName}`);
        //  this.router.navigate(["."], {relativeTo: this.route});
        // this.nextStep.next(this.dto);
        // IndexIncrStatus.getIncrStatusThenEnter(this, (incrStatus) => {
        this.dto = IndexIncrStatus.wrap(r.bizresult);// Object.assign(new IndexIncrStatus(), r.bizresult);

        this.tabSelectIndex = 0;
        // });
      }
    }, (_) => {
      cpt.restoreInitialState();
    });
    //   }
    // });
  }

  // public static channelDelete(base: BasicFormComponent): Promise<TisResponseResult> {
  //   return base.httpPost('/coredefine/corenodemanage.ajax', "event_submit_do_incr_delete=y&action=core_action").then((r) => {
  //     if (r.success) {
  //       return r;
  //     }
  //   });
  // }

  /**
   * 删除增量通道
   */
  incrChannelDelete(cpt: ControlPanelComponent) {
    // this.modalService.confirm({
    //   nzTitle: '删除',
    //   nzContent: `是否要删除增量实例'${this.currentApp.appName}'`,
    //   nzOkText: '执行',
    //   nzCancelText: '取消',
    //   nzOnOk: () => {

    TISService.channelDelete(this.tisService).then((r) => {
      this.successNotify(`已经成功删除增量实例${this.currentApp.appName}`);
      //  this.router.navigate(["."], {relativeTo: this.route});
      this.nextStep.next(this.dto);
    }, () => {
      cpt.restoreInitialState();
    });

    // this.httpPost('/coredefine/corenodemanage.ajax', "event_submit_do_incr_delete=y&action=core_action").then((r) => {
    //   if (r.success) {
    //     this.successNotify(`已经成功删除增量实例${this.currentApp.appName}`);
    //     //  this.router.navigate(["."], {relativeTo: this.route});
    //     this.nextStep.next(this.dto);
    //   } else {
    //     cpt.restoreInitialState()
    //   }
    // }, (_) => {
    //   cpt.restoreInitialState()
    // });
    //   }
    // });
  }

  manageChannel() {
    this.tabSelectIndex = 2;
  }


  route2SavepointTab() {
    this.tabSelectIndex = 3;
  }

  afterRelaunch(result: TisResponseResult) {
    if (result.success) {
      this.dto = result.bizresult;
      this.tabSelectIndex = 0;
    }
  }


}

/**
 * mapper to com.qlangtech.tis.realtime.yarn.rpc.IncrRateControllerCfgDTO.RateControllerType
 */
enum LimitRateControllerType {
  Paused = 1,
  FloodDischargeRate = 2,
  NoLimitParam = 3,
  RateLimit = 4,
  SkipProcess = 5,
}

interface TisIncrStatus {
  summary: IncrSummary;
  tags: Array<TagState>;

  controllerType: LimitRateControllerType;
  perSecRateNums: number;
}

class DefaultTisIncrStatus implements TisIncrStatus {


  constructor(public controllerType: LimitRateControllerType, public perSecRateNums: number, public summary: IncrSummary, public tags: Array<TagState>) {

  }

  public get limitRateStateDesc(): string {
    //
    switch (this.controllerType) {
      case LimitRateControllerType.FloodDischargeRate:
        return "正在泄洪";
      case LimitRateControllerType.NoLimitParam:
       // console.log("xxx");
        return "正常执行中";
      case LimitRateControllerType.Paused:
        return "暂停中";
      case LimitRateControllerType.RateLimit:
        return "限流执行，每秒上限：" + this.perSecRateNums+ "条";
      case LimitRateControllerType.SkipProcess:
        throw new Error("illegal controllerType:" + this.controllerType);
    }

  }

}

interface TagState {
  tag: string;
  trantransferIncr: number;
  lastUpdate: string;
}

interface IncrSummary {
  //solrConsume: number;
  tableConsumeCount: number;
  tableInsertCount: number;
  tableUpdateCount: number;
  tableDeleteCount: number;
}

class FixedLengthQueue<T> {
  public items: T[] = [];
  private maxSize: number;

  constructor(maxSize: number) {
    if (maxSize <= 0) {
      throw new Error("队列大小必须是正整数");
    }
    this.maxSize = maxSize;
  }

  // 入队操作 - 如果队列已满，先移除最早的元素
  enqueue(item: T): void {
    if (this.items.length >= this.maxSize) {
      this.dequeue(); // 移除最早的元素
    }
    this.items.push(item);
  }

  // 出队操作 - 移除并返回最早的元素
  dequeue(): T | undefined {
    return this.items.shift();
  }

  // 查看队首元素
  peekFront(): T | undefined {
    return this.items[0];
  }


  // 查看队尾元素
  peekRear(): T | undefined {
    return this.items[this.items.length - 1];
  }

  // 检查队列是否为空
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  // 检查队列是否已满
  isFull(): boolean {
    return this.items.length === this.maxSize;
  }

  // 获取当前队列长度
  size(): number {
    return this.items.length;
  }

  // 清空队列
  clear(): void {
    this.items = [];
  }

  // 获取队列的字符串表示
  toString(): string {
    return this.items.join(" → ");
  }

  // 获取队列最大容量
  getMaxSize(): number {
    return this.maxSize;
  }
}
