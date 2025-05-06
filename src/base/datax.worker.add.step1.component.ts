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

import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild} from "@angular/core";
import {TISService} from "../common/tis.service";
import {AppFormComponent, CurrentCollection} from "../common/basic.form.component";

import {NzModalService} from "ng-zorro-antd/modal";
import {EXTRA_PARAM_DATAX_NAME, PluginSaveResponse, PluginType, SavePluginEvent} from "../common/tis.plugin";
import {DataxWorkerDTO} from "../runtime/misc/RCDeployment";
import {ActivatedRoute} from "@angular/router";
import {K8SReplicsSpecComponent} from "../common/k8s.replics.spec.component";
import {PowerjobCptType} from "./base.manage-routing.module";


@Component({
  template: `
    <tis-steps [type]="this.dto.processMeta.stepsType" [step]="0"></tis-steps>
    <nz-spin [nzSpinning]="this.formDisabled" nzSize="large">
      <tis-page-header [showBreadcrumb]="false">
        <tis-header-tool>
          <button nz-button nzType="default" (click)="prestep()">上一步</button>&nbsp;
          <button nz-button nzType="primary" [disabled]="this.formDisabled"
                  (click)="createStep1Next()">下一步
          </button>
        </tis-header-tool>
      </tis-page-header>
      <h4>基本配置</h4>
      <div class="item-block">

        <tis-plugins [formControlSpan]="20" [pluginMeta]="[pluginCategory]"
                     [savePluginEventCreator]="_savePluginEventCreator"
                     (ajaxOccur)="ajaxOccur($event)" (afterSave)="afterSaveReader($event)"
                     [savePlugin]="savePlugin" [showSaveButton]="false"
                     [shallInitializePluginItems]="false" [_heteroList]="dto.step1Hetero"
                     #pluginComponent></tis-plugins>
      </div>
      <ng-container *ngIf="rcSpecShow">
        <h4>资源规格</h4>
        <div class="item-block">
          <k8s-replics-spec [(rcSpec)]="dto.primaryRCSpec" [hpaDisabled]="true" #k8sReplicsSpec
                            [labelSpan]="5">
          </k8s-replics-spec>
        </div>
      </ng-container>
    </nz-spin>

  `
})
export class DataxWorkerAddStep1Component extends AppFormComponent implements AfterViewInit, OnInit {
  // hlist: HeteroList[] = [];
  @ViewChild('k8sReplicsSpec', {static: false}) spec: K8SReplicsSpecComponent;
  savePlugin = new EventEmitter<SavePluginEvent>();
  rcSpecShow = false;
  @Input() dto: DataxWorkerDTO;
  @Output() nextStep = new EventEmitter<any>();
  @Output() preStep = new EventEmitter<any>();
  // pluginCategory: PluginType = {name: 'datax-worker', require: true, extraParam: "dataxName_" + PowerjobCptType.Server};
  pluginCategory: PluginType = {
    name: PowerjobCptType.FlinkCluster,
    require: true,
    extraParam: EXTRA_PARAM_DATAX_NAME + PowerjobCptType.FlinkCluster
  };
  _savePluginEventCreator: () => SavePluginEvent;

  constructor(tisService: TISService, route: ActivatedRoute, modalService: NzModalService) {
    super(tisService, route, modalService);
  }

  // get currentApp(): CurrentCollection {
  //   return new CurrentCollection(0, this.dto.processMeta.targetName);
  // }
  createStep1Next() {
    ///console.log(this.spec);
    if (this.spec && !this.spec.validate()) {
      return;
    }
    // EventSource
    let e = this.createSavePluginEvent();
    //console.log(e);
    this.savePlugin.emit(e);
  }

  createSavePluginEvent(): SavePluginEvent {
    let e = this.dto.processMeta.step1CreateSaveEvent(this);
    e.overwriteHttpHeaderOfAppName(this.dto.processMeta.targetNameGetter(this.route.snapshot.params));
    return e;
  }

  protected initialize(app: CurrentCollection): void {
  }

  ngAfterViewInit() {
  }


  ngOnInit(): void {
    let evt = this.dto.processMeta.step1CreateSaveEvent(this);
    this.rcSpecShow = !!evt.postPayload;
    this.pluginCategory = this.dto.processMeta.step1PluginType;
    this._savePluginEventCreator = () => {
      return this.createSavePluginEvent();
    }
    //  console.log(this.pluginCategory);
  }

  afterSaveReader(e: PluginSaveResponse) {

    //this.formDisabled = e.formDisabled;
    if (e.saveSuccess) {
      this.nextStep.emit(this.dto);
    }
  }


  prestep() {
    this.preStep.emit(this.dto);
  }

  ajaxOccur(event: PluginSaveResponse) {
    console.log(event);
    //this.formDisabled = event.formDisabled;
  }
}

