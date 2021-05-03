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

import {AfterContentInit, Component, Input} from "@angular/core";


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

class CaptionSteps {
  constructor(public caption: string, public steps: Array<string>) {
  }
}
