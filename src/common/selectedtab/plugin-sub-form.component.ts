import {Component, ComponentFactoryResolver, Input, OnInit, ViewChild, ViewContainerRef} from "@angular/core";
import {BasicFormComponent} from "../../common/basic.form.component";
import {MultiViewDAG} from "../../common/MultiViewDAG";
import {HeteroList, PluginType} from "../../common/tis.plugin";
import {TISService} from "../../common/tis.service";
import {NzDrawerRef} from "ng-zorro-antd/drawer";

import {TableBaseComponent} from "./table.base.component";
import {TableTransformerComponent} from "./table.transformer.component";
import {ISubDetailTransferMeta} from "../../base/datax.add.step4.component";
import {StepType} from "../steps.component";

export class SelectedTabDTO {

  // pluginMeta: pluginMeta,
  // hetero: hlist,
  // meta: meta
  offsetStep: number = 0;

  constructor(public meta: ISubDetailTransferMeta, public basePluginMeta: PluginType[], public baseHetero: HeteroList[]) {
  }
}

@Component({
  // selector: 'nz-drawer-custom-component',
  template: `


    <nz-spin nzSize="large" [nzSpinning]="formDisabled" style="min-height: 300px">

      <div nz-row>
        <div nz-col nzSpan="3">
          <tis-steps [direct]="'vertical'" [showCaption]="false" [type]="_stepType" [step]="_step"></tis-steps>
        </div>
        <div nz-col nzSpan="21" class="item-block">
          <ng-template #container></ng-template>
        </div>
      </div>


    </nz-spin>
    <ng-template #proessErr>当前是更新流程不能进入该页面</ng-template>
    {{ multiViewDAG.lastCpt?.name}}
  `
})
export class PluginSubFormComponent extends BasicFormComponent implements OnInit {
  _step: number = 0;
  _stepType = StepType.ManageSelectedTable;
  @ViewChild('container', {read: ViewContainerRef, static: true}) containerRef: ViewContainerRef;
  multiViewDAG: MultiViewDAG;

  // _stepType = StepType.ManageSelectedTable;
  @Input() hetero: HeteroList[] = [];
  @Input() pluginMeta: PluginType[] = [];

  @Input()
  meta: ISubDetailTransferMeta;

  selectedTabDTO: SelectedTabDTO;

  // transformerHetero: HeteroList[] = [];

  // transformerPluginMeta: PluginMeta[] = []

  // savePlugin = new EventEmitter<{ verifyConfig: boolean }>();
  // transformerSavePlugin = new EventEmitter<{ verifyConfig: boolean }>();

  // constructor() {
  // }
  constructor(tisService: TISService, public drawer: NzDrawerRef<{ hetero: HeteroList }>, private _componentFactoryResolver: ComponentFactoryResolver) {
    super(tisService);


  }

  ngOnInit(): void {
    let configFST: Map<any, { next: any, pre: any }> = new Map();
    configFST.set(TableBaseComponent, {next: TableTransformerComponent, pre: null});
    configFST.set(TableTransformerComponent, {next: null, pre: TableBaseComponent});

    // console.log(this.tisService);
    let currApp = this.tisService.currentApp;
    // if(){
    //
    // }
    this.multiViewDAG = new MultiViewDAG(configFST, this._componentFactoryResolver, this.containerRef);
    this.multiViewDAG.stepChange$.subscribe((dto: SelectedTabDTO) => {
     // console.log(dto);
      this._step = dto.offsetStep;
    });
    this.selectedTabDTO = new SelectedTabDTO(this.meta, this.pluginMeta, this.hetero);
    this.multiViewDAG.loadComponent(TableBaseComponent, this.selectedTabDTO);

    // let currApp = this.tisService.currentApp;
    // this.transformerPluginMeta = [
    //   {
    //     name: "transformer",
    //     require: true
    //     , extraParam: EXTRA_PARAM_DATAX_NAME + currApp.appName + ",id_" + this.meta.id
    //     , descFilter:
    //       {
    //         localDescFilter: (desc: Descriptor) => true
    //       }
    //   }
    // ]
  }

  close(): void {
    this.drawer.close();
  }

  // verifyPluginConfig(e: PluginSaveResponse) {
  //   if (e.saveSuccess && e.verify) {
  //     this.drawer.close({hetero: this.hetero[0]});
  //   }
  // }

  //_saveClick() {
  // detail table info 表单只进行校验，不保存
  // this.savePlugin.emit({verifyConfig: true});
  // this.transformerSavePlugin.emit({verifyConfig: false});
  // drawerRef.close();
  //}


}
