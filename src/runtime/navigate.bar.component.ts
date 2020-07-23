/**
 * Created by baisui on 2017/3/29 0029.
 */
import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {TISService} from "../service/tis.service";
// import {Application} from "../index/application";
import {BasicFormComponent, CurrentCollection} from "../common/basic.form.component";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ActivatedRoute, Router, RouterOutlet} from "@angular/router";
import {Observable, Subject} from 'rxjs';
import {debounceTime, map, switchMap} from 'rxjs/operators';
import {HttpClient} from "@angular/common/http";
import {LocalStorageService} from "angular-2-local-storage";
import {LatestSelectedIndex, SelectedIndex} from "../common/LatestSelectedIndex";
// @ts-ignore
import * as $ from 'jquery';
import {NzModalService} from "ng-zorro-antd";

const KEY_LOCAL_STORAGE_LATEST_INDEX = 'LatestSelectedIndex';


@Component({
  selector: 'my-navigate',
  template: `
    <nav id="tis-navbar" class="navbar navbar-expand-lg navbar-light bg-light">
      <div [ngSwitch]="appHasNotDefine">
        <a *ngSwitchCase="true" class="navbar-brand" href="javascript:void(0)">
            <svg version="1.1"
                 preserveAspectRatio="xMinYMin meet"
                 xmlns="http://www.w3.org/2000/svg"
                 width="50" height="31"
                 xmlns:xlink="http://www.w3.org/1999/xlink">

                <image xlink:href="/images/icon/tis-log.svg" width="50" height="31"/>
            </svg>
        </a>
        <a *ngSwitchCase="false" class="navbar-brand" routerLink="/base/applist">
          <i class="fa fa-home fa-2x" aria-hidden="true"></i></a>
      </div>
      <button class="navbar-toggler" type="button" data-toggle="collapse"
              data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
              aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto" *ngIf="!appHasNotDefine">

          <li class="nav-item" style="width:250px;">
            <form class="form-inline">

              <nz-select name="selectedCollection"
                         style="width: 100%;"
                         [nzSize]="'large'"
                         [(ngModel)]="app.name"
                         nzPlaceHolder="Select Index"
                         nzShowSearch
                         (ngModelChange)="onCollectionChange($event)"
                         [nzServerSearch]="true"
                         (nzOnSearch)="onCollectionSearch($event)"
              >
                <ng-container *ngFor="let o of collectionOptionList">
                  <nz-option *ngIf="!isLoading" [nzValue]="o" [nzLabel]="o"></nz-option>
                </ng-container>
                <nz-option *ngIf="isLoading" nzDisabled nzCustomContent>
                  <i nz-icon nzType="loading" class="loading-icon"></i> Loading...
                </nz-option>
              </nz-select>

            </form>
          </li>
        </ul>
        <ul class="navbar-nav  mr-auto" *ngIf="appHasNotDefine">
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarMyIndex" data-toggle="dropdown"
               aria-haspopup="true" aria-expanded="false">我的索引</a>
            <div class="dropdown-menu" aria-labelledby="navbarMyIndex">
              <a class="dropdown-item" routerLink="/base/applist"><i class="fa fa-list-ul"
                                                                     aria-hidden="true"></i>列表</a>
              <a class="dropdown-item" routerLink="/base/appadd"><i class="fa fa-plus" aria-hidden="true"></i>添加</a>
            </div>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarManage" data-toggle="dropdown"
               aria-haspopup="true" aria-expanded="false">基础管理</a>
            <div class="dropdown-menu" aria-labelledby="navbarManage">

              <a class="dropdown-item" routerLink="/base/departmentlist">业务线</a>
              <a class="dropdown-item" routerLink="/base/basecfg">插件配置</a>
              <a class="dropdown-item" routerLink="/base/tpl/snapshotset">索引模版</a>
              <a class="dropdown-item" routerLink="/base/globalparams">全局参数</a>
              <a class="dropdown-item" routerLink="/base/operationlog">操作日志</a>
            </div>
          </li>

          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDatasource" data-toggle="dropdown"
               aria-haspopup="true" aria-expanded="false">离线数据</a>
            <div class="dropdown-menu" aria-labelledby="navbarDatasource">
              <a class="dropdown-item" routerLink="/offline/ds">数据源管理</a>
              <a class="dropdown-item" routerLink="/offline/wf">DF管理</a>
            </div>
          </li>

          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarUsers" data-toggle="dropdown"
               aria-haspopup="true" aria-expanded="false">权限</a>
            <div class="dropdown-menu" aria-labelledby="navbarUsers">
              <a class="dropdown-item" href="/runtime/role_list.htm">角色</a>
              <a class="dropdown-item" href="/runtime/func_list.htm">功能</a>
              <a class="dropdown-item" routerLink="/t/usr">用户</a>
            </div>
          </li>
        </ul>
        <ul class="navbar-nav my-2 my-lg-0">
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarProfile" data-toggle="dropdown"
               aria-haspopup="true" aria-expanded="false">百岁</a>
            <div class="dropdown-menu" aria-labelledby="navbarProfile">
              <a class="dropdown-item" href="#">信息</a>
              <a class="dropdown-item" href="#">退出</a>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  `
})
export class NavigateBarComponent extends BasicFormComponent implements OnInit {
  // 页面部门控件选择的部门Id

