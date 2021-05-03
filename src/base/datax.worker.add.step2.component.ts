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

import {AfterContentInit, AfterViewChecked, AfterViewInit, Component, ComponentFactoryResolver, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild, ViewContainerRef} from "@angular/core";
import {TISService} from "../service/tis.service";
import {AppFormComponent, BasicFormComponent, CurrentCollection} from "../common/basic.form.component";

import {ActivatedRoute} from "@angular/router";
import {EditorConfiguration} from "codemirror";
import {MultiViewDAG} from "../common/MultiViewDAG";
import {AddAppFlowDirective} from "../base/addapp.directive";

import {NzIconService} from 'ng-zorro-antd/icon';
import {CloseSquareFill} from "@ant-design/icons-angular/icons";
import {NzModalService} from "ng-zorro-antd";
import {IncrBuildStep0Component} from "../runtime/incr.build.step0.component";
import {DataxAddStep1Component} from "./datax.add.step1.component";
import {DataxAddStep2Component} from "./datax.add.step2.component";
import {Descriptor, HeteroList, PluginSaveResponse} from "../common/tis.plugin";
import {DataxAddStep3Component} from "./datax.add.step3.component";
import {DataxAddStep4Component} from "./datax.add.step4.component";
import {DataxAddStep5Component} from "./datax.add.step5.component";
import {DataxAddStep6Component} from "./datax.add.step6.maptable.component";
import {DataxAddStep7Component} from "./datax.add.step7.confirm.component";
import {Option} from "./addapp-pojo";
import {PluginsComponent} from "../common/plugins.component";
import {DatasourceComponent} from "../offline/ds.component";
import {K8SReplicsSpecComponent} from "../common/k8s.replics.spec.component";
import {DataxWorkerDTO} from "./datax.worker.component";

@Component({
  template: `
      <tis-steps type="CreateWorkderOfDataX" [step]="1"></tis-steps>
      <tis-page-header [showBreadcrumb]="false">
          <tis-header-tool>
              <button nz-button nzType="default" (click)="prestep()">上一步</button>&nbsp;<button nz-button nzType="primary" (click)="createStep1Next(k8sReplicsSpec)">下一步</button>
          </tis-header-tool>
      </tis-page-header>
      <k8s-replics-spec #k8sReplicsSpec [labelSpan]="3">
      </k8s-replics-spec>
  `
})
export class DataxWorkerAddStep2Component extends AppFormComponent implements AfterViewInit, OnInit {
  savePlugin = new EventEmitter<any>();
  // @ViewChild('k8sReplicsSpec', {read: K8SReplicsSpecComponent, static: true}) k8sReplicsSpec: K8SReplicsSpecComponent;
  @Output() nextStep = new EventEmitter<any>();
  @Output() preStep = new EventEmitter<any>();
  @Input() dto: DataxWorkerDTO;

  constructor(tisService: TISService, route: ActivatedRoute, modalService: NzModalService) {
    super(tisService, route, modalService);
  }

  createStep1Next(k8sReplicsSpec: K8SReplicsSpecComponent) {
    this.jsonPost('/coredefine/corenodemanage.ajax?action=datax_action&emethod=save_datax_worker'
      , {
        k8sSpec: k8sReplicsSpec.k8sControllerSpec,
      })
      .then((r) => {
        if (r.success) {
          this.nextStep.emit(this.dto);
          // let rList = PluginsComponent.wrapDescriptors(r.bizresult.pluginDesc);
          // let desc = Array.from(rList.values());
          // this.hlist = DatasourceComponent.pluginDesc(desc[0])
        }
      });
  }

  protected initialize(app: CurrentCollection): void {
  }

  ngAfterViewInit() {
  }


  ngOnInit(): void {
  }


  prestep() {
    this.preStep.emit(this.dto);
  }
}

