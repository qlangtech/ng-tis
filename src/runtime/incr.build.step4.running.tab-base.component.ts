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

import {AfterContentInit, Component, EventEmitter, Input, OnDestroy, Output, ViewChild} from "@angular/core";
import {TISService} from "../service/tis.service";
import {AppFormComponent, CurrentCollection} from "../common/basic.form.component";

import {ActivatedRoute, Router} from "@angular/router";
import {ChartDataSets, ChartOptions} from "chart.js";
import {NzModalService, NzNotificationService} from "ng-zorro-antd";
import {IndexIncrStatus} from "./incr.build.component";
import {Subject} from "rxjs";
import {map} from "rxjs/operators";
import {WSMessage} from "./core.build.progress.component";
import {NgTerminal} from "ng-terminal";


@Component({
  selector: "incr-build-step4-running-tab-base",
  template: `

      <div>
          <div nz-row [nzGutter]="8">
              <div nz-col [nzSpan]="8">
                  <nz-card nzTitle="阀门控制" [nzBodyStyle]="{'height':'300px'}" [nzExtra]="incrcontrol">
                      <table align="left">
                          <tr>
                              <td>
                                  <i>DB</i><br>
                                  <i class="fa fa-database" style="font-size:7em" aria-hidden="true"></i>
                              </td>
                              <td align="center">
                                  <b style="color:blue;font-size:40px" id="tis-incr-in-rate">{{tisIncrStatus?.summary.tableConsumeCount}}</b>
                                  <div id="db-syn" style="width:130px;height:5px;background-color:blue;">
                                      <i class="fa fa-caret-right fa-2x arrow my-arrow1" aria-hidden="true"></i>
                                      <i class="fa fa-caret-right fa-2x arrow my-arrow2" aria-hidden="true"></i>
                                  </div>
                              </td>
                              <td align="center" valign="center">
                                              <span [ngSwitch]="dto.incrProcess.incrProcessPaused">
                                                  <button *ngSwitchCase="false" nzType="primary" nzSize="small" nz-button (click)="incrResumePause(true)">暂停</button>
                                                  <button *ngSwitchCase="true" nzType="primary" nzSize="small" nz-button (click)="incrResumePause(false)">启动</button>
                                              </span>
                                  <br/>
                                  <span [ngSwitch]="dto.incrProcess.incrProcessPaused">
                                                  <i *ngSwitchCase="false" class="fa fa-cog fa-spin" style="font-size:3em;color:blue;" aria-hidden="true"></i>
                                                  <i *ngSwitchCase="true" nz-icon nzType="stop" style="font-size:3em;color:deeppink" nzTheme="outline"></i>
                                              </span>
                              </td>
                              <td align="center"><b style="color:blue;font-size:40px" id="tis-incr-out-rate">{{tisIncrStatus?.summary.solrConsume}}</b>
                                  <div id="db-syn" style="width:130px;height:5px;background-color:blue;">
                                      <i class="fa fa-caret-right fa-2x arrow my-arrow1" aria-hidden="true"></i>
                                      <i class="fa fa-caret-right fa-2x arrow my-arrow2" aria-hidden="true"></i>
                                  </div>
                              </td>
                              <td>
                                  <i>TIS</i><br>
                                  <i class="fa fa-database" style="font-size:7em" aria-hidden="true"></i>
                              </td>
                          </tr>
                      </table>
                  </nz-card>

                  <ng-template #incrcontrol>
                      <button nz-button [nzSize]="'small'" (click)="openIncrRealtimeLog()">详细</button>
                  </ng-template>
              </div>
              <div nz-col [nzSpan]="8">
                  <nz-card nzTitle="实时流量" [nzBodyStyle]="{'height':'300px'}">
                      <canvas baseChart [datasets]="barChartData" [labels]="barChartLabels"
                              [options]="lineChartOptions" [legend]="false" [chartType]="'bar'">
                      </canvas>
                  </nz-card>
              </div>
          </div>

          <div nz-row [nzGutter]="8">
              <div nz-col [nzSpan]="8">
                  <line-chart [queryType]="'docUpdate'"></line-chart>
              </div>
          </div>
      </div>
      <nz-drawer
              [nzBodyStyle]="{ height: 'calc(100% - 55px)', overflow: 'auto', 'padding-bottom': '20px' }"
              [nzPlacement]="'right'"
              [nzMaskClosable]="false"
              [nzWidth]="900"
              [nzVisible]="termVisible"
              nzTitle="增量实时统计日志"
              (nzOnClose)="this.termClose()">
          <ng-terminal #term></ng-terminal>
      </nz-drawer>
  `,
  styles: [
      `
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
              border: 2px solid #d97f85;
              border-radius: 6px;
              margin-bottom: 10px;
              clear: both;
          }

          [nz-row] {
              margin-bottom: 10px;
          }

          .my-arrow1 {
              animation: mymove1 10s linear infinite;
              -webkit-animation: mymove1 2s linear infinite; /*Safari and Chrome*/
          }

          @keyframes mymove1 {
              from {
                  left: 0px;
              }
              to {
                  left: 60px;
              }
          }

          @-webkit-keyframes mymove1 /*Safari and Chrome*/
          {
              from {
                  left: 0px;
              }
              to {
                  left: 60px;
              }
          }


          .my-arrow2 {
              animation: mymove2 10s linear infinite;
              -webkit-animation: mymove2 2s linear infinite; /*Safari and Chrome*/
          }

          @keyframes mymove2 {
              from {
                  left: 60px;
              }
              to {
                  left: 120px;
              }
          }

          @-webkit-keyframes mymove2 /*Safari and Chrome*/
          {
              from {
                  left: 60px;
              }
              to {
                  left: 120px;
              }
          }

          .my-arrow3 {
              animation: mymove3 10s linear infinite;
              -webkit-animation: mymove3 2s linear infinite; /*Safari and Chrome*/
          }

          @keyframes mymove3 {
              from {
                  left: 120px;
              }
              to {
                  left: 180px;
              }
          }

          @-webkit-keyframes mymove3 /*Safari and Chrome*/
          {
              from {
                  left: 120px;
              }
              to {
                  left: 180px;
              }
          }

          .my-arrow4 {
              animation: mymove4 10s linear infinite;
              -webkit-animation: mymove4 2s linear infinite; /*Safari and Chrome*/
          }

          @keyframes mymove4 {
              from {
                  left: 180px;
              }
              to {
                  left: 240px;
              }
          }

          @-webkit-keyframes mymove4 /*Safari and Chrome*/
          {
              from {
                  left: 180px;
              }
              to {
                  left: 240px;
              }
          }

          .my-arrow5 {
              animation: mymove5 10s linear infinite;
              -webkit-animation: mymove5 2s linear infinite; /*Safari and Chrome*/
          }

          @keyframes mymove5 {
              from {
                  left: 240px;
              }
              to {
                  left: 300px;
              }
          }

          @-webkit-keyframes mymove5 /*Safari and Chrome*/
          {
              from {
                  left: 240px;
              }
              to {
                  left: 300px;
              }
          }
    `
  ]
})
export class IncrBuildStep4RunningTabBaseComponent extends AppFormComponent implements AfterContentInit, OnDestroy {
  @Input()
  dto: IndexIncrStatus = new IndexIncrStatus();
  private componentDestroy: boolean;
  @ViewChild('term', {static: true}) terminal: NgTerminal;

