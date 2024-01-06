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
import {PluginsComponent} from "../common/plugins.component";
import {PowerjobCptType} from "./datax.worker.component";
import {Descriptor, PluginType, SavePluginEvent} from "../common/tis.plugin";
import {dataXWorkerCfg} from "./base.manage-routing.module";
import {Observable, Subject} from "rxjs";

@Component({
  template: `
    <nz-spin [nzSpinning]="this.formDisabled" nzSize="large">
      <nz-alert nzType="warning" nzMessage="告知" [nzDescription]="unableToUseK8SController"
                nzShowIcon></nz-alert>
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
            <ng-container *ngFor="let btn of this.dto.processMeta.step1Buttons;let i =index">
              <button *nzSpaceItem [disabled]="this.formDisabled" nz-button
                      [nzType]="i<1 ? 'primary':'default'"
                      (click)="btn.click(this)">{{btn.label}}</button>
            </ng-container>


            <!--                        <button *nzSpaceItem [disabled]="this.formDisabled" nz-button nzType="primary"-->
            <!--                                (click)="onClick()">{{this.dto.processMeta.createButtonLabel}}</button>-->

            <!--                        <button *nzSpaceItem [disabled]="this.formDisabled" nz-button nzType="default"-->
            <!--                                (click)="onClickAddExistPowerjobCluster()">-->
            <!--                            接入已有PowerJob集群-->
            <!--                        </button>-->
          </nz-space>


        </ng-template>
      </nz-empty>
    </nz-spin>
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

  public static startPowerJobTplAppOverwrite(module: BasicFormComponent, appendParams?: Array<{ key: string, val: string }>): Observable<any> {
    // let promise =    Promise.resolve();
    let success$ = new Subject<any>();

    DataxWorkerAddStep0Component.getWorkDescs(dataXWorkerCfg.processMeta.targetName, module)
      .then((rList) => {

        let desc = Array.from(rList.values());
        let pluginDesc = desc.find((dec) => PowerjobCptType.JobTplAppOverwrite.toString() === dec.displayName);
        let pluginCategory: PluginType = {
          name: PowerjobCptType.JobTplAppOverwrite,
          require: true,
          appendParams: appendParams
        };

        let modelRef = PluginsComponent.openPluginDialog({
            shallLoadSavedItems: true,
            savePluginEventCreator: () => {
              let evnet = new SavePluginEvent();
              evnet.serverForward = "coredefine:datax_action:update_power_job"
              return evnet;
            }
          }, module, pluginDesc
          , pluginCategory
          , `更新PowerJob任务配置`
          , (plugin) => {
            success$.next(plugin);
            module.successNotify("更新PowerJob任务配置成功");
            modelRef.close();
          });

      });
    return success$.asObservable();
  }

  public static getWorkDescs(targetName: string, module: BasicFormComponent): Promise<Map<string /* impl */, Descriptor>> {
    return module.httpPost('/coredefine/corenodemanage.ajax'
      , `action=datax_action&emethod=worker_desc&targetName=${targetName}`)
      .then((r) => {
        if (r.success) {
          let rList = PluginsComponent.wrapDescriptors(r.bizresult.pluginDesc);
          return (rList);
        }
      });
  }

  ngOnInit(): void {
    if (this.dto.containPowerJob) {
      return;
    }
    DataxWorkerAddStep0Component.getWorkDescs(this.dto.processMeta.targetName, this).then((rList) => {
      // let rList = PluginsComponent.wrapDescriptors(r.bizresult.pluginDesc);

      let desc = Array.from(rList.values());

      this.dto.processMeta.step0InitDescriptorProcess(this,desc);

    //  this.initPowerJobRelevantProperties(desc);
     // console.log(desc);
     //  let powerjobServer = desc.find((dec) => PowerjobCptType.Server.toString() === dec.displayName);
     //  let powerjobUseExistCluster = desc.find((dec) => PowerjobCptType.UsingExistCluster.toString() === dec.displayName);
     //  let powerjobWorker = desc.find((dec) => PowerjobCptType.Worker.toString() === dec.displayName);
     //  let jobTpl = desc.find((dec) => PowerjobCptType.JobTpl.toString() == dec.displayName);
     //  if (!powerjobServer) {
     //    throw new Error("powerjobServer can not be null");
     //  }
     //  if (!powerjobUseExistCluster) {
     //    throw new Error("powerjobUseExistCluster can not be null");
     //  }
     //  if (!powerjobWorker) {
     //    throw new Error("powerjobWorker can not be null");
     //  }
     //  if (!jobTpl) {
     //    throw new Error("jobTpl can not be null");
     //  }
     //
     //  let pluginCategory: PluginType = {name: 'datax-worker', require: true};
     //  this.dto.powderJobServerHetero = PluginsComponent.pluginDesc(powerjobServer, pluginCategory);
     //  this.dto.powderJobUseExistClusterHetero = PluginsComponent.pluginDesc(powerjobUseExistCluster, pluginCategory);
     //  this.dto.powderJobWorkerHetero = PluginsComponent.pluginDesc(powerjobWorker, pluginCategory);
     //  this.dto.powderjobJobTplHetero = PluginsComponent.pluginDesc(jobTpl, pluginCategory);
    })
    // this.httpPost('/coredefine/corenodemanage.ajax'
    //   , `action=datax_action&emethod=worker_desc&targetName=${this.dto.processMeta.targetName}`)
    //   .then((r) => {
    //     if (r.success) {
    //
    //
    //     }
    //   });
  }

  public initFlinkClusterRelevantProperties(desc: Array<Descriptor>): void {
    let flinkCluster = desc.find((dec) => PowerjobCptType.FlinkCluster.toString() === dec.displayName);
    if (!flinkCluster) {
      throw new Error("powerjobServer can not be null");
    }
    let pluginCategory: PluginType = {name: 'datax-worker', require: true};
    this.dto.flinkClusterHetero = PluginsComponent.pluginDesc(flinkCluster, pluginCategory);
  }

  public initPowerJobRelevantProperties(desc: Array<Descriptor>): void {
    let powerjobServer = desc.find((dec) => PowerjobCptType.Server.toString() === dec.displayName);
    let powerjobUseExistCluster = desc.find((dec) => PowerjobCptType.UsingExistCluster.toString() === dec.displayName);
    let powerjobWorker = desc.find((dec) => PowerjobCptType.Worker.toString() === dec.displayName);
    let jobTpl = desc.find((dec) => PowerjobCptType.JobTpl.toString() == dec.displayName);
    if (!powerjobServer) {
      throw new Error("powerjobServer can not be null");
    }
    if (!powerjobUseExistCluster) {
      throw new Error("powerjobUseExistCluster can not be null");
    }
    if (!powerjobWorker) {
      throw new Error("powerjobWorker can not be null");
    }
    if (!jobTpl) {
      throw new Error("jobTpl can not be null");
    }

    let pluginCategory: PluginType = {name: 'datax-worker', require: true};
    this.dto.powderJobServerHetero = PluginsComponent.pluginDesc(powerjobServer, pluginCategory);
    this.dto.powderJobUseExistClusterHetero = PluginsComponent.pluginDesc(powerjobUseExistCluster, pluginCategory);
    this.dto.powderJobWorkerHetero = PluginsComponent.pluginDesc(powerjobWorker, pluginCategory);
    this.dto.powderjobJobTplHetero = PluginsComponent.pluginDesc(jobTpl, pluginCategory);
  }

  onClick() {
    this.nextStep.emit(this.dto);
  }

  onClickAddExistPowerjobCluster() {
    this.dto.usingPowderJobUseExistCluster = true;
    let direct: IntendDirect = {dto: this.dto, cpt: DataxWorkerAddExistPowerjobClusterComponent};
    this.nextStep.emit(direct)
  }
}

