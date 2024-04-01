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
import {Item, PluginSaveResponse, PluginType, SavePluginEvent} from "../common/tis.plugin";
import {DataxWorkerDTO} from "../runtime/misc/RCDeployment";
import {PowerjobCptType} from "./base.manage-routing.module";

@Component({
  template: `
      <tis-steps [type]="this.dto.processMeta.stepsType" [step]="2"></tis-steps>
      <tis-page-header [showBreadcrumb]="false">
          <tis-header-tool>
              <button nz-button nzType="default" (click)="prestep()">上一步</button>&nbsp;<button nz-button nzType="primary" (click)="createStep1Next()">下一步</button>
          </tis-header-tool>
      </tis-page-header>
      <nz-spin [nzSpinning]="this.formDisabled" >
        <div class="item-block">
        <tis-plugins [formControlSpan]="20" [pluginMeta]="[pluginCategory]"
                     [savePlugin]="savePlugin" [showSaveButton]="false"
                     (afterSave)="afterSaveReader($event)"
                     [shallInitializePluginItems]="false" [_heteroList]="dto.powderjobJobTplHetero" #pluginComponent></tis-plugins>
        </div>
      </nz-spin>

  `
})
export class DataxWorkerAddStep22Component extends AppFormComponent implements AfterViewInit, OnInit {
  savePlugin = new EventEmitter<SavePluginEvent>();
  // @ViewChild('k8sReplicsSpec', {read: K8SReplicsSpecComponent, static: true}) k8sReplicsSpec: K8SReplicsSpecComponent;
  @Output() nextStep = new EventEmitter<any>();
  @Output() preStep = new EventEmitter<any>();
  @Input() dto: DataxWorkerDTO;
  pluginCategory: PluginType = {name: 'datax-worker', require: true,extraParam:"dataxName_"+ PowerjobCptType.JobTpl};
  errorItem: Item;

  constructor(tisService: TISService, route: ActivatedRoute, modalService: NzModalService) {
    super(tisService, route, modalService);
  }

  get currentApp(): CurrentCollection {
    return new CurrentCollection(0, this.dto.processMeta.targetName);
  }

  createStep1Next() {

    let e = new SavePluginEvent();
    e.notShowBizMsg = true;

    // let appTisService: TISService = this.tisService;
    // appTisService.currentApp = new CurrentCollection(0, this.dto.processMeta.targetName);
    e.overwriteHttpHeaderOfAppName(this.dto.processMeta.targetName);
    this.savePlugin.emit(e);

    // console.log(k8sReplicsSpec.k8sControllerSpec);
    //let rcSpec = k8sReplicsSpec.k8sControllerSpec;
    // let e = new SavePluginEvent();
    // e.notShowBizMsg = true;
    // this.jsonPost(`/coredefine/corenodemanage.ajax?action=datax_action&emethod=save_datax_worker&targetName=${this.dto.processMeta.targetName}`
    //   , {
    //     k8sSpec: null,
    //   }, e)
    //   .then((r) => {
    //     if (r.success) {
    //       this.dto.powderJobServerRCSpec = null;
    //       this.nextStep.emit(this.dto);
    //     } else {
    //       this.errorItem = Item.processFieldsErr(r);
    //     }
    //   });
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

  afterSaveReader(e: PluginSaveResponse) {
    if (e.saveSuccess) {
      this.nextStep.emit(this.dto);
    }
  }
}

