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

import {Component, OnInit} from '@angular/core';
import {TISService} from '../service/tis.service';
import {BasicFormComponent} from '../common/basic.form.component';

import {Pager} from "../common/pagination.component";
import {ActivatedRoute, Router} from "@angular/router";
import {NzModalService} from "ng-zorro-antd";

// 查看操作日志
@Component({
  template: `

      <tis-page-header title="插件管理" [showBreadcrumb]="true">
      </tis-page-header>
      <nz-tabset [nzTabBarExtraContent]="extraTemplate">
          <nz-tab nzTitle="可安装">
              <ng-template nz-tab>
                  <div class="tool-bar">
                      <button [nzSize]="'small'" [disabled]="!canInstall" nz-button nzType="primary" (click)="installPlugin()"><i nz-icon nzType="cloud-download" nzTheme="outline"></i>安装</button>
                  </div>
                  <tis-page [rows]="avaliablePlugs">
                      <tis-col title="Install" width="5">
                          <ng-template let-item="r">
                              <label nz-checkbox
                                     [(ngModel)]="item.checked" [ngModelOptions]="{standalone: true}"></label>
                          </ng-template>
                      </tis-col>
                      <tis-col title="Name">
                          <ng-template let-item="r">
                              <a target="_blank" [href]="item.wiki">{{item.name}}</a>
                              <div class="excerpt">
                                  {{ item.excerpt }}
                              </div>
                          </ng-template>
                      </tis-col>
                      <tis-col title="Version">
                          <ng-template let-item="r">
                              {{ item.version }}
                          </ng-template>
                      </tis-col>
                  </tis-page>
              </ng-template>
          </nz-tab>
          <nz-tab nzTitle="已安装" (nzClick)="openInstalledPlugins()">
              <ng-template nz-tab>
                  <div class="tool-bar">
                      <button [nzSize]="'small'" [disabled]="!canUnInstall" nz-button nzType="primary" (click)="installPlugin()"><i nz-icon nzType="cloud-download" nzTheme="outline"></i>安装</button>
                  </div>
                  <tis-page [rows]="installedPlugs">
                      <tis-col title="Install" width="5">
                          <ng-template let-item="r">
                              <label nz-checkbox
                                     [(ngModel)]="item.checked" [ngModelOptions]="{standalone: true}"></label>
                          </ng-template>
                      </tis-col>
                      <tis-col title="Name">
                          <ng-template let-item="r">
                              <a target="_blank" [href]="item.website">{{item.name}}</a>
                              <div class="excerpt">
                                  {{ item.excerpt }}
                              </div>
                          </ng-template>
                      </tis-col>
                      <tis-col title="Version">
                          <ng-template let-item="r">
                              {{ item.version }}
                          </ng-template>
                      </tis-col>
                  </tis-page>
              </ng-template>
          </nz-tab>
      </nz-tabset>
      <ng-template #extraTemplate>
      </ng-template>
  `, styles: [
      `
            .excerpt {
                color: #909090;
                padding: 5px 0 5px 20px;
            }
    `
  ]
})
export class PluginManageComponent extends BasicFormComponent implements OnInit {

  pager: Pager = new Pager(1, 1);
  avaliablePlugs: Array<any> = [];
  installedPlugs: Array<PluginInfo> = [];

  constructor(tisService: TISService, modalService: NzModalService, private router: Router, private route: ActivatedRoute) {
    super(tisService, modalService);
  }

  get canInstall(): boolean {
    return this.avaliablePlugs.find((p) => p.checked)
  }

  get canUnInstall(): boolean {
    return this.installedPlugs.find((p) => p.checked) !== undefined
  }

  ngOnInit(): void {
    // showBreadcrumb
    let sn = this.route.snapshot;

    this.httpPost('/coredefine/corenodemanage.ajax'
      , `action=plugin_action&emethod=get_available_plugins`)
      .then((r) => {
        this.pager = Pager.create(r);
        // this.logs = r.bizresult.rows;
        this.avaliablePlugs = r.bizresult.rows;
      });

    // this.showBreadcrumb = sn.data["showBreadcrumb"];
    // this.route.queryParams.subscribe((param) => {
    //   this.httpPost('/runtime/operation_log.ajax'
    //     , `action=operation_log_action&emethod=get_init_data&page=${param['page']}`)
    //     .then((r) => {
    //       this.pager = Pager.create(r);
    //       this.logs = r.bizresult.rows;
    //     });
    // });
  }

  // public get showDetail(): boolean {
  //   return this.detail != null;
  // }


  // 显示详细信息
  // public operationDetail(opId: number): void {
  //   this.httpPost(
  //     '/runtime/operation_detail.ajax?action=operation_log_action&event_submit_do_get_detail=y&opid=' + opId, '')
  //     .then(result => {
  //       this.detailLog = result.bizresult.opDesc;
  //       this.logVisible = true;
  //     });
  // }

  // public get detail(): string {
  //   return this.detailLog;
  // }

  // goPage(pageNum: number) {
  //   Pager.go(this.router, this.route, pageNum);
  // }
  //
  // logViewClose() {
  //   this.logVisible = false;
  //   this.detailLog = null;
  // }
  goPage(event: number) {

  }

  installPlugin() {

    let willInstall: Array<any> = this.avaliablePlugs.filter((p) => p.checked);
    if (willInstall.length < 1) {
      this.modalService.error({
        nzTitle: "错误",
        nzContent: "请选择要安装的插件"
      });
      return;
    }

    this.jsonPost('/coredefine/corenodemanage.ajax?action=plugin_action&emethod=install_plugins'
      , willInstall)
      .then((r) => {
        if (r.success) {

        }
      });

  }

  openInstalledPlugins() {
    this.httpPost('/coredefine/corenodemanage.ajax'
      , 'action=plugin_action&emethod=get_installed_plugins')
      .then((r) => {
        if (r.success) {
          this.installedPlugs = r.bizresult;
        }
      });
  }
}

interface PluginInfo {
  name: string;
  version: string;
  website: string;
  checked: boolean;
}
