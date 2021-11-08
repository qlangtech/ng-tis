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

import {AfterContentInit, Component, ContentChildren, EventEmitter, Input, OnInit, Output, QueryList} from "@angular/core";
import {NzModalService} from "ng-zorro-antd/modal";
import {PageHeaderLeftComponent} from "./pager.header.component";
import {TisResponseResult} from "./tis.plugin";


// const typeCreateIndex = "createIndex";

export enum StepType {
  CreateIndex = "createIndex",
  CreateIncr = "createIncr",
  CreateDatax = "createDatax",
  CreateWorkderOfDataX = "CreateWorkderOfDataX",
  UpdateDataxWriter = "UpdateDataxWriter",
  UpdateDataxReader = 'UpdateDataxReader'
}

// implements OnInit, AfterContentInit
@Component({
  selector: 'tis-steps',
  template: `
      <div class="tis-steps">
          <h2 class="caption">{{processMap.get(this.type).caption}}</h2>
          <nz-steps [nzCurrent]="step">
              <nz-step *ngFor="let s of this.processMap.get(this.type).steps let i = index" [nzTitle]="stepLiteria[i]" [nzDescription]="s"></nz-step>
          </nz-steps>
      </div>
  `,
  styles: [
      `
          .caption {
              color: #71c4ff;
              font-size: 22px;
          }

          .tis-steps {
              margin: 20px 10px 20px 0;
          }
    `
  ]
})
export class TisStepsComponent implements AfterContentInit, OnInit {
  processMap = new Map<string, CaptionSteps>();
  stepLiteria = ["第一步", "第二步", "第三步", "第四步", "第五步", "第六步", "第七步", "第八步", "第九步"]
  @Input()
  type: StepType;

  @Input()
  step = 0;

  constructor() {
    // let createIndexPhase: Array<string> = ;
    this.processMap.set(StepType.CreateIndex, new CaptionSteps("索引实例添加", ["基本信息", "元数据信息", "服务器节点", "确认"]));
    this.processMap.set(StepType.CreateIncr, new CaptionSteps("增量同步添加", ["引擎选择", "Source/Sink配置", "Stream脚本确认",  "状态确认"]));
    this.processMap.set(StepType.CreateDatax, new CaptionSteps("DataX添加", ["基本信息", "Reader设置", "Writer设置", "表映射", "确认"]));
    this.processMap.set(StepType.UpdateDataxReader, new CaptionSteps("DataX Reader 更 新", ["Reader设置", "Writer设置", "表映射", "确认"]));
    this.processMap.set(StepType.UpdateDataxWriter, new CaptionSteps("DataX Writer 更 新", ["Writer设置", "表映射", "确认"]));
    this.processMap.set(StepType.CreateWorkderOfDataX, new CaptionSteps("DataX分布式执行器添加", ["K8S基本信息", "K8S资源规格", "确认"]));
  }

  ngOnInit(): void {

  }

  ngAfterContentInit() {

  }
}

@Component({
  selector: 'tis-steps-tools-bar',
  template: `
      <tis-page-header [result]="result" [showBreadcrumb]="false">
          <tis-page-header-left *ngIf="this.title">{{title}}</tis-page-header-left>
          <tis-header-tool>
              <ng-container *ngIf="cancel.observers.length>0">
                  <button nz-button (click)="cancelSteps()"><i nz-icon nzType="logout" nzTheme="outline"></i>取消</button> &nbsp;
              </ng-container>
              <ng-container *ngIf="goBackBtnShow && goBack.observers.length>0">
                  <button nz-button (click)="goBack.emit($event)"><i nz-icon nzType="step-backward" nzTheme="outline"></i>上一步</button> &nbsp;
              </ng-container>
              <ng-container *ngIf="goOnBtnShow && goOn.observers.length>0">
                  <button nz-button nzType="primary" (click)="goOn.emit($event)"><i nz-icon nzType="step-forward" nzTheme="outline"></i>下一步</button>
              </ng-container>
              <ng-content select="final-exec-controller"></ng-content>
          </tis-header-tool>
      </tis-page-header>
  `,
  styles: [
      `
          tis-page-header-left {
              color: #b7d6ff;
              padding-left: 10px;
              border-left: 6px solid rgba(140, 170, 255, 0.31);
          }
    `
  ]
})
export class TisStepsToolbarComponent implements AfterContentInit {

  @Input()
  goOnBtnShow = true;
  @Input()
  goBackBtnShow = true;

  @Input()
  result: TisResponseResult;

  @Output() cancel = new EventEmitter<any>();
  @Output() goBack = new EventEmitter<any>();
  @Output() goOn = new EventEmitter<any>();

  @Input() title: string;

  @ContentChildren(PageHeaderLeftComponent) headerLeftSelect: QueryList<PageHeaderLeftComponent>;

  constructor(private modal: NzModalService) {
  }

  ngAfterContentInit() {
  }

  cancelSteps() {
    this.modal.confirm({
      nzTitle: '<i>确认</i>',
      nzContent: '<b>您是否确定要退出此流程</b>',
      nzOnOk: () => {
        this.cancel.emit();
      }
    });
  }
}

class CaptionSteps {
  constructor(public caption: string, public steps: Array<string>) {
  }
}
