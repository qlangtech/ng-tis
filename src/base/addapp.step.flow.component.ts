// import { AdDirective } from './ad.directive';
// import { AdItem }      from './ad-item';
// import { AdComponent } from './ad.component';
// import {AddAppFormComponent} from './addapp-form.component';
import {AddAppFlowDirective} from './addapp.directive';
import {AddAppFormComponent} from './addapp-form.component';
import {AddAppDefSchemaComponent} from './addapp-define-schema.component';
import {
  Component, ViewChild, ComponentFactoryResolver, OnDestroy, ComponentRef, Type,
  AfterContentInit, ViewContainerRef
} from '@angular/core';
import {AddAppConfirmComponent} from './addapp-confirm.component';
import {AppDesc, ConfirmDTO, Option} from "./addapp-pojo";
import {AddappSelectNodesComponent} from "./addapp-select-nodes.component";

@Component({
  template: `
      <ng-template #container></ng-template>
  `
})
export class AddAppStepFlowComponent implements AfterContentInit, OnDestroy {

  @ViewChild('container', {read: ViewContainerRef, static: true}) indexAddFlow: ViewContainerRef;

  private configFST: Map<any, { next: any, pre: any }>;


  constructor(private _componentFactoryResolver: ComponentFactoryResolver) {
  }

  public preStepClick(e: any): void {
    // console.info('dddd');
  }

  ngAfterContentInit() {

    // 配置步骤前后跳转状态机
    this.configFST = new Map();


    this.configFST.set(AddAppFormComponent, {next: AddAppDefSchemaComponent, pre: null});

    this.configFST.set(AddAppDefSchemaComponent, {next: AddappSelectNodesComponent, pre: AddAppFormComponent});

    this.configFST.set(AddappSelectNodesComponent, {next: AddAppConfirmComponent, pre: AddAppDefSchemaComponent});
    // TODO :将来还需要设置机器选择页面
    this.configFST.set(AddAppConfirmComponent, {next: null, pre: AddappSelectNodesComponent});

    let dto = new ConfirmDTO();
    dto.appform = new AppDesc();
    dto.appform.name = "marss"
    dto.appform.tisTpl = "lucene5.3";
    dto.appform.workflow = "45:totalpay";
    dto.appform.dptId = "356";
    dto.appform.recept = "ddd";
    let dpt = new Option();
    dpt.name = "测试部门";
    dpt.value = "356";
    dto.appform.dpts = [dpt];
    // this.loadComponent(AddAppFormComponent, null);

    this.loadComponent(AddappSelectNodesComponent, dto);
    // this.loadComponent(AddAppDefSchemaComponent, dto);
  }

  ngOnDestroy() {
    // clearInterval(this.interval);
  }

  // 通过跳转状态机加载Component
  loadComponent(cpt: Type<any>, dto: any) {
    // var cpt = AddAppFormComponent;
    let componentRef = this.setComponentView(cpt);
    let nextCpt = this.configFST.get(cpt).next;
    let preCpt = this.configFST.get(cpt).pre;

    if (dto) {
      componentRef.instance.dto = dto;
    }

    // console.info({next: nextCpt, pre: preCpt});

    if (nextCpt !== null) {
      componentRef.instance.nextStep.subscribe((e: any) => {
          this.loadComponent(nextCpt, e);
        }
      );
    }

    if (preCpt !== null) {
      componentRef.instance.preStep.subscribe((e: any) => {
          this.loadComponent(preCpt, e);
        }
      );
    }
  }

  private setComponentView(component: Type<any>): ComponentRef<any> {
    let componentFactory = this._componentFactoryResolver.resolveComponentFactory(component);
    //
    // let viewContainerRef = this.indexAddFlow.viewContainerRef;
    // viewContainerRef.clear();
    this.indexAddFlow.clear();
    return this.indexAddFlow.createComponent(componentFactory);
  }


}
