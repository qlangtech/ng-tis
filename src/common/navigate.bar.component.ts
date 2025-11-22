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

/**
 * Created by baisui on 2017/3/29 0029.
 */
import {Component, EventEmitter, Input, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {
  createFreshmanReadmeDialogStrategy,
  createSystemErrorProcessDialogModelOptions,
  TISService
} from "./tis.service";
import {BasicFormComponent, CurrentCollection} from "./basic.form.component";

import {ActivatedRoute, Router, RouterOutlet} from "@angular/router";
import {Observable, Subject} from 'rxjs';
import {debounceTime, map, switchMap} from 'rxjs/operators';
import {HttpClient} from "@angular/common/http";
import {LocalStorageService} from "./local-storage.service";
import {LatestSelectedIndex, SelectedIndex} from "./LatestSelectedIndex";
// @ts-ignore
import {NzModalRef, NzModalService} from "ng-zorro-antd/modal";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {InitSystemComponent} from "./init.system.component";
import {TisResponseResult} from "./tis.plugin";
import {Application} from "./application";
import {openParamsCfg} from "./plugins.component";


@Component({
  selector: 'my-navigate',
  template: `
    <div class="logo" [ngSwitch]="appHasNotDefine">
      <a *ngSwitchCase="true" class="navbar-brand" routerLink="/">
        <img src="/images/icon/tis-log.svg" width="42" height="26" alt="TIS Logo"/>
      </a>
      <ng-container *ngSwitchCase="false">
        <a class="navbar-brand" routerLink="/base/applist">
          <i class="fa fa-home home-icon" aria-hidden="true"></i></a>
      </ng-container>
    </div>

    <ul class="nav-items" nz-menu nzTheme="dark" nzMode="horizontal" [ngSwitch]="appHasNotDefine">
      <div class="nav-menu-group">
        <ng-container *ngSwitchCase="true">
          <li nz-menu-item>
            <a nz-dropdown [nzDropdownMenu]="myIndex">
              我的管道
              <i nz-icon nzType="down"></i>
            </a>
            <nz-dropdown-menu #myIndex="nzDropdownMenu">
              <ul nz-menu nzSelectable>
                <li nz-menu-item><a routerLink="/base/applist"><i class="fa fa-list-ul"
                                                                  aria-hidden="true"></i>列表</a></li>
                <li nz-menu-item><a routerLink="/base/dataxadd"><i class="fa fa-plus" aria-hidden="true"></i>添加</a></li>
              </ul>
            </nz-dropdown-menu>
          </li>
          <li nz-menu-item>
            <a nz-dropdown [nzDropdownMenu]="baseManage">
              基础管理
              <i nz-icon nzType="down"></i>
            </a>
            <nz-dropdown-menu #baseManage="nzDropdownMenu">
              <ul nz-menu nzSelectable>
                <li nz-menu-item><a routerLink="/base/departmentlist">业务线</a></li>
                <li nz-menu-item><a routerLink="/base/user-profile">会员</a></li>
                <li nz-menu-item><a routerLink="/base/datax-worker">DataX执行器</a></li>
                <li nz-menu-item><a routerLink="/base/flink-cluster-list">Flink Cluster</a></li>
                <li nz-menu-item><a routerLink="/base/basecfg">插件配置</a></li>
                <!--              <li nz-menu-item><a routerLink="/base/tpl/snapshotset">索引模版</a></li>-->
                <li nz-menu-item><a routerLink="/base/operationlog">操作日志</a></li>
                <li nz-menu-item><a routerLink="/base/sys-errors">系统异常</a></li>
                <li nz-menu-item><a href="javascript:void()" (click)="openLicense()">License</a></li>
                <li nz-menu-item><a href="javascript:void()" (click)="openFreshManReadme()">新人指南</a></li>
              </ul>
            </nz-dropdown-menu>
          </li>

          <li nz-menu-item>
            <a nz-dropdown [nzDropdownMenu]="offlineManage">
              离线数据
              <i nz-icon nzType="down"></i>
            </a>
            <nz-dropdown-menu #offlineManage="nzDropdownMenu">
              <ul nz-menu nzSelectable>
                <li nz-menu-item><a routerLink="/offline/ds">数据源管理</a></li>
                <li nz-menu-item><a routerLink="/offline/wf">数据流分析（EMR）</a></li>
              </ul>
            </nz-dropdown-menu>
          </li>
        </ng-container>
        <ng-container *ngSwitchCase="false">

          <li class="index-select-block" nz-menu-item nzMatchRouter>
            <nz-select name="selectedCollection"
                       style="width: 100%;"
                       [compareWith]="selectedCollectionCompareFn"
                       [nzSize]="'large'"
                       [ngModel]="app"
                       nzPlaceHolder="请选择"
                       [nzDropdownMatchSelectWidth]="false"
                       nzShowSearch
                       (ngModelChange)="onCollectionChange($event)"
                       [nzServerSearch]="true"
                       (nzOnSearch)="onCollectionSearch($event)"
            >
              <ng-container *ngFor="let o of collectionOptionList">
                <nz-option *ngIf="!isLoading" [nzValue]="o" [nzLabel]="o.name"></nz-option>
              </ng-container>
              <nz-option *ngIf="isLoading" nzDisabled nzCustomContent>
                <i nz-icon nzType="loading" class="loading-icon"></i> Loading...
              </nz-option>
            </nz-select>
          </li>
        </ng-container>
      </div>

      <div class="nav-toolbar-group">
        <li class="nav-toolbar-item tis-about">
          <button nz-button nzType="link" class="about-btn" (click)="openTisAbout()">
            <i nz-icon nzType="info-circle" nzTheme="outline"></i>
            <span>关于</span>
          </button>
        </li>
        <li class="nav-toolbar-item user-profile">
          <a class="github-stars" nz-tooltip [nzTooltipTitle]="tisStarsTpl" nzTooltipTrigger="click">
            <i nz-icon nzType="github" nzTheme="outline"></i>
            <img src="https://img.shields.io/github/stars/datavane/tis.svg" alt="GitHub Stars"/>
          </a>
          <ng-template #tisStarsTpl>
            <div class="stars-tooltip">
              <p>如果觉得TIS对您有帮助，请加一个小星星吧</p>
              <a href="https://github.com/datavane/tis" target="_blank">https://github.com/datavane/tis</a>
            </div>
          </ng-template>
        </li>
        <li class="nav-toolbar-item user-menu">
          <button nz-button nzType="text" nz-dropdown [nzDropdownMenu]="user" class="user-btn">
            <i nz-icon nzType="user" nzTheme="outline"></i>
            <span class="user-name">{{userProfile?.name}}</span>
            <i nz-icon nzType="down" class="dropdown-icon"></i>
          </button>
          <nz-dropdown-menu #user="nzDropdownMenu">
            <ul nz-menu>
              <li nz-menu-item (click)="viewProfile()">
                <i nz-icon nzType="info" nzTheme="outline"></i>
                <span>信息</span>
              </li>
              <li nz-menu-item (click)="logout()">
                <i nz-icon nzType="logout" nzTheme="outline"></i>
                <span>退出</span>
              </li>
            </ul>
          </nz-dropdown-menu>
        </li>
      </div>
      <!--
                <li nz-menu-item>
                    <a class="nav-link dropdown-toggle" href="#" id="navbarUsers" data-toggle="dropdown"
                       aria-haspopup="true" aria-expanded="false">权限</a>
                    <div class="dropdown-menu" aria-labelledby="navbarUsers">
                        <a class="dropdown-item" href="/runtime/role_list.htm">角色</a>
                        <a class="dropdown-item" href="/runtime/func_list.htm">功能</a>
                        <a class="dropdown-item" routerLink="/t/usr">用户</a>
                    </div>
                </li>
         -->
    </ul>

    <ng-template #tisAbout>
      <nz-descriptions [nzColumn]="1" nzLayout="horizontal">
        <nz-descriptions-item nzTitle="构建时间">{{tisMeta.createTime}}</nz-descriptions-item>
        <nz-descriptions-item nzTitle="发版时间"><img
          src="https://img.shields.io/github/release-date/baisui1981/tis"/></nz-descriptions-item>
        <nz-descriptions-item nzTitle="版本">{{tisMeta.buildVersion}}</nz-descriptions-item>
      </nz-descriptions>
      <svg version="1.1"
           preserveAspectRatio="xMinYMin meet"
           xmlns="http://www.w3.org/2000/svg"
           width="70" height="43"
           xmlns:xlink="http://www.w3.org/1999/xlink">
        <image xlink:href="/images/icon/tis-log.svg" width="70"/>
      </svg>
    </ng-template>
  `,
  styles: [`
    :host {
      display: block;
      background: #001529 !important;
      overflow: hidden;
    }

    .ng-star-inserted {
      margin: 0;
    }

    .index-select-block {
      width: 300px;
    }

    .nav-items {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .nav-menu-group {
      display: flex;
      align-items: center;
      flex: 0 0 auto;
    }

    .nav-toolbar-group {
      display: flex;
      align-items: center;
      margin-left: auto;
    }

    .navbar-brand {
      font-size: 15px;
      transition: opacity 0.3s ease;
    }

    .navbar-brand:hover {
      opacity: 0.8;
    }

    .logo {
      margin: 5px 24px 0 24px;
      float: left;
      background: #001529 !important;
      padding: 5px 0;
    }

    .logo a {
      display: block;
      background: transparent !important;
      line-height: 0;
    }

    .logo img {
      display: block;
      background: transparent !important;
      vertical-align: middle;
    }

    .home-icon {
      font-size: 26px;
      color: rgba(255, 255, 255, 0.85);
      transition: color 0.3s ease;
    }

    .navbar-brand:hover .home-icon {
      color: #fff;
    }

    /* 工具栏项目样式 - 移除菜单项默认样式 */
    .nav-toolbar-item {
      padding: 0 8px;
      line-height: 48px;
      cursor: default;
      border-bottom: 2px solid transparent;
      position: relative;
      display: inline-flex;
      align-items: center;
    }

    .nav-toolbar-item::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      height: 16px;
      width: 1px;
      background: rgba(255, 255, 255, 0.15);
    }

    .nav-toolbar-item:first-of-type::before {
      display: none;
    }

    /* 关于按钮样式 */
    .about-btn {
      color: rgba(255, 255, 255, 0.85);
      transition: all 0.3s ease;
      padding: 0 8px;
      height: 32px;
      line-height: 32px;
    }

    .about-btn:hover {
      color: #fff;
      background: transparent !important;
    }

    .about-btn i {
      margin-right: 4px;
    }

    /* GitHub Stars 样式 */
    .github-stars {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 0 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      color: rgba(255, 255, 255, 0.85);
    }

    .github-stars:hover {
      transform: translateY(-1px);
      color: #fff;
    }

    .github-stars i {
      font-size: 14px;
    }

    .github-stars img {
      height: 16px;
      vertical-align: middle;
      transition: transform 0.3s ease;
    }

    .github-stars:hover img {
      transform: scale(1.05);
    }

    /* Stars 提示框样式 */
    .stars-tooltip p {
      margin-bottom: 8px;
    }

    .stars-tooltip a {
      color: #1890ff;
      text-decoration: underline;
    }

    .stars-tooltip a:hover {
      color: #40a9ff;
    }

    /* 用户按钮样式 */
    .user-btn {
      color: rgba(255, 255, 255, 0.85);
      padding: 0 8px;
      height: 32px;
      line-height: 32px;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .user-btn:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.1) !important;
    }

    .user-btn .user-name {
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .user-btn .dropdown-icon {
      font-size: 12px;
      transition: transform 0.3s ease;
    }

    .user-btn:hover .dropdown-icon {
      transform: rotate(180deg);
    }

    /* 响应式优化 */
    @media (max-width: 768px) {
      .user-btn .user-name {
        max-width: 80px;
      }

      .nav-toolbar-item {
        padding: 0 4px;
      }
    }
  `]
})
export class NavigateBarComponent extends BasicFormComponent implements OnInit {
  // 页面部门控件选择的部门Id
  public appId: string;
  app: CurrentCollection;
  // public departmentId: number = -1;
  // public ops: any[];
  @ViewChild(RouterOutlet, {static: false}) router: RouterOutlet;
  // selectedIndex ;
  collectionOptionList: Array<SelectedIndex> = [];
  isLoading: boolean;
  userProfile: UserProfile;
  tisMeta: TISMeta = {};

  searchChange$ = new Subject<string>();

  @ViewChild('tisAbout', {read: TemplateRef, static: true}) tisAppAbout: TemplateRef<any>;

  @Input() set core(idxapp: any) {
    this.app = idxapp;
  }

  public get appHasNotDefine(): boolean {
    return this.app == null;
  }

  constructor(tisService: TISService, modalService: NzModalService
    , private r: Router, private route: ActivatedRoute, private _http: HttpClient
    , private _localStorageService: LocalStorageService, notification: NzNotificationService
  ) {
    super(tisService, modalService, notification);
  }

  selectedCollectionCompareFn(c1: any, c2: any): boolean {
    if (!c1 || !c2) {
      return false;
    }
    // console.log([c1, c2]);
    return c1.name === c2.name;
  }

  ngOnInit(): void {

    const getIndeNameList = (fuzzName: string) => {
      return this._http
        .get(`/tjs/runtime/applist.ajax?emethod=query_app&action=app_view_action&query=${fuzzName}`)
        .pipe(map((res: any) => res.bizresult))
        .pipe(
          map((list: any) => {
            return list.map((item: any) => {
              let app = new SelectedIndex(item.projectName, item.appType);
              // `${item.projectName}`
              return app;
            });
          })
        );
    }

    const optionList$: Observable<SelectedIndex[]> = this.searchChange$
      .asObservable()
      .pipe(debounceTime(500))
      .pipe(switchMap(getIndeNameList));

    optionList$.subscribe(data => {
      this.collectionOptionList = data;
      this.isLoading = false;
    });


    this.tisService.tisMeta.then((meta: TISBaseProfile) => {
      this.userProfile = meta.usr;
      this.tisMeta = meta.tisMeta
      let popularSelected = meta.latestSelectedAppsIndex();

      if (this.app) {
        popularSelected.addIfNotContain(this.app);
      }

      this.collectionOptionList = popularSelected.popularLatestSelected;


      if (!meta.sysInitialized) {
        this.openInitSystemDialog();
      }
    });
  }

  openInitSystemDialog() {
    let ref: NzModalRef<InitSystemComponent> = this.openDialog(InitSystemComponent, {
      nzTitle: "初始化TIS",
      nzClosable: false
    });
    ref.afterClose.subscribe((result: TisResponseResult) => {
      if (result.success) {
        this.successNotify("TIS配置初始化完成");
      }
    });
  }

  // 点击切换当前app
  public change_app_top(): void {
    this.r.navigate(['/c/' + this.appId]);
  }

  onCollectionSearch(value: string) {
    if (value) {
      const pattern = /^\s*$/;
      if (!pattern.test(value)) {
        this.isLoading = true;
        this.searchChange$.next(value);
      }
    }
  }

  onCollectionChange(value: SelectedIndex) {
    // console.log(value);
    let app = new Application();
    app.appType = value.appType;
    app.projectName = value.name;
    LatestSelectedIndex.routeToApp(this.tisService, this._localStorageService, this.r, app);
  }


  logout() {

    if (1 === 1) {
      this.viewProfile();
      return;
    }

    let logoutUrl = `/runtime/applist.ajax?emethod=login&action=login_action`;
    this.httpPost(logoutUrl, '').then((r) => {
      this.userProfile = undefined;
    })
  }

  viewProfile() {
    this.infoNotify("用户权限功能还未开放，敬请期待");
  }

  openTisAbout(): void {
    this.modalService.info({
      nzTitle: '关于TIS',
      nzContent: this.tisAppAbout,
      nzOkText: 'OK',
      nzOnOk: () => {
      }
    });
  }

  openLicense(): void {
    openParamsCfg("License",'' ,null, this);
  }

  openFreshManReadme(): void {
    let mref: NzModalRef = null;
    let closeEmitter = new EventEmitter();
    closeEmitter.subscribe((_) => {
      if (mref) {
        mref.close();
      }
    });
    mref = this.modalService.create(createSystemErrorProcessDialogModelOptions(createFreshmanReadmeDialogStrategy(closeEmitter, closeEmitter), null));
  }
}


export interface UserProfile {
  department: string;
  departmentid: number,
  id: string;
  name: string;
}

export interface TISMeta {
  buildVersion?: string;
  createTime?: string;
}

export interface LicenseValidateResult {
  // public final boolean hasNotExpire;
  // public final String expireDate;
  /**
   * 证书没有失效
   */
  hasNotExpire: boolean;
  /**
   * 证书到期时间
   */
  expireDate: string;
}

export interface TISBaseProfile {
  sysInitialized: boolean;
  usr: UserProfile;
  tisMeta: TISMeta;
  license: LicenseValidateResult;
  firstPipelinePK: boolean;
  latestSelectedAppsIndex(): LatestSelectedIndex;
}