  @Input()
  public msgSubject: Subject<WSMessage>;
  // 实时流量配置
  lineChartOptions: ChartOptions = {
    responsive: true,
    scales: {
      yAxes: [{
        ticks: {
          min: 0
        }
      }]
    }
  };

  // 实时各表tag流量监控图
  public barChartData: ChartDataSets[] = [
    // {data: [], label: 'updateCount'}
    {backgroundColor: '#95e4fa', data: []},
  ];
  barChartLabels: Array<any> = [];
  tisIncrStatus: TisIncrStatus;
  termVisible = false;

  constructor(tisService: TISService, route: ActivatedRoute, private router: Router, modalService: NzModalService, notification: NzNotificationService) {
    super(tisService, route, modalService, notification);
  }


  protected initialize(app: CurrentCollection): void {
  }

  ngAfterContentInit(): void {
    this.msgSubject.subscribe((response: WSMessage): void => {
        if (this.componentDestroy) {
          return;
        }
        switch (response.logtype) {
          case "mq_tags_status":
            // console.log(response);
            if (!this.tisIncrStatus) {
              this.tisIncrStatus = response.data.msg;
              this.barChartLabels = this.tisIncrStatus.tags.map((t) => t.tag);
            } else {
              this.tisIncrStatus = response.data.msg;
              this.barChartData[0].data = this.tisIncrStatus.tags.map((t) => t.trantransferIncr);
            }
            break;
          case "incr":
            if (response.data.msg) {
              this.terminal.write(response.data.msg + "\r\n");
            }
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


  ngOnDestroy(): void {
    this.componentDestroy = true;
  }
  incrResumePause(pause: boolean) {

    this.httpPost('/coredefine/corenodemanage.ajax', "event_submit_do_incr_resume_pause=y&action=core_action&pause=" + pause)
      .then((r) => {
        if (r.success) {
          this.dto.incrProcess.incrProcessPaused = pause;
          this.notification.success("成功", r.msg[0], {nzDuration: 6000});
        }
      })
    return false;
  }

  /**
   * 打开实时日志对话框
   */
  openIncrRealtimeLog() {
    this.msgSubject.next(new WSMessage("incr"));
    this.termVisible = true;
  }

  termClose() {
    this.termVisible = false;
  }
}

interface TisIncrStatus {
  summary: IncrSummary;
  tags: Array<TagState>;
}

interface TagState {
  tag: string;
  trantransferIncr: number;
}

interface IncrSummary {
  solrConsume: number;
  tableConsumeCount: number;
}
