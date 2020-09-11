import {AfterContentInit, AfterViewChecked, AfterViewInit, Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef} from "@angular/core";
import {TISService} from "../service/tis.service";
import {AppFormComponent, BasicFormComponent, CurrentCollection} from "../common/basic.form.component";

import {ActivatedRoute} from "@angular/router";
import {EditorConfiguration} from "codemirror";
import {MultiViewDAG} from "../common/MultiViewDAG";
import {AddAppFlowDirective} from "../base/addapp.directive";
import {IncrBuildStep0Component} from "./incr.build.step0.component";
import {IncrBuildStep1Component} from "./incr.build.step1.component";
import {IncrBuildStep2Component} from "./incr.build.step2.component";
import {IncrBuildStep3Component} from "./incr.build.step3.component";
import {IncrBuildStep4RunningComponent} from "./incr.build.step4.running.component";
import {NzIconService} from 'ng-zorro-antd/icon';
import {CloseSquareFill} from "@ant-design/icons-angular/icons";
import {NzModalService} from "ng-zorro-antd";
import {IncrDeployment, K8sPodState} from "./misc/incr.deployment";


@Component({
  template: `
      <nz-spin nzSize="large" [nzSpinning]="formDisabled" style="min-height: 300px">
          <ng-template #container></ng-template>
      </nz-spin>`
})
export class IncrBuildComponent extends AppFormComponent implements AfterViewInit, OnInit {

  private _incrScript: string;
  @ViewChild('container', {read: ViewContainerRef, static: true}) containerRef: ViewContainerRef;

  private multiViewDAG: MultiViewDAG;

  public static getIncrStatusThenEnter(basicForm: BasicFormComponent, hander: ((r: IndexIncrStatus) => void), cache = true) {
    basicForm.httpPost('/coredefine/corenodemanage.ajax'
      , `action=core_action&emethod=get_incr_status&cache=${cache}`)
      .then((r) => {
        if (r.success) {
          // r.bizresult.incrScriptCreated;
          let incrStatus: IndexIncrStatus = Object.assign(new IndexIncrStatus(), r.bizresult);
          hander(incrStatus);
        }
      }); // incrScriptMainFileContent
  }


  constructor(tisService: TISService, route: ActivatedRoute, modalService: NzModalService
    , private _componentFactoryResolver: ComponentFactoryResolver, private _iconService: NzIconService) {
    super(tisService, route, modalService);
    _iconService.addIcon(CloseSquareFill);
  }

  protected initialize(app: CurrentCollection): void {
  }

  ngAfterViewInit() {
  }

  protected get codeMirrirCfg(): EditorConfiguration {
    return {
      mode: "text/x-scala",
      lineNumbers: true
    };
  }

  ngOnInit(): void {

    let configFST: Map<any, { next: any, pre: any }> = new Map();

    // 配置步骤前后跳转状态机
    configFST = new Map();
    configFST.set(IncrBuildStep0Component, {next: IncrBuildStep1Component, pre: null});
    configFST.set(IncrBuildStep1Component, {next: IncrBuildStep2Component, pre: IncrBuildStep0Component});
    configFST.set(IncrBuildStep2Component, {next: IncrBuildStep3Component, pre: IncrBuildStep1Component});
    configFST.set(IncrBuildStep3Component, {next: IncrBuildStep4RunningComponent, pre: IncrBuildStep2Component});
    configFST.set(IncrBuildStep4RunningComponent, {next: IncrBuildStep0Component, pre: IncrBuildStep3Component});
    // console.log(this.containerRef);
    this.multiViewDAG = new MultiViewDAG(configFST, this._componentFactoryResolver, this.containerRef);
    //  this.multiViewDAG.loadComponent(IncrBuildStep1Component, null);
    IncrBuildComponent.getIncrStatusThenEnter(this, (incrStatus) => {
      let k8sRCCreated = incrStatus.k8sReplicationControllerCreated;
      if (k8sRCCreated) {
        // 增量已经在集群中运行，显示增量状态
        this.multiViewDAG.loadComponent(IncrBuildStep4RunningComponent, incrStatus);
      } else {
        // 脚本还未创建
        // this.multiViewDAG.loadComponent(IncrBuildStep1Component, null);
        this.multiViewDAG.loadComponent(IncrBuildStep0Component, null);
      }
      this.incrScript = incrStatus.incrScriptMainFileContent;
    });
  }


  get incrScript(): string {
    return this._incrScript;
  }

  set incrScript(value: string) {
    this._incrScript = value;
  }

}

export class IndexIncrStatus {
  public incrScriptCreated: boolean;
  public incrScriptMainFileContent: string;
  public k8sPluginInitialized: boolean;
  public k8sReplicationControllerCreated: boolean;

  public incrDeployment: IncrDeployment;

  public incrProcess: IncrProcess;

  /**
   * 增量处理节点启动有异常
   */
  public get incrProcessLaunchHasError(): boolean {
    return this.k8sReplicationControllerCreated && this.incrProcess && !this.incrProcess.incrGoingOn && !!this.incrDeployment && !!this.incrDeployment.status && this.incrDeployment.status.readyReplicas > 0;
  }

  public getFirstPod(): K8sPodState {
    for (let i = 0; i < this.incrDeployment.pods.length; i++) {
      return this.incrDeployment.pods[i];
      break;
    }
    return null;
  }
}

export interface IncrProcess {
  incrGoingOn: boolean;
  incrProcessPaused: boolean;
}
