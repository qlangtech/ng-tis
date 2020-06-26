import {AfterContentInit, Component, EventEmitter, Output} from "@angular/core";
import {TISService} from "../service/tis.service";
import {AppFormComponent, CurrentCollection} from "../common/basic.form.component";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ActivatedRoute} from "@angular/router";
import {ChartDataSets, ChartOptions} from "chart.js";


@Component({
  template: `
      <nz-tabset [nzTabBarExtraContent]="extraTemplate">
          <nz-tab nzTitle="基本">

              <div style="background: #ECECEC;padding:20px;">
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
                                          <b style="color:blue;font-size:40px" id="tis-incr-in-rate">9999</b>
                                          <div id="db-syn" style="width:130px;height:5px;background-color:blue;">
                                              <i class="fa fa-caret-right fa-2x arrow my-arrow1" aria-hidden="true"></i>
                                              <i class="fa fa-caret-right fa-2x arrow my-arrow2" aria-hidden="true"></i>
                                          </div>
                                      </td>
                                      <td align="center" valign="center">


                                          <button nz-button nz-dropdown [nzDropdownMenu]="menu4">
                                              启停 <i nz-icon nzType="down"></i>
                                          </button>
                                          <nz-dropdown-menu #menu4="nzDropdownMenu">
                                              <ul nz-menu>
                                                  <li nz-menu-item (click)="incrResumePause(true)">暂停</li>
                                                  <li nz-menu-item (click)="incrResumePause(false)">启动</li>
                                              </ul>
                                          </nz-dropdown-menu>
                                          <br/>
                                          <i class="fa fa-cog fa-spin" style="font-size:3em" aria-hidden="true"></i>
                                      </td>
                                      <td align="center"><b style="color:blue;font-size:40px" id="tis-incr-out-rate">123</b>
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

                          <ng-template  #incrcontrol >
                              <button nz-button nzType="link" nz-dropdown [nzDropdownMenu]="menu"><i nz-icon nzType="setting" nzTheme="outline"></i></button>
                              <nz-dropdown-menu #menu="nzDropdownMenu">
                                  <ul nz-menu>
                                      <li nz-menu-item>
                                          <a>1st item</a>
                                      </li>
                                      <li nz-menu-item>
                                          <a>2nd item</a>
                                      </li>
                                      <li nz-menu-item>
                                          <a>3rd item</a>
                                      </li>
                                  </ul>
                              </nz-dropdown-menu>
                          </ng-template>
                      </div>
                      <div nz-col [nzSpan]="8">
                          <nz-card nzTitle="实时流量" [nzBodyStyle]="{'height':'300px'}">
                              <canvas baseChart [datasets]="lineChartData" [labels]="lineChartLabels"
                                      [options]="lineChartOptions" [legend]="false" [chartType]="'line'">
                              </canvas>
                          </nz-card>
                      </div>
                  </div>

                  <div nz-row [nzGutter]="8">
                      <div nz-col [nzSpan]="8">
                          <nz-card [nzTitle]="timerangeBar">
                              <canvas baseChart [datasets]="lineChartData" [labels]="lineChartLabels"
                                      [options]="lineChartOptions" [legend]="false" [chartType]="'line'">
                              </canvas>
                          </nz-card>
                          <ng-template #timerangeBar>
                              近期流量
                              <nz-radio-group [(ngModel)]="rageVal" (ngModelChange)="reload_cluster_state($event)" [nzButtonStyle]="'solid'">
                                  <label nz-radio-button nzValue="60">近１小时</label>
                                  <label nz-radio-button nzValue="1440">今天</label>
                                  <label nz-radio-button nzValue="300">近５小时</label>
                                  <label nz-radio-button nzValue="7200">近１５天</label>
                                  <label nz-radio-button nzValue="43200">近1个月</label>
                              </nz-radio-group>
                          </ng-template>
                      </div>
                  </div>
              </div>
              <div style="display: flex;">
                  <div style="flex:1">
                  </div>
                  <div style="flex:1">
                  </div>
              </div>
          </nz-tab>
          <nz-tab nzTitle="规格">
              <ng-template nz-tab>
                  world
              </ng-template>
          </nz-tab>
          <nz-tab nzTitle="日志">
              <ng-template nz-tab>
                  <incr-pod-logs-status></incr-pod-logs-status>
              </ng-template>
          </nz-tab>
      </nz-tabset>
      <ng-template #extraTemplate>
          <button nz-button>Extra Action</button>
      </ng-template>
  `,
  styles: [
      `
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
export class IncrBuildStep4RunningComponent extends AppFormComponent implements AfterContentInit {
  @Output() nextStep = new EventEmitter<any>();
  @Output() preStep = new EventEmitter<any>();

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
  public lineChartData: ChartDataSets[] = [
    {data: [], label: 'updateCount'}
    // {data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A'},
  ];
  lineChartLabels: Array<any> = [];
  rageVal = '1440';

  constructor(tisService: TISService, route: ActivatedRoute, modalService: NgbModal) {
    super(tisService, route, modalService);
  }


  protected initialize(app: CurrentCollection): void {
  }

  ngAfterContentInit(): void {
    this.reload_cluster_state(this.rageVal);
  }


  reload_cluster_state(range: string) {
    this.httpPost('/runtime/cluster_status.ajax', 'action=cluster_state_collect_action&event_submit_do_collect=y&m=' + range)
      .then((data) => {
        let rows = data.bizresult;
        let serialData: { data?: any, label: string } = {label: "UpdateCount"};
        serialData.data = [];
        let labels: Array<any> = [];
        this.lineChartLabels = [];
        rows.forEach((r: any) => {
          serialData.data.push(r.updateCount);
          labels.push(r.label);
        });
        this.lineChartData = [serialData];
        this.lineChartLabels = labels;
      });

  }

  incrResumePause(pause: boolean) {

    this.httpPost('/coredefine/corenodemanage.ajax', "event_submit_do_incr_resume_pause=y&action=core_action&pause=" + pause)
      .then((r) => {

      })
    return false;
  }
}
