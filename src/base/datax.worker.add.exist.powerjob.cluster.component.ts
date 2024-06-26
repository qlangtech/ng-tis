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
import {BasicFormComponent, CurrentCollection} from "../common/basic.form.component";

import {NzModalService} from "ng-zorro-antd/modal";
import {
  Descriptor,
  EXTRA_PARAM_DATAX_NAME,
  PluginSaveResponse,
  PluginType,
  SavePluginEvent
} from "../common/tis.plugin";
import {PluginsComponent} from "../common/plugins.component";
import {DataxWorkerDTO} from "../runtime/misc/RCDeployment";
import {PowerjobCptType} from "./base.manage-routing.module";


@Component({
    template: `
        <tis-steps [type]="this.dto.processMeta.stepsType" [step]="0"></tis-steps>
        <tis-page-header [showBreadcrumb]="false">
            <tis-header-tool>
                <button nz-button nzType="default" (click)="prestep()">上一步</button>&nbsp;
                <button nz-button nzType="primary" (click)="createStep1Next()">下一步</button>
            </tis-header-tool>
        </tis-page-header>
        <nz-spin [nzSpinning]="this.formDisabled">
            <div class="item-block">
                <tis-plugins [formControlSpan]="20" [pluginMeta]="[pluginCategory]"
                             (afterSave)="afterSaveReader($event)" [savePlugin]="savePlugin" [showSaveButton]="false"
                             [shallInitializePluginItems]="false" [_heteroList]="dto.powderJobUseExistClusterHetero"
                             #pluginComponent></tis-plugins>
            </div>
        </nz-spin>

    `
})
export class DataxWorkerAddExistPowerjobClusterComponent extends BasicFormComponent implements AfterViewInit, OnInit {
    // hlist: HeteroList[] = [];
    savePlugin = new EventEmitter<SavePluginEvent>();
    @Input() dto: DataxWorkerDTO;
    @Output() nextStep = new EventEmitter<any>();
    @Output() preStep = new EventEmitter<any>();
    pluginCategory: PluginType = {name: 'datax-worker', require: true,extraParam:EXTRA_PARAM_DATAX_NAME+ PowerjobCptType.Server};

    constructor(tisService: TISService, modalService: NzModalService) {
        super(tisService, modalService);
    }

    // get currentApp(): CurrentCollection {
    //   return new CurrentCollection(0, this.dto.processMeta.targetName);
    // }
    createStep1Next() {

        let e = new SavePluginEvent();
        e.notShowBizMsg = true;
      e.overwriteHttpHeaderOfAppName(this.dto.processMeta.targetName);
       // e.serverForward = "coredefine:datax_action:save_datax_worker";
       // e.postPayload = {"k8sSpec": this.dto.powderJobServerRCSpec};
       //  let appTisService: TISService = this.tisService;
       //  appTisService.currentApp = new CurrentCollection(0, );
       //  e.basicModule = this;
        this.savePlugin.emit(e);
    }

    protected initialize(app: CurrentCollection): void {
    }

    ngAfterViewInit() {
    }


    ngOnInit(): void {

        if (this.dto.containPowerJob) {
            return;
        }

        this.httpPost('/coredefine/corenodemanage.ajax'
            , `action=datax_action&emethod=worker_desc&targetName=${this.dto.processMeta.targetName}`)
            .then((r) => {
                if (r.success) {
                    let rList = Descriptor.wrapDescriptors(r.bizresult.pluginDesc);

                    let desc = Array.from(rList.values());
                    let powerjobServer = desc.find((dec) => PowerjobCptType.Server.toString() === dec.displayName);
                    let powerjobWorker = desc.find((dec) => PowerjobCptType.Worker.toString() === dec.displayName);
                    let jobTpl = desc.find((dec) => PowerjobCptType.JobTpl.toString() == dec.displayName);
                    if (!powerjobServer) {
                        throw new Error("powerjobServer can not be null");
                    }
                    if (!powerjobWorker) {
                        throw new Error("powerjobWorker can not be null");
                    }
                    if (!jobTpl) {
                        throw new Error("jobTpl can not be null");
                    }

                    this.dto.powderJobServerHetero = PluginsComponent.pluginDesc(powerjobServer, this.pluginCategory);
                    this.dto.powderJobWorkerHetero = PluginsComponent.pluginDesc(powerjobWorker, this.pluginCategory);
                    this.dto.powderjobJobTplHetero = PluginsComponent.pluginDesc(jobTpl, this.pluginCategory);

                }
            });

    }

    afterSaveReader(e: PluginSaveResponse) {
        if (e.saveSuccess) {
            this.nextStep.emit(this.dto);
        }
    }


    prestep() {
  this.preStep.emit(this.dto);
    }
}

