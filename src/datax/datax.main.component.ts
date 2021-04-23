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

import {Component, ElementRef, ViewChild} from "@angular/core";
import {TISService} from "../service/tis.service";

import {ActivatedRoute, Router} from "@angular/router";
import {AppFormComponent, CurrentCollection} from "../common/basic.form.component";
import {NzModalRef, NzModalService} from "ng-zorro-antd";


// 这个类专门负责router
@Component({
  template: `
      <nz-spin [nzSpinning]="this.formDisabled" [nzDelay]="1000" nzSize="large">
          <tis-page-header [showBreadcrumb]="false" [needRefesh]='true' (refesh)="get_view_data()">
          </tis-page-header>
          <nz-row [nzGutter]="16">
              <nz-col [nzSpan]="3">
                  <nz-card class="primary-card">
                  </nz-card>
              </nz-col>
              <nz-col [nzSpan]="5">
                  <nz-card class="primary-card" [nzExtra]="todayMetricsQueryTemplate">
                  </nz-card>
                  <ng-template #todayMetricsQueryTemplate>
                      <a routerLink="./monitor"><i nz-icon nzType="line-chart" nzTheme="outline"></i></a>
                  </ng-template>
              </nz-col>
              <nz-col [nzSpan]="5">
                  <nz-card class="primary-card" [nzExtra]="todayMetricsUpdateTemplate">
                  </nz-card>
                  <ng-template #todayMetricsUpdateTemplate>
                      <a routerLink="./monitor"><i nz-icon nzType="line-chart" nzTheme="outline"></i></a>
                  </ng-template>
              </nz-col>
              <nz-col [nzSpan]="11">
                  <nz-card nzTitle="副本目录信息" class="primary-card">
                  </nz-card>
              </nz-col>
          </nz-row>
          <br/>
          <nz-row [nzGutter]="16">
              <nz-col [nzSpan]="24">

              </nz-col>
          </nz-row>
      </nz-spin>
  `,
  styles: [`
      .tis-node-label tspan {
          font-size: 10px;
      }

      #tis-node-enum {
          margin: 0px;
          padding-left: 4px;
      }

      #tis-node-enum li {
          display: inline-block;
          padding: 3px;
          list-style: none;
          margin-bottom: 4px;
          border: 1px solid #d9d9d9;
          border-radius: 6px;
          width: 9em;
      }

      .primary-card {
          height: 150px;
      }

      .clusters rect {
          fill: #00ffd0;
          stroke: #999;
          stroke-width: 1.5px;
      }

      text {
          font-weight: 300;
          font-family: "Helvetica Neue", Helvetica, Arial, sans-serf;
          font-size: 14px;
      }

      .node rect {
          stroke: #999;
          fill: #fff;
          stroke-width: 1.5px;
      }

      .edgePath path {
          stroke: #333;
          stroke-width: 1.5px;
      }
  `]
})
export class DataxMainComponent extends AppFormComponent {
// http://localhost:8080/coredefine/corenodemanage.ajax?action=core_action&emethod=get_view_data

  constructor(tisService: TISService, modalService: NzModalService
    , route: ActivatedRoute, private router: Router) {
    super(tisService, route, modalService);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  protected initialize(app: CurrentCollection): void {

  }


  get_view_data() {
  }
}


