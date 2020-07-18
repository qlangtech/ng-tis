import {AfterContentInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild} from "@angular/core";
import {TISService} from "../service/tis.service";
import {AppFormComponent, CurrentCollection} from "../common/basic.form.component";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ActivatedRoute} from "@angular/router";
import {EditorConfiguration} from "codemirror";
import {IndexIncrStatus} from "./incr.build.component";
// import {IncrBuildStep1ParamsSetComponent} from "./incr.build.step1_1_params_set.component";
import {FormGroup} from "@angular/forms";
import {PluginSaveResponse} from "../common/tis.plugin";
import {NzModalService} from "ng-zorro-antd";

// import {eventNames} from "cluster";


@Component({
  template: `

      <nz-steps nzCurrent="0">
          <nz-step nzTitle="第一步" nzDescription="脚本生成"></nz-step>
          <nz-step nzTitle="第二步" nzDescription="构建部署"></nz-step>
          <nz-step nzTitle="第三步" nzDescription="状态确认"></nz-step>
      </nz-steps>
      <tis-page-header [showBreadcrumb]="false" [result]="result">
          <tis-header-tool>
          </tis-header-tool>
      </tis-page-header>
      <nz-spin nzSize="large" [nzSpinning]="formDisabled">
          <nz-tabset [nzTabBarExtraContent]="extraTemplate" (nzSelectedIndexChange)="tabChange($event)">
              <nz-tab nzTitle="配置" (nzDeselect)="configDeSelect($event)">
                  <ng-template nz-tab>
                      <!--
                      <incr-build-step1-1-params-set (ajaxOccur)="buildStep1ParamsSetComponentAjax($event)" #buildStep1ParamsSetComponent></incr-build-step1-1-params-set>
                    -->
                      <tis-plugins [savePlugin]="savePlugin" [plugins]="['mq']" (ajaxOccur)="buildStep1ParamsSetComponentAjax($event)" #buildStep1ParamsSetComponent></tis-plugins>
                  </ng-template>
              </nz-tab>
              <nz-tab nzTitle="执行脚本">
                  <ng-template nz-tab>
                      <div style="height: 800px">
                          <tis-codemirror name="schemaContent" [(ngModel)]="dto.incrScriptMainFileContent" [config]="codeMirrorCfg"></tis-codemirror>
                      </div>
                  </ng-template>
              </nz-tab>
          </nz-tabset>
          <ng-template #extraTemplate>
              <button nz-button nzType="primary" (click)="createIndexStep1Next()">保存&下一步</button>
              <button nz-button nzType="default" (click)="cancelStep()">取消</button>
          </ng-template>
      </nz-spin>
  `,
  styles: [
      ` nz-step {
          margin: 20px;
      }
    `
  ]
})
export class IncrBuildStep1Component extends AppFormComponent implements AfterContentInit {
  // private _incrScript: string;
  @Output() nextStep = new EventEmitter<any>();
  @Output() preStep = new EventEmitter<any>();
  @Input() dto: IndexIncrStatus;

  savePlugin = new EventEmitter<any>();
  // private configParamForm: FormGroup;

  // @ViewChild('buildStep1ParamsSetComponent', {static: false}) buildStep1ParamsSetComponent: IncrBuildStep1ParamsSetComponent;

  constructor(tisService: TISService, route: ActivatedRoute, modalService: NzModalService) {
    super(tisService, route, modalService);
  }

  tabChange(e: number) {

  }

  configDeSelect(e: void) {
    // this.configParamForm = this.buildStep1ParamsSetComponent.validateForm;
    // console.log(configParamForm.invalid);
  }

  // get incrScript(): string {
  //   return this._incrScript;
  // }
  //
  // set incrScript(value: string) {
  //   this._incrScript = value;
  // }

  get codeMirrorCfg(): EditorConfiguration {
    return {
      mode: "text/x-scala",
      lineNumbers: true
    };
  }

  protected initialize(app: CurrentCollection): void {
  }

  ngAfterContentInit(): void {
  }

  createIncrSyncChannal() {
  }

  createIndexStep1Next() {
    this.savePlugin.emit();
    // if (this.buildStep1ParamsSetComponent) {
    //   let f = this.buildStep1ParamsSetComponent.validateForm;
    //   if (f.invalid) {
    //     return;
    //   }
    //   this.configParamForm = f;
    // } else {
    //   if (!this.configParamForm || this.configParamForm.invalid) {
    //     return;
    //   }
    // }
    // console.log(this.buildStep1ParamsSetComponent.validateForm.valid);
    // console.log(this.buildStep1ParamsSetComponent.validateForm.value);
  }

  cancelStep() {
  }

  buildStep1ParamsSetComponentAjax(event: PluginSaveResponse) {

    if (event.saveSuccess) {
      // 成功
      let url = '/coredefine/corenodemanage.ajax?event_submit_do_save_script_meta=y&action=core_action';
      this.jsonPost(url, {}).then((r) => {
        if (r.success) {
          // r.bizresult;
          this.nextStep.emit(this.dto);
          console.log("ddddddddddddd");
        }
      });
    }

    setTimeout(() => {
      this.formDisabled = event.formDisabled;
    })
  }
}
