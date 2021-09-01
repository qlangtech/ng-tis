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

import {Component, Input, OnInit} from "@angular/core";
import {BasicFormComponent} from "../common/basic.form.component";
import {TISService} from "../common/tis.service";
import {ChartDataSets, ChartOptions} from "chart.js";

export declare type ChartType = 'solrQuery' | 'docUpdate';

interface ChartTypeStrategy {
  getMetricNumber(result: any): number;
  getCaption(): string;
}

@Component({
  selector: "line-chart",
  template: `
      <nz-card [nzTitle]="timerangeBar">
          <canvas baseChart [datasets]="lineChartData" [labels]="lineChartLabels"
                  [options]="lineChartOptions" [legend]="false" [chartType]="'line'">
          </canvas>
      </nz-card>
      <ng-template #timerangeBar>
          {{_chartStrategy.getCaption()}}
          <nz-radio-group nzSize="small" [(ngModel)]="rageVal" (ngModelChange)="reload_cluster_state($event)" [nzButtonStyle]="'solid'">
              <label nz-radio-button nzValue="60">近１小时</label>
              <label nz-radio-button nzValue="1440">今天</label>
              <label nz-radio-button nzValue="300">近５小时</label>
              <label nz-radio-button nzValue="7200">近１５天</label>
              <label nz-radio-button nzValue="43200">近1个月</label>
          </nz-radio-group>
      </ng-template>
  `
})
export class LineChartComponent extends BasicFormComponent implements OnInit {
  rageVal = '1440';
  // 近期各时段更新量监控
  public lineChartData: ChartDataSets[] = [
    // {data: [], label: 'updateCount'}
    {backgroundColor: '#95e4fa', data: []},
  ];
  lineChartLabels: Array<any> = [];

  _chartStrategy: ChartTypeStrategy;

  lineChartOptions: ChartOptions = {
    responsive: true,
    // maintainAspectRatio: false,
    // aspectRatio: 1.7,
    scales: {
      yAxes: [{
        ticks: {
          min: 0
        }
      }]
    }
  };


  constructor(tisService: TISService) {
    super(tisService);
  }

  @Input()
  set queryType(type: ChartType) {
    if (type === 'solrQuery') {
      this._chartStrategy = {
        getMetricNumber: (val) => val.requestCount,
        getCaption: () => `查询`
      }
    } else if (type === 'docUpdate') {
      this._chartStrategy = {
        getMetricNumber: (val) => val.updateCount,
        getCaption: () => `文档更新`
      }
    }
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
          serialData.data.push(this._chartStrategy.getMetricNumber(r));
          labels.push(r.label);
        });
        this.lineChartData = [serialData];
        this.lineChartLabels = labels;
      });
  }

  ngOnInit(): void {
    this.reload_cluster_state(this.rageVal);
  }
}


