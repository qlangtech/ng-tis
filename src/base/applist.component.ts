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

import {TISService} from '../service/tis.service';
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {BasicFormComponent} from '../common/basic.form.component';

import {Pager} from '../common/pagination.component';
import {NzModalService} from "ng-zorro-antd";
import {Application} from "../index/application";


// 全局配置文件
@Component({
  template: `
      <form>
          <tis-page-header title="索引实例">
              <tis-header-tool>
                  <button nz-button nzType="primary" nz-dropdown [nzDropdownMenu]="menu"><i class="fa fa-plus" aria-hidden="true"></i>添加<i nz-icon nzType="down"></i></button>
                  <nz-dropdown-menu #menu="nzDropdownMenu">
                      <ul nz-menu>
                          <li nz-menu-item>
                              <a (click)="gotAddIndex()">搜索实例</a>
                          </li>
                          <li nz-menu-item>
                              <a routerLink="/base/dataxadd">Datax</a>
                          </li>
                      </ul>
                  </nz-dropdown-menu>
              </tis-header-tool>
          </tis-page-header>
          <tis-page [rows]="pageList" [pager]="pager" [spinning]="formDisabled" (go-page)="gotoPage($event)">
              <tis-col title="实例名称" width="14" (search)="filterByAppName($event)">
                  <ng-template let-app='r'>
                      <button nz-button nzType="link" (click)="gotoApp(app)">{{app.projectName}}</button>
                  </ng-template>
              </tis-col>
              <tis-col title="实例类型">
                  <ng-template let-app="r">
                      <ng-container [ngSwitch]="app.appType">
                          <nz-tag *ngSwitchCase="1" [nzColor]="'processing'">Solr</nz-tag>
                          <nz-tag *ngSwitchCase="2" [nzColor]="'processing'">DataX</nz-tag>
                      </ng-container>
                      <!--
                      <a [routerLink]="['/offline/wf_update',app.dataflowName]">{{app.dataflowName}}</a>
                     -->
                  </ng-template>
              </tis-col>
              <tis-col title="接口人" width="14" field="recept"></tis-col>
              <tis-col title="归属部门" field="dptName">
                  <ng-template let-app='r'>
   <span style="color:#999999;" [ngSwitch]="app.dptName !== null">
   <i *ngSwitchCase="true">{{app.dptName}}</i>
   <i *ngSwitchDefault>未设置</i></span>
                  </ng-template>
              </tis-col>
              <tis-col title="创建时间" width="20">
                  <ng-template let-app='r'> {{app.createTime | date : "yyyy/MM/dd HH:mm:ss"}}</ng-template>
              </tis-col>
          </tis-page>
      </form>
  `
})
export class ApplistComponent extends BasicFormComponent implements OnInit {

  // allrowCount: number;
  pager: Pager = new Pager(1, 1);
  pageList: Array<Application> = [];

  constructor(tisService: TISService, private router: Router, private route: ActivatedRoute, modalService: NzModalService
  ) {
    super(tisService, modalService);
  }


  ngOnInit(): void {
    this.route.queryParams.subscribe((param) => {

      let nameQuery = '';
      for (let key in param) {
        nameQuery += ('&' + key + '=' + param[key]);
      }
      this.httpPost('/runtime/applist.ajax'
        , 'emethod=get_apps&action=app_view_action' + nameQuery)
        .then((r) => {
          if (r.success) {
            this.pager = Pager.create(r);
            this.pageList = r.bizresult.rows;
          }
        });
    })
  }

  public gotoPage(p: number) {

    Pager.go(this.router, this.route, p);
  }


  // 跳转到索引维护页面
  public gotoAppManage(app: { appId: number }): void {

    this.httpPost('/runtime/changedomain.ajax'
      , 'event_submit_do_change_app_ajax=y&action=change_domain_action&selappid=' + app.appId)
      .then(result => {
        this.router.navigate(['/corenodemanage']);
      });

  }

  public gotAddIndex(): void {
    this.router.navigate(['/base/appadd']);
  }

  /**
   * 使用索引名称来进行查询
   * @param query
   */
  filterByAppName(data: { query: string, reset: boolean }) {
    // console.log(query);
    Pager.go(this.router, this.route, 1, {name: data.reset ? null : data.query});
  }

  gotoApp(app: Application) {
    // <a [routerLink]="['/c',app.projectName]">{{app.projectName}}</a>
    if (app.appType === 1) {
      this.router.navigate(['/c', app.projectName]);
    } else if (app.appType === 2) {
      this.router.navigate(['/x', app.projectName]);
    }
  }
}
