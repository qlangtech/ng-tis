import {AfterContentInit, Component, Input} from "@angular/core";


const typeCreateIndex = "createIndex";

// implements OnInit, AfterContentInit
@
  Component({
    selector: 'tis-steps',
    template: `
        <div class="tis-steps">
            <nz-steps [nzCurrent]="step">
                <nz-step *ngFor="let s of this.processMap.get(this.type) let i = index" [nzTitle]="stepLiteria[i]" [nzDescription]="s"></nz-step>
            </nz-steps>
        </div>
    `,
    styles: [
        `
            .tis-steps {
                margin: 20px 0 20px 0;
            }
      `
    ]
  })
export class TisStepsComponent implements AfterContentInit {
  processMap = new Map<string, Array<string>>();
  stepLiteria = ["第一步", "第二步", "第三步", "第四步", "第五步", "第六步", "第七步", "第八步", "第九步"]
  @Input()
  type: "createIndex";

  @Input()
  step = 0;


  constructor() {
    let createIndexPhase: Array<string> = ["基本信息", "元数据信息", "服务器节点", "确认"];
    this.processMap.set(typeCreateIndex, createIndexPhase);
  }

  ngAfterContentInit() {

  }


}
