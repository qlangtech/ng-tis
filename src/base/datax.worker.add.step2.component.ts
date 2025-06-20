/**
 *   Licensed to the Apache Software Foundation (ASF) under one
 *   or more contributor license agreements.  See the NOTICE file
 *   distributed with this work for additional information
 *   regarding copyright ownership.  The ASF licenses this file
 *   to you under the Apache License, Version 2.0 (the
 *   "License"); you may not use this file except in compliance
 *   with the License.  You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {TISService} from "../common/tis.service";
import {AppFormComponent, CurrentCollection} from "../common/basic.form.component";

import {ActivatedRoute} from "@angular/router";


import {NzModalService} from "ng-zorro-antd/modal";
import {EXTRA_PARAM_DATAX_NAME, Item, PluginSaveResponse, PluginType, SavePluginEvent} from "../common/tis.plugin";
import {K8SRCSpec, K8SReplicsSpecComponent} from "../common/k8s.replics.spec.component";
import {DataxWorkerDTO} from "../runtime/misc/RCDeployment";
import {PowerjobCptType} from "./base.manage-routing.module";

@Component({
  template: `
    <tis-steps [type]="this.dto.processMeta.stepsType" [step]="1"></tis-steps>
    <tis-page-header [showBreadcrumb]="false">
      <tis-header-tool>
        <button nz-button nzType="default" (click)="prestep()">上一步</button>&nbsp;
        <button nz-button nzType="primary"
                (click)="createStep1Next(k8sReplicsSpec)">
          下一步
        </button>
      </tis-header-tool>
    </tis-page-header>
    <nz-spin [nzSpinning]="this.formDisabled">
      <h4>基本配置</h4>
      <div class="item-block">
        <tis-plugins [formControlSpan]="20" [pluginMeta]="[pluginCategory]"
                     [savePluginEventCreator]="_savePluginEventCreator"
                     [savePlugin]="savePlugin" [showSaveButton]="false"
                     (afterSave)="afterSaveReader($event)"
                     [shallInitializePluginItems]="false" [_heteroList]="dto.powderJobWorkerHetero"
                     #pluginComponent></tis-plugins>
      </div>
      <h4>资源规格</h4>
      <div class="item-block">
        <k8s-replics-spec [hpaDisabled]="true" [(rcSpec)]="dto.powderJobWorkerRCSpec" [errorItem]="errorItem"
                          #k8sReplicsSpec
                          [labelSpan]="5">
        </k8s-replics-spec>
      </div>
    </nz-spin>

  `
})
export class DataxWorkerAddStep2Component extends AppFormComponent implements AfterViewInit, OnInit {
  savePlugin = new EventEmitter<SavePluginEvent>();
  // @ViewChild('k8sReplicsSpec', {read: K8SReplicsSpecComponent, static: true}) k8sReplicsSpec: K8SReplicsSpecComponent;
  @Output() nextStep = new EventEmitter<any>();
  @Output() preStep = new EventEmitter<any>();
  @Input() dto: DataxWorkerDTO;
  pluginCategory: PluginType = {
    name: 'datax-worker',
    require: true,
    extraParam: EXTRA_PARAM_DATAX_NAME + PowerjobCptType.Worker
  };
  errorItem: Item;
  _savePluginEventCreator: () => SavePluginEvent;

  constructor(tisService: TISService, route: ActivatedRoute, modalService: NzModalService) {
    super(tisService, route, modalService);
  }

  get currentApp(): CurrentCollection {
    return new CurrentCollection(0, this.dto.processMeta.targetName);
  }

  afterSaveReader(e: PluginSaveResponse) {
    if (e.saveSuccess) {
      this.nextStep.emit(this.dto);
    }
  }

  createStep1Next(spec: K8SReplicsSpecComponent) {
    if (!spec.validate()) {
      return;
    }
    let e = this.createSavePluginEvent();
    this.savePlugin.emit(e);
  }

  private createSavePluginEvent(): SavePluginEvent {
    let e = new SavePluginEvent();
    e.notShowBizMsg = true;
    e.serverForward = "coredefine:datax_action:save_datax_worker";
    e.postPayload = {"k8sSpec": this.dto.powderJobWorkerRCSpec};
    e.overwriteHttpHeaderOfAppName(this.dto.processMeta.targetName);
    return e;
  }

  protected initialize(app: CurrentCollection): void {
  }

  ngAfterViewInit() {
  }

  // createSavePluginEvent(): SavePluginEvent {
  //   let e = this.dto.processMeta.step1CreateSaveEvent(this);
  //   e.overwriteHttpHeaderOfAppName(this.dto.processMeta.targetNameGetter(this.route.snapshot.params));
  //   return e;
  // }

  ngOnInit(): void {
    // console.log(this.dto);
    this._savePluginEventCreator = () => {
      return this.createSavePluginEvent();
    }
    if (!this.dto.powderJobWorkerRCSpec) {
      let dftSpec = K8SReplicsSpecComponent.createInitRcSpec();
      dftSpec.cuplimit = 2;
      dftSpec.memorylimit = 4;
      dftSpec.memoryrequest = 3;
      dftSpec.memoryrequestunit = dftSpec.memorylimitunit;

      this.dto.powderJobWorkerRCSpec = dftSpec;
    }
  }


  prestep() {
    this.preStep.emit(this.dto);
  }
}

