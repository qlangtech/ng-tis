import {Component, ComponentFactoryResolver, OnInit, Type, ViewChild, ViewContainerRef} from "@angular/core";
import {BasicFormComponent, CurrentCollection} from "../common/basic.form.component";
import {TISService} from "../common/tis.service";
import {NzModalService} from "ng-zorro-antd/modal";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {MultiViewDAG} from "../common/MultiViewDAG";
import {DataxAddStep2Component} from "../base/datax.add.step2.component";
import {DataxAddComponent, DataxDTO} from "../base/datax.add.component";
import {ActivatedRoute, Router} from "@angular/router";
import {StepType} from "../common/steps.component";
import {DataxAddStep5Component} from "../base/datax.add.step5.component";
import {DataxAddStep1Component} from "../base/datax.add.step1.component";
import {WorkflowAddComponent} from "./workflow.add.component";
import {DataxAddStep7Component, ExecModel} from "../base/datax.add.step7.confirm.component";
import {AddStep2ComponentCfg} from "../base/common/datax.common";


@Component({
  template: `
    <tis-page-header *ngIf="updateProfile" [breadcrumb]="['数据流分析（EMR）','/offline/wf']" [title]="this._currWorkFlow.appName">
    </tis-page-header>
    <nz-spin nzSize="large" [nzSpinning]="formDisabled" style="min-height: 300px">
      <ng-template #container></ng-template>
    </nz-spin>
    {{ multiViewDAG.lastCpt?.name}}
  `
})
export class WFControllerComponent extends BasicFormComponent implements OnInit {
  multiViewDAG: MultiViewDAG;
  @ViewChild('container', {read: ViewContainerRef, static: true}) containerRef: ViewContainerRef;
  updateProfile: boolean = false;
  _currWorkFlow: CurrentCollection = new CurrentCollection(0, '');

  constructor(tisService: TISService, modalService: NzModalService, notification: NzNotificationService,
              private router: Router, private route: ActivatedRoute, private _componentFactoryResolver: ComponentFactoryResolver) {
    super(tisService, modalService, notification);
    this.updateProfile = this.route.snapshot.data["updateProfile"];
  }


  ngOnInit(): void {
    // 更新基本信息

    // console.log(["updateProfile", updateProfile]);

    // 配置步骤前后跳转状态机
    let configFST: Map<any, { next: any, pre: any }> = new Map();

    //
    let cptAfterStep5 = this.updateProfile ? DataxAddStep7Component : WorkflowAddComponent;
    configFST.set(DataxAddStep1Component, {next: DataxAddStep2Component, pre: null});
    configFST.set(DataxAddStep2Component, {next: DataxAddStep5Component, pre: DataxAddStep1Component});
    configFST.set(DataxAddStep5Component, {next: cptAfterStep5, pre: DataxAddStep2Component});
    configFST.set(cptAfterStep5, {next: null, pre: DataxAddStep5Component});


    this.multiViewDAG = new MultiViewDAG(configFST, this._componentFactoryResolver, this.containerRef);
    let dto = new DataxDTO();
    let addStepCptCfg = new AddStep2ComponentCfg();
    addStepCptCfg.readerCptNeed = false;
    addStepCptCfg.installableExtension = ['com.qlangtech.tis.datax.impl.DataxWriter'];
    addStepCptCfg.headerCaption = "离线引擎选择";
    addStepCptCfg.writerTypeLable = "引擎类型";
    addStepCptCfg.writerPluginTag = "offline_parser";
    addStepCptCfg.stepIndex = 1;
    dto.processModel = StepType.CreateWorkflow;


    if (this.updateProfile) {
      let wname = this.route.snapshot.params["name"];
      let app = new CurrentCollection(-1, wname);
      this.tisService.currentApp = app;
      this._currWorkFlow = app;
      let fragment = this.route.snapshot.fragment;
      let queryParams = this.route.snapshot.queryParams;
      let execId = queryParams['execId'];
      this.tisService.execId = execId;
      let cpt: Type<any> = DataxAddStep1Component;
      switch (fragment) {
        case "writer": {
          cpt = DataxAddStep5Component;
        }
      }
      DataxAddComponent.getDataXMeta(this, StepType.CreateWorkflow, app).then((dto) => {

        dto.execModel = ExecModel.Reader;
        dto.addStep2ComponentCfg = addStepCptCfg;
        // dto.processModel = StepType.UpdateDataxReader;
        // this.multiViewDAG.loadComponent(cpt, dto);
        //  let writerDescriptor = new Descriptor();
        //  writerDescriptor.impl = "com.qlangtech.tis.plugin.datax.DataXHiveWriter";
        //  dto.writerDescriptor = writerDescriptor;
        this.multiViewDAG.loadComponent(cpt, dto);
      })


    } else {
      dto.addStep2ComponentCfg = addStepCptCfg;
      this.multiViewDAG.loadComponent(DataxAddStep1Component, dto);
    }

    /**=====================================================
     * <<<<<<<<<for test
     =======================================================*/
    // DataxAddStep2Component.getDataXReaderWriterEnum(this).then((rwEnum: DataXReaderWriterEnum) => {
    //   let dto = new DataxDTO();
    //   dto.dataxPipeName = "hudi2";
    //   dto.processMeta = {readerRDBMS: true, explicitTable: true, writerRDBMS: true, writerSupportMultiTab: false};
    //   // dto.readerDescriptor = rwEnum.readerDescs.find((r) => "OSS" === r.displayName);
    //   // dto.writerDescriptor = rwEnum.writerDescs.find((r) => "Elasticsearch" === r.displayName);
    //   dto.readerDescriptor = rwEnum.readerDescs.find((r) => "MySQL" === r.displayName);
    //   dto.writerDescriptor = rwEnum.writerDescs.find((r) => "Hudi" === r.displayName);
    //   this.multiViewDAG.loadComponent(DataxAddStep4Component, dto);
    // });
    /**=====================================================
     * for test end>>>>>>>>
     =======================================================*/


  }
}
