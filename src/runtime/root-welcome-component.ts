/**
 * Created by baisui on 2017/3/29 0029.
 */
import {Component, ElementRef, ViewChild} from '@angular/core';
import {TISService} from '../service/tis.service';
// import {BasicEditComponent} from '../corecfg/basic.edit.component';
// import {ScriptService} from '../service/script.service';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AppFormComponent, CurrentCollection} from '../common/basic.form.component';
import {ActivatedRoute, Router} from '@angular/router';
import {EditorConfiguration} from "codemirror";

@Component({
  template: `
      <div id="backgroundText" (dblclick)="backgroupDbClick($event)">TIS</div>
      <my-navigate></my-navigate>
      <nz-layout>
          <nz-content>
              <div id="main-entry">
                  <div nz-row [nzGutter]="8">
                      <div nz-col nzSpan="8">
                          <nz-card [nzHoverable]="true" (click)="gotoIndexList()">
                              <div class="tis-card-content">
                                  <h1>索引实例</h1>
                              </div>
                          </nz-card>
                      </div>
                      <div nz-col nzSpan="8">
                          <nz-card [nzHoverable]="true" (click)="routerTo('/offline/wf')">
                              <div class="tis-card-content">
                                  <h1>数据流</h1>
                              </div>
                          </nz-card>
                      </div>
                      <div nz-col nzSpan="8">
                          <nz-card [nzHoverable]="true" (click)="routerTo('/offline/ds')">
                              <div class="tis-card-content">
                                  <h1>数据源</h1>
                              </div>
                          </nz-card>
                      </div>
                  </div>
                  <div nz-row [nzGutter]="8">
                      <div nz-col nzSpan="8">
                          <nz-card [nzHoverable]="true" (click)="routerTo('/base/basecfg')">
                              <div class="tis-card-content">
                                  <h1><i nz-icon nzType="setting" nzTheme="outline"></i>插件配置</h1>
                              </div>
                          </nz-card>
                      </div>
                      <div nz-col nzSpan="8">
                          <nz-card [nzHoverable]="true" (click)="routerTo('/base/operationlog')">
                              <div class="tis-card-content">
                                  <h1><i nz-icon nzType="snippets" nzTheme="outline"></i>操作日志</h1>
                              </div>
                          </nz-card>
                      </div>
                      <div nz-col nzSpan="8">
                          <nz-card [nzHoverable]="true">
                              <div class="tis-card-content">
                                  <h1><i nz-icon nzType="user" nzTheme="outline"></i>会员</h1>
                              </div>
                          </nz-card>
                      </div>
                  </div>
              </div>
          </nz-content>
          <nz-sider [nzWidth]="400">
              <nz-list [nzDataSource]="data" nzBordered [nzRenderItem]="item" [nzItemLayout]="'horizontal'" [nzHeader]="recentusedindex">
                  <ng-template #item let-item>
                      <nz-list-item>
                          <nz-list-item-meta
                                  [nzTitle]="nzTitle"
                                  nzDescription="Ant Design, a design language for background applications, is refined by Ant UED Team"
                          >
                              <ng-template #nzTitle>
                                  <a href="https://ng.ant.design">{{ item.title }}</a>
                              </ng-template>
                          </nz-list-item-meta>
                      </nz-list-item>
                  </ng-template>
              </nz-list>
              <ng-template #recentusedindex>
                  <div>
                      <div style="float: right">
                          <button nz-button nzType="primary" [nzSize]="'small'">添加</button>
                      </div>
                      <div style="margin-top: 3px;">最近使用</div>
                  </div>
                  <div style="clear: both"></div>
              </ng-template>
          </nz-sider>
      </nz-layout>

  `,
  styles: [
      `
          nz-content {
              min-height: 500px;
          }

          [nz-row] {
              margin: 8px 0 8px 0;
          }

          .tis-card-content {
              height: 150px;
          }

          #main-entry {
              padding: 10px;
          }

          #main-entry h1 {
              text-align: center;
              position: relative;
              top: 50%;
              height: 30px;
              margin-top: -30px;
              color: #767676;
          }

          nz-sider {
              background: #e3e3e3;
          }

          #backgroundText {
              font-size: 4200%;
              font-family: Arial Black, 黑体;
              color: rgba(255, 0, 0, 0.13);
              position: absolute;
              top: 0px;
              left: 20%;
              z-index: -1;
              padding: 0px;
              margin: 0px auto;
              width: 80%;
          }

          #body {
              margin: 0px auto;
              width: 800px;
              height: 800px;
          }
    `
  ]
})
export class RootWelcomeComponent {
  data: any[] = [];


  constructor(private r: Router, private route: ActivatedRoute) {
  }

  backgroupDbClick(event: MouseEvent) {
  }

  gotoIndexList() {
    this.routerTo('/base/applist');
  }

   routerTo(path: string) {
    this.r.navigate([path]);
  }
}
