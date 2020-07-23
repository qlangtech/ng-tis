import {AfterContentInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild} from "@angular/core";
import {TISService} from "../service/tis.service";
import {AppFormComponent, CurrentCollection} from "../common/basic.form.component";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ActivatedRoute} from "@angular/router";
import {EditorConfiguration} from "codemirror";
import {IndexIncrStatus} from "./incr.build.component";
// import {IncrBuildStep1ParamsSetComponent} from "./incr.build.step1_1_params_set.component";
import {FormGroup} from "@angular/forms";
import {Item, PluginSaveResponse} from "../common/tis.plugin";
import {NzModalService} from "ng-zorro-antd";
import {PluginsComponent} from "../common/plugins.component";

// import {eventNames} from "cluster";


@Component({
  template: `
      <tis-steps type="createIncr" [step]="0"></tis-steps>
      <tis-page-header [showBreadcrumb]="false" [result]="result">
          <tis-header-tool>
          </tis-header-tool>
      </tis-page-header>
      <nz-spin nzSize="large" [nzSpinning]="formDisabled">
          <nz-tabset [nzTabBarExtraContent]="extraTemplate" [(nzSelectedIndex)]="tabSelectIndex">
              <nz-tab nzTitle="配置" (nzDeselect)="configDeSelect($event)">
                  <ng-template nz-tab>
                      <tis-plugins [savePlugin]="savePlugin" [plugins]="this.plugins" (ajaxOccur)="buildStep1ParamsSetComponentAjax($event)" #buildStep1ParamsSetComponent></tis-plugins>
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
              <nz-affix [nzOffsetTop]="10">
                  <button nz-button nzType="primary" (click)="createIndexStep1Next()" [nzLoading]="this.formDisabled"><i nz-icon nzType="save" nzTheme="outline" ></i>保存&下一步</button>
                  &nbsp;
                  <button nz-button nzType="default" (click)="cancelStep()">取消</button>
              </nz-affix>
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
  plugins = [{name: 'mq', require: true}];

  savePlugin = new EventEmitter<any>();
  tabSelectIndex = 0;
  // private configParamForm: FormGroup;

  // @ViewChild('buildStep1ParamsSetComponent', {static: false}) buildStep1ParamsSetComponent: IncrBuildStep1ParamsSetComponent;

  constructor(tisService: TISService, route: ActivatedRoute, modalService: NzModalService) {
    super(tisService, route, modalService);
  }

  ngOnInit(): void {

    if (!this.dto.k8sPluginInitialized) {
      this.plugins.push({name: 'incr-config', require: true});
    }
    super.ngOnInit();
  }

  tabChange(index: number) {

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
    // console.log("tabSelectIndex:" + this.tabSelectIndex)
    if (this.tabSelectIndex === 0) {
      // 当前正在 '配置' tab
      this.savePlugin.emit();
    } else {
      // 当前正在 '执行脚本' tab
      this.compileAndPackageIncr();
    }

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

  private compileAndPackageIncr() {
    let url = '/coredefine/corenodemanage.ajax?emethod=compileAndPackage&action=core_action';
    this.jsonPost(url, {}).then((result) => {
      if (result.success) {
        // 执行编译打包
        this.nextStep.emit(this.dto);
      } else {
        let errFields = result.errorfields;
        if (errFields.length > 0) {
          let errFieldKey = "incr_script_compile_error";
          let item: Item = Item.create(errFieldKey);
          PluginsComponent.processErrorField(errFields[0], [item]);
          if ("error" === item.vals[errFieldKey].error) {
            this.tabSelectIndex = 1;
          }
        }
      }
    });
  }

  cancelStep() {
  }

  buildStep1ParamsSetComponentAjax(event: PluginSaveResponse) {

    if (event.saveSuccess) {
      // 成功
      // let url = '/coredefine/corenodemanage.ajax?event_submit_do_save_script_meta=y&action=core_action';
      //  this.jsonPost(url, {}).then((r) => {
      //    if (r.success) {
      // r.bizresult;
      this.compileAndPackageIncr();
      // this.nextStep.emit(this.dto);
      //  console.log("ddddddddddddd");
      //   }
      // });
    }

    setTimeout(() => {
      this.formDisabled = event.formDisabled;
    })
  }
}