  public appId: string;
  app: CurrentCollection;
  // public departmentId: number = -1;
  // public ops: any[];
  @ViewChild(RouterOutlet, {static: false}) router: RouterOutlet;
  // selectedIndex ;
  collectionOptionList: string[] = ['search4totalpay'];
  isLoading: boolean;

  searchChange$ = new Subject<string>();

  @Input() set core(idxapp: any) {
    this.app = idxapp;
  }

  public get appHasNotDefine(): boolean {
    return this.app == null;
  }

  constructor(tisService: TISService, modalService: NzModalService
    , private r: Router, private route: ActivatedRoute, private _http: HttpClient
    , private _localStorageService: LocalStorageService
  ) {
    super(tisService, modalService);
  }


  ngOnInit(): void {
    const getIndeNameList = (fuzzName: string) => {
      return this._http
        .get(`/tjs/runtime/applist.ajax?emethod=query_app&action=app_view_action&query=${fuzzName}`)
        .pipe(map((res: any) => res.bizresult))
        .pipe(
          map((list: any) => {
            return list.map((item: any) => `${item.projectName}`);
          })
        );
    }

    const optionList$: Observable<string[]> = this.searchChange$
      .asObservable()
      .pipe(debounceTime(500))
      .pipe(switchMap(getIndeNameList));

    optionList$.subscribe(data => {
      this.collectionOptionList = data;
      this.isLoading = false;
    });
    let popularSelected: LatestSelectedIndex = this._localStorageService.get(KEY_LOCAL_STORAGE_LATEST_INDEX);

    if (popularSelected) {
      popularSelected = $.extend(new LatestSelectedIndex(), popularSelected);
    } else {
      popularSelected = new LatestSelectedIndex();
    }

    if (this.app) {
      popularSelected.addIfNotContain(this.app);
    }

    this.collectionOptionList = popularSelected.popularLatestSelected;
  }

  test(): void {
    console.log(this.collectionOptionList);
  }

  // 业务线控件的值发生变化
  // public departmentChange(): void {
  //   this.tisService.getIndexListByDptId(this.departmentId).then(indexs =>
  //     this.ops = indexs
  //   );
  // }

  // 点击切换当前app
  public change_app_top(): void {
    // this.httpPost('/runtime/changedomain.ajax'
    //   , 'event_submit_do_change_app_ajax=y&action=change_domain_action&selappid=' + this.appId)
    //   .then(result => {
    //     // this.refreshComponent(this.router.component);
    //   });
    // this.r.navigate(['/t/c/' + this.appId], {relativeTo: this.route});

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

  onCollectionChange(value: any) {
    let popularSelected: LatestSelectedIndex = this._localStorageService.get(KEY_LOCAL_STORAGE_LATEST_INDEX);
    if (!popularSelected) {
      popularSelected = new LatestSelectedIndex();
    } else {
      popularSelected = $.extend(new LatestSelectedIndex(), popularSelected);
    }
    popularSelected.add(new SelectedIndex(this.app.appName));
    this._localStorageService.set(KEY_LOCAL_STORAGE_LATEST_INDEX, popularSelected);
    // console.log(popularSelected.popularLatestSelected);
    this.collectionOptionList = popularSelected.popularLatestSelected;
    this.r.navigate(['/c/' + this.app.appName]);
  }
}
