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

import {AfterContentInit, Component, ContentChildren, EventEmitter, Input, Output, QueryList} from "@angular/core";
import {NzModalService, NzSelectComponent} from "ng-zorro-antd";
import {PageHeaderLeftComponent} from "./pager.header.component";


// const typeCreateIndex = "createIndex";

enum StepType {
  CreateIndex = "createIndex",
  CreateIncr = "createIncr",
  CreateDatax = "createDatax",
  CreateWorkderOfDataX = "CreateWorkderOfDataX"
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
              letter-spacing: 10px;
          }

          .tis-steps {
              margin: 20px 10px 20px 0;
          }
    `
  ]
})
export class TisStepsComponent implements AfterContentInit {
  processMap = new Map<string, CaptionSteps>();
  stepLiteria = ["第一步", "第二步", "第三步", "第四步", "第五步", "第六步", "第七步", "第八步", "第九步"]
  @Input()
  type: StepType;

  @Input()
  step = 0;


  constructor() {
    // let createIndexPhase: Array<string> = ;
    this.processMap.set(StepType.CreateIndex, new CaptionSteps("索引实例添加", ["基本信息", "元数据信息", "服务器节点", "确认"]));
    this.processMap.set(StepType.CreateIncr, new CaptionSteps("增量通道添加", ["脚本生成", "构建部署", "状态确认"]));
    this.processMap.set(StepType.CreateDatax, new CaptionSteps("DataX添加", ["基本信息", "Reader设置", "Writer设置", "表映射", "确认"]));
    this.processMap.set(StepType.CreateWorkderOfDataX, new CaptionSteps("DataX执行器添加", ["K8S基本信息", "K8S资源规格", "确认"]));
  }

  ngAfterContentInit() {

  }
}

@Component({
  selector: 'tis-steps-tools-bar',
  template: `
      <tis-page-header [showBreadcrumb]="false">
          <tis-header-tool>
              <ng-container *ngIf="cancel.observers.length>0">
                  <button nz-button (click)="cancelSteps()"><i nz-icon nzType="logout" nzTheme="outline"></i>取消</button> &nbsp;
              </ng-container>
              <ng-container *ngIf="goBack.observers.length>0">
                  <button nz-button (click)="goBack.emit($event)"><i nz-icon nzType="step-backward" nzTheme="outline"></i>上一步</button> &nbsp;
              </ng-container>
              <ng-container *ngIf="goOn.observers.length>0">
                  <button nz-button nzType="primary" (click)="goOn.emit($event)"><i nz-icon nzType="step-forward" nzTheme="outline"></i>下一步</button>
              </ng-container>
              <ng-content select="final-exec-controller"></ng-content>
          </tis-header-tool>
      </tis-page-header>
  `,
  styles: [
      `
    `
  ]
})
export class TisStepsToolbarComponent implements AfterContentInit {

  @Output() cancel = new EventEmitter<any>();
  @Output() goBack = new EventEmitter<any>();
  @Output() goOn = new EventEmitter<any>();

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
