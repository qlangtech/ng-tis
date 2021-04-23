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

import {ComponentFactoryResolver, ComponentRef, Type, ViewContainerRef} from "@angular/core";
import {AddAppFlowDirective} from "../base/addapp.directive";

/**
 * 多步骤跳转VIEW逻辑实现
 */
export class MultiViewDAG {
  constructor(private configFST: Map<any, { next: any, pre: any }>, private _componentFactoryResolver: ComponentFactoryResolver, private  stepViewPlaceholder: ViewContainerRef) {
    if (!stepViewPlaceholder) {
      throw new Error("param stepViewPlaceholder can not be empty");
    }
  }

  // 通过跳转状态机加载Component
  public loadComponent(cpt: Type<any>, dto: any) {
    // var cpt = AddAppFormComponent;

    let componentRef = this.setComponentView(cpt);
    let nextCpt = this.configFST.get(cpt).next;
    let preCpt = this.configFST.get(cpt).pre;

    if (dto) {
      componentRef.instance.dto = dto;
    }

    // console.log({next: nextCpt, pre: preCpt});

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
    // let viewContainerRef = this.stepViewPlaceholder.viewContainerRef;
    // viewContainerRef.clear();
    this.stepViewPlaceholder.clear();
    return this.stepViewPlaceholder.createComponent(componentFactory);
  }
}
