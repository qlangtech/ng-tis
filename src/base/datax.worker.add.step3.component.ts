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
import {AppFormComponent, BasicFormComponent, CurrentCollection} from "../common/basic.form.component";

import {ActivatedRoute} from "@angular/router";


import {NzModalService} from "ng-zorro-antd/modal";
import {NzNotificationService} from "ng-zorro-antd/notification";

import {K8SReplicsSpecComponent} from "../common/k8s.replics.spec.component";
import {DataXJobWorkerStatus, DataxWorkerDTO} from "../runtime/misc/RCDeployment";
import {SavePluginEvent} from "../common/tis.plugin";
import {PowerjobCptType} from "./datax.worker.component";

@Component({
  template: `
      <tis-steps [type]="this.dto.processMeta.stepsType" [step]="3"></tis-steps>
      <tis-page-header [showBreadcrumb]="false">
          <tis-header-tool>
              <button nz-button nzType="default" [disabled]="formDisabled" (click)="prestep()">上一步</button>&nbsp;
              <button [disabled]="formDisabled" nz-button nzType="primary" (click)="launchK8SController()"><i nz-icon
                                                                                                              nzType="rocket"
                                                                                                              nzTheme="outline"></i>启动
              </button>
          </tis-header-tool>
      </tis-page-header>
      <h4>PowerJob-Server</h4>
      <div class="item-block">
          <tis-plugins [formControlSpan]="20" [shallInitializePluginItems]="false"
                       [plugins]="[{name: 'datax-worker', require: true,extraParam:'dataxName_'+ PowerjobCptType.Server}]"
                       [disabled]="true"
                       [showSaveButton]="false"
          ></tis-plugins>
      </div>
      <div class="item-block">
          <k8s-replics-spec [rcSpec]="this.dto.powderJobServerRCSpec" [disabled]="true"
                            [labelSpan]="5"></k8s-replics-spec>

      </div>

      <h4>PowerJob-Worker</h4>
      <div class="item-block">
          <tis-plugins [formControlSpan]="20" [shallInitializePluginItems]="false"
                       [plugins]="[{name: 'datax-worker', require: true,extraParam:'dataxName_'+ PowerjobCptType.Worker}]"
                       [disabled]="true"
                       [showSaveButton]="false"
          ></tis-plugins>
      </div>
      <div class="item-block">
          <k8s-replics-spec [rcSpec]="this.dto.powderJobWorkerRCSpec" [disabled]="true"
                            [labelSpan]="5"></k8s-replics-spec>
      </div>

      <h4>PowerJob-Job</h4>
      <div class="item-block">
          <tis-plugins [formControlSpan]="20" [shallInitializePluginItems]="false"
                       [plugins]="[{name: 'datax-worker', require: true,extraParam:'dataxName_'+ PowerjobCptType.JobTpl}]"
                       [disabled]="true"
                       [showSaveButton]="false"
          ></tis-plugins>
      </div>


      <ng-container *ngIf="dto.processMeta.supportK8SReplicsSpecSetter">
      </ng-container>
  `
  , styles: [
      `
    `]
})
export class DataxWorkerAddStep3Component extends BasicFormComponent implements AfterViewInit, OnInit {
  savePlugin = new EventEmitter<any>();
  @ViewChild('k8sReplicsSpec', {read: K8SReplicsSpecComponent, static: true}) k8sReplicsSpec: K8SReplicsSpecComponent;
  @Output() nextStep = new EventEmitter<any>();
  @Output() preStep = new EventEmitter<any>();
  @Input() dto: DataxWorkerDTO;

  constructor(tisService: TISService, modalService: NzModalService) {
    super(tisService, modalService);
  }

  ngOnInit(): void {
    if (this.dto.processMeta.supportK8SReplicsSpecSetter && !this.dto.powderJobServerRCSpec) {
      throw new Error("rcSpec can not be null");
    }
    console.log(this.dto.processMeta);
    let appTisService: TISService = this.tisService;
    appTisService.currentApp = new CurrentCollection(0, this.dto.processMeta.targetName);
  }

  get currentApp(): CurrentCollection {
   // console.log(this.dto.processMeta);
    return new CurrentCollection(0, this.dto.processMeta.targetName);
  }
  launchK8SController() {
    let e = new SavePluginEvent();
    e.notShowBizMsg = true;
    this.jsonPost(`/coredefine/corenodemanage.ajax?action=datax_action&emethod=launch_datax_worker&targetName=${this.dto.processMeta.targetName}`
      , {}, e)
      .then((r) => {
        if (r.success) {
          this.successNotify("已经成功在K8S集群中启动" + this.dto.processMeta.pageHeader);
          let dataXWorkerStatus: DataXJobWorkerStatus
            = Object.assign(new DataXJobWorkerStatus(), r.bizresult, {'processMeta': this.dto.processMeta});
          this.nextStep.emit(dataXWorkerStatus);
        }
      });
  }

  protected initialize(app: CurrentCollection): void {
    console.log(app);
  }

  ngAfterViewInit() {
  }


  prestep() {
    this.preStep.next(this.dto);
  }

  public readonly PowerjobCptType = PowerjobCptType;
}

