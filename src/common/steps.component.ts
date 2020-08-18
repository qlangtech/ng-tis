import {AfterContentInit, Component, Input} from "@angular/core";


// const typeCreateIndex = "createIndex";

enum StepType {
  CreateIndex = "createIndex",
  CreateIncr = "createIncr"
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
  }

  ngAfterContentInit() {

  }


}

class CaptionSteps {
  constructor(public caption: string, public steps: Array<string>) {
  }
}
