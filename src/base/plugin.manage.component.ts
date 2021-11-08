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
import {TISService} from '../common/tis.service';
import {BasicFormComponent} from '../common/basic.form.component';

import {Pager} from "../common/pagination.component";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {NzModalService} from "ng-zorro-antd/modal";

enum PluginTab {
  avail = 'avaliable',
  installed = 'installed',
  updateCenter = 'update-center'
}

// 查看操作日志
@Component({
  template: `
      <tis-page-header title="插件管理" [showBreadcrumb]="true">
      </tis-page-header>
      <nz-spin [nzSpinning]="this.formDisabled" [nzSize]="'large'">
          <nz-tabset [nzTabBarExtraContent]="extraTemplate" [nzSelectedIndex]="selectedIndex">
              <nz-tab nzTitle="可安装"  (nzClick)="openAvailable()">
                  <ng-template nz-tab>
                      <nz-affix class="tool-bar" [nzOffsetTop]="20">
                          <button [nzSize]="'small'" [disabled]="!canInstall" nz-button nzType="primary" (click)="installPlugin()">
                              <i nz-icon nzType="cloud-download" nzTheme="outline"></i>安装
                          </button>
                      </nz-affix>
                      <tis-page [rows]="avaliablePlugs">
                          <tis-col title="安装" width="5">
                              <ng-template let-item="r">
                                  <label nz-checkbox
                                         [(ngModel)]="item.checked" [ngModelOptions]="{standalone: true}"></label>
                              </ng-template>
                          </tis-col>
                          <tis-col title="名称">
                              <ng-template let-item="r">
                                  <a href="javascript:void(0)">{{item.name}}</a>
                                  <div class="item-block">
                                      <markdown [data]="item.excerpt" class="excerpt"></markdown>
                                      <div class="tis-tags" *ngIf="item.dependencies.length >0">
                                          <span>依赖:</span>
                                          <nz-tag [nzColor]="'blue'" *ngFor="let d of item.dependencies">{{d.name}}:{{d.value}}</nz-tag>
                                      </div>
                                      <div class="tis-tags">
                                          <span>作者:</span>
                                          <nz-tag>TIS官方</nz-tag>
                                          <span>费用:</span>
                                          <nz-tag [nzColor]="'green'">免费</nz-tag>
                                          <span>打包时间:</span>
                                          <nz-tag>{{item.releaseTimestamp| date : "yyyy/MM/dd HH:mm"}}</nz-tag>
                                      </div>
                                  </div>
                              </ng-template>
                          </tis-col>
                          <tis-col title="包大小">
                              <ng-template let-item="r">
                                  {{item.sizeLiteral}}
                              </ng-template>
                          </tis-col>
                          <tis-col title="版本">
                              <ng-template let-item="r">
                                  {{ item.version }}
                              </ng-template>
                          </tis-col>
                      </tis-page>
                  </ng-template>
              </nz-tab>
              <nz-tab nzTitle="已安装" (nzClick)="openInstalledPlugins()">
                  <ng-template nz-tab>
                      <tis-page [rows]="installedPlugs">
                          <tis-col title="名称">
                              <ng-template let-item="r">
                                  <a href="javascript:void(0)">{{item.name}}</a>
                                  <div class="item-block">
                                      <markdown [data]="item.excerpt" class="excerpt"></markdown>
                                      <div class="tis-tags" *ngIf="item.dependencies.length >0">
                                          <span>依赖:</span>
                                          <nz-tag [nzColor]="'blue'" *ngFor="let d of item.dependencies">{{d.name}}:{{d.value}}</nz-tag>
                                      </div>
                                      <div class="tis-tags">
                                          <span>作者:</span>
                                          <nz-tag >TIS官方</nz-tag>
                                          <span>费用:</span>
                                          <nz-tag [nzColor]="'green'">免费</nz-tag>
                                          <span>打包时间:</span>
                                          <nz-tag >{{item.releaseTimestamp| date : "yyyy/MM/dd HH:mm"}}</nz-tag>
                                      </div>
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
              <nz-tab nzTitle="安装状态" (nzClick)="openUpdateCenter()">
                  <ng-template nz-tab>
                      <update-center (loading)="updateCenterLoading($event)"></update-center>
                  </ng-template>
              </nz-tab>
          </nz-tabset>
          <ng-template #extraTemplate>
          </ng-template>
      </nz-spin>
  `, styles: [
      `
            .tis-tags {
                margin-bottom: 5px;
            }

            .tis-tags span {
                display: inline-block;
                margin-right: 5px;
                color: #b7b7b7;
            }

            .excerpt {
                color: #5e5e5e;
                padding: 5px 0 5px 0px;
            }
    `
  ]
})
export class PluginManageComponent extends BasicFormComponent implements OnInit {

  pager: Pager = new Pager(1, 1);
  avaliablePlugs: Array<any> = [];
  installedPlugs: Array<PluginInfo> = [];
  selectedIndex = 0;

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

    this.route.params.subscribe((params: Params) => {
      let tab = params["tab"];
      switch (tab) {
        case PluginTab.updateCenter:
          this.selectedIndex = 2;
          break;
        case PluginTab.installed: {
          this.selectedIndex = 1;
          this.httpPost('/coredefine/corenodemanage.ajax'
            , 'action=plugin_action&emethod=get_installed_plugins')
            .then((r) => {
              if (r.success) {
                this.installedPlugs = r.bizresult;
              }
            });
          break;
        }
        case PluginTab.avail:
        default: {
          this.selectedIndex = 0;
          this.httpPost('/coredefine/corenodemanage.ajax'
            , `action=plugin_action&emethod=get_available_plugins`)
            .then((r) => {
              this.pager = Pager.create(r);
              // this.logs = r.bizresult.rows;
              this.avaliablePlugs = r.bizresult.rows;
            });
        }
      }

    });


  }

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
          this.goto(PluginTab.updateCenter)
        }
      });

  }

  openInstalledPlugins() {
    this.goto(PluginTab.installed);
  }

  openUpdateCenter() {
    this.goto(PluginTab.updateCenter);
  }

  openAvailable() {
    this.goto(PluginTab.avail);
  }

  private goto(subpath: string) {
    this.router.navigate(["/base/plugin-manage", subpath], {relativeTo: this.route});
  }

  updateCenterLoading(load: boolean) {
    this.formDisabled = load;
  }
}

interface PluginInfo {
  name: string;
  version: string;
  website: string;
  checked: boolean;
}
