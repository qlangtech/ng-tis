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
import {AppFormComponent, BasicFormComponent, CurrentCollection} from "../common/basic.form.component";

import {NzModalService} from "ng-zorro-antd/modal";
import {HeteroList, PluginSaveResponse, PluginType, SavePluginEvent} from "../common/tis.plugin";
import {PluginsComponent} from "../common/plugins.component";
import {DataxWorkerDTO} from "../runtime/misc/RCDeployment";
import {ActivatedRoute, Router} from "@angular/router";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {K8SReplicsSpecComponent} from "../common/k8s.replics.spec.component";
import {PowerjobCptType} from "./datax.worker.component";


@Component({
    template: `
        <tis-steps [type]="this.dto.processMeta.stepsType" [step]="0"></tis-steps>
        <tis-page-header [showBreadcrumb]="false">
            <tis-header-tool>
                <button nz-button nzType="default" (click)="prestep()">上一步</button>&nbsp;
                <button nz-button nzType="primary" (click)="createStep1Next(k8sReplicsSpec)">下一步</button>
            </tis-header-tool>
        </tis-page-header>
        <nz-spin [nzSpinning]="this.formDisabled">
            <div class="item-block">
                <tis-plugins [formControlSpan]="20" [pluginMeta]="[pluginCategory]"
                             (afterSave)="afterSaveReader($event)" [savePlugin]="savePlugin" [showSaveButton]="false"
                             [shallInitializePluginItems]="false" [_heteroList]="dto.powderJobServerHetero"
                             #pluginComponent></tis-plugins>
            </div>
            <div class="item-block">
                <k8s-replics-spec [(rcSpec)]="dto.powderJobServerRCSpec" [hpaDisabled]="true"  #k8sReplicsSpec [labelSpan]="5">
                </k8s-replics-spec>
            </div>
        </nz-spin>

    `
})
export class DataxWorkerAddStep1Component extends AppFormComponent implements AfterViewInit, OnInit {
    // hlist: HeteroList[] = [];
    savePlugin = new EventEmitter<SavePluginEvent>();
    @Input() dto: DataxWorkerDTO;
    @Output() nextStep = new EventEmitter<any>();
    @Output() preStep = new EventEmitter<any>();
    pluginCategory: PluginType = {name: 'datax-worker', require: true,extraParam:"dataxName_"+ PowerjobCptType.Server};

    constructor(tisService: TISService, route: ActivatedRoute, modalService: NzModalService) {
        super(tisService, route, modalService);
    }

    // get currentApp(): CurrentCollection {
    //   return new CurrentCollection(0, this.dto.processMeta.targetName);
    // }
    createStep1Next(spec: K8SReplicsSpecComponent) {
       // console.log([spec.validate(),this.dto.powderJobServerRCSpec]);
        if (!spec.validate()) {
            return;
        }
       // EventSource
        let e = new SavePluginEvent();
        e.notShowBizMsg = true;
        e.serverForward = "coredefine:datax_action:save_datax_worker";
        e.postPayload = {"k8sSpec": this.dto.powderJobServerRCSpec};
        let appTisService: TISService = this.tisService;
        appTisService.currentApp = new CurrentCollection(0, this.dto.processMeta.targetName);
        e.basicModule = this;
        this.savePlugin.emit(e);
    }

    protected initialize(app: CurrentCollection): void {
    }

    ngAfterViewInit() {
    }


    ngOnInit(): void {



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

