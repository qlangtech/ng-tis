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

import {DataxWorkerDTO} from "../runtime/misc/RCDeployment";
import {DataxWorkerAddExistPowerjobClusterComponent} from "./datax.worker.add.exist.powerjob.cluster.component";
import {IntendDirect} from "../common/MultiViewDAG";

@Component({
    template: `

        <nz-alert nzType="warning" nzMessage="告知" [nzDescription]="unableToUseK8SController" nzShowIcon></nz-alert>
        <ng-template #unableToUseK8SController>
            因架构调整，基于K8S执行的分布式DataX任务执行器，和Flink任务执行器需要做新的调整，会将Zookeeper组建依赖去掉，会在<strong>4.0.0版本</strong>中重新与大家见面
        </ng-template>

        <nz-empty style="height: 500px"
                  nzNotFoundImage="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                  [nzNotFoundFooter]="footerTpl"
                  [nzNotFoundContent]="contentTpl"
        >
            <ng-template #contentTpl>
                <span>{{this.dto.processMeta.notCreateTips}}</span>
            </ng-template>
            <ng-template #footerTpl>

                <nz-space class="btn-block">

                    <button *nzSpaceItem nz-button nzType="primary"
                            (click)="onClick()">{{this.dto.processMeta.createButtonLabel}}</button>

                    <button *nzSpaceItem nz-button nzType="default" (click)="onClickAddExistPowerjobCluster()">
                        接入已有PowerJob集群
                    </button>
                </nz-space>


            </ng-template>
        </nz-empty>
    `
})
export class DataxWorkerAddStep0Component extends BasicFormComponent implements AfterViewInit, OnInit {

    @Input() dto: DataxWorkerDTO;
    @Output() nextStep = new EventEmitter<any>();

    constructor(tisService: TISService, modalService: NzModalService) {
        super(tisService, modalService);
    }

    protected initialize(app: CurrentCollection): void {
    }

    ngAfterViewInit() {
    }


    ngOnInit(): void {

    }

    onClick() {
        this.nextStep.emit(this.dto);
    }

    onClickAddExistPowerjobCluster() {
        let direct: IntendDirect = {dto: this.dto, cpt: DataxWorkerAddExistPowerjobClusterComponent};
        this.nextStep.emit(direct)
    }
}

