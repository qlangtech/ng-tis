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
import {Descriptor, PluginType, SavePluginEvent} from "../common/tis.plugin";
import {dataXWorkerCfg, PowerjobCptType} from "./base.manage-routing.module";
import {Observable, Subject} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {KEY_APPNAME} from "./datax.worker.running.component";
import {NzDrawerService} from "ng-zorro-antd/drawer";
import {ItemPropValComponent} from "../common/plugin/item-prop-val.component";

@Component({
  template: `
      <nz-spin [nzSpinning]="this.formDisabled" nzSize="large">
          <!--      <nz-alert nzType="warning" nzMessage="告知" [nzDescription]="unableToUseK8SController"-->
          <!--                nzShowIcon></nz-alert>-->
          <!--      <ng-template #unableToUseK8SController>-->
          <!--        因架构调整，基于K8S执行的分布式DataX任务执行器，和Flink任务执行器需要做新的调整，会将Zookeeper组建依赖去掉，会在<strong>4.0.0版本</strong>中重新与大家见面-->
          <!--      </ng-template>-->

          <nz-empty style="height: 500px"
                    [nzNotFoundImage]="notFoundImage"
                    [nzNotFoundFooter]="footerTpl"
                    [nzNotFoundContent]="contentTpl"
          >
              <ng-template #contentTpl>
                  <span>{{this.dto.processMeta.notCreateTips}}</span>
                <ng-container *ngIf="this.dto.containPowerJob">
                  <br/>
                  <blibli videoId="BV16M4m1r7yj">TIS与PowerJob整合案例演示</blibli> &nbsp;
                  <a target="_blank" href="https://tis.pub/docs/install/powerjob/k8s"><span nz-icon nzType="file-text" nzTheme="outline"></span>操作说明</a>
                </ng-container>

              </ng-template>
              <ng-template #footerTpl>

                  <nz-space class="btn-block">
                      <ng-container *ngFor="let btn of this.dto.processMeta.step1Buttons;let i =index">
                          <button *nzSpaceItem [disabled]="this.formDisabled" nz-button
                                  [nzType]="i<1 ? 'primary':'default'"
                                  (click)="btn.click(this)">{{btn.label}}</button>
                      </ng-container>
                  </nz-space>


              </ng-template>
              <ng-template #notFoundImage>
                  <p style="margin: 20px">
                      <span style="font-size: 8em" nz-icon [nzType]="dto.processMeta.endType" nzTheme="fill"></span>
                  </p>
              </ng-template>
          </nz-empty>
      </nz-spin>
  `
})
export class DataxWorkerAddStep0Component extends BasicFormComponent implements AfterViewInit, OnInit {

  @Input() dto: DataxWorkerDTO;
  @Output() nextStep = new EventEmitter<any>();

  constructor(tisService: TISService, modalService: NzModalService, private route: ActivatedRoute, private drawerService: NzDrawerService) {
    super(tisService, modalService);
  }

  protected initialize(app: CurrentCollection): void {
  }

  ngAfterViewInit() {
  }

  public static startPowerJobTplAppOverwrite(module: BasicFormComponent, appendParams?: Array<{ key: string, val: string }>): Observable<any> {
    // let promise =    Promise.resolve();
    let success$ = new Subject<any>();

    let opt: SavePluginEvent = null;

    if (appendParams) {
      let p = appendParams.find((param) => param.key === KEY_APPNAME);
      if (p) {
        opt = new SavePluginEvent();
        opt.overwriteHttpHeaderOfAppName(p.val);
      }
    }

    DataxWorkerAddStep0Component.getWorkDescs(dataXWorkerCfg.processMeta.targetName, true, module, opt)
      .then((dto) => {
        let rList = dto.workDesc;
        let desc = Array.from(rList.values());
        let pluginDesc = desc.find((dec) => PowerjobCptType.JobTplAppOverwrite.toString() === dec.displayName);
        let pluginCategory: PluginType = {
          name: PowerjobCptType.JobTplAppOverwrite,
          require: true,
          appendParams: appendParams
        };
        // console.log([pluginDesc,pluginCategory]);

        // console.log(dto);
        let containTplRewriterPlugin = dto.typedPluginCount[PowerjobCptType.JobTplAppOverwrite];
        let modelRef = PluginsComponent.openPluginDialog({
            opt: opt,
            shallLoadSavedItems: containTplRewriterPlugin > 0,
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

  public static getWorkDescs(targetName: string, addJobTplOverwritePlugin: boolean, module: BasicFormComponent, e?: SavePluginEvent): Promise<WorkerDTO> {
    return module.httpPost('/coredefine/corenodemanage.ajax'
      , `action=datax_action&emethod=worker_desc&targetName=${targetName}&addJobTplOverwritePlugin=${addJobTplOverwritePlugin}`, e)
      .then((r) => {
        if (r.success) {
          let rList = PluginsComponent.wrapDescriptors(r.bizresult.pluginDesc);
          return new WorkerDTO(rList, r.bizresult.typedPluginCount);
        }
      });
  }

  ngOnInit(): void {
    if (this.dto.containPowerJob) {
      return;
    }
    DataxWorkerAddStep0Component.getWorkDescs(this.dto.processMeta.targetNameGetter(this.route.snapshot.params, true), false, this)
      .then((dto) => {
        let rList = dto.workDesc;
        let desc = Array.from(rList.values());
        this.dto.processMeta.step0InitDescriptorProcess(this, desc);
      });
  }

  public initFlinkClusterRelevantProperties(desc: Array<Descriptor>): void {
    let flinkCluster = desc.find((dec) => PowerjobCptType.FlinkCluster.toString() === dec.displayName);
    if (!flinkCluster) {
      // throw new Error("powerjobServer can not be null");
      this.openFlinkClusterRelevantPlugin();
      return;
    }
    // let pluginCategory: PluginType = {name: 'datax-worker', require: true};
    this.dto.flinkClusterHetero = PluginsComponent.pluginDesc(flinkCluster, this.flinkPluginCategory);
    this.dto.hasSetHetero = true;
  }


  private powerJobPluginCategory: PluginType = {
    name: 'datax-worker', require: true, descFilter: {
      endType: () => 'powerjob',
      localDescFilter: (desc) => true
    }
  };

  private flinkPluginCategory: PluginType = {
    name: 'datax-worker', require: true, descFilter: {
      endType: () => 'flink',
      localDescFilter: (desc) => true
    }
  };

  public initPowerJobRelevantProperties(desc: Array<Descriptor>): void {
    // console.log(desc);
    let powerjobServer = desc.find((dec) => PowerjobCptType.Server.toString() === dec.displayName);
    let powerjobUseExistCluster = desc.find((dec) => PowerjobCptType.UsingExistCluster.toString() === dec.displayName);
    let powerjobWorker = desc.find((dec) => PowerjobCptType.Worker.toString() === dec.displayName);
    let jobTpl = desc.find((dec) => PowerjobCptType.JobTpl.toString() == dec.displayName);


    if (!powerjobServer || !powerjobUseExistCluster || !powerjobWorker || !jobTpl) {

      // let pluginMeta: PluginType = {
      //   name: 'datax-worker', require: true,
      //   descFilter: {
      //     endType: () => 'powerjob',
      //     localDescFilter: (desc) => true
      //   }
      // };

      // ItemPropValComponent.openPluginInstall(
      //   this.drawerService, this, 'PowerJob'
      //   , 'com.qlangtech.tis.datax.job.DataXJobWorker', this.pluginCategory);
      this.openPowerJobRelevantPlugin();
      return;
    }

    // if (!powerjobServer) {
    //   throw new Error("powerjobServer can not be null");
    // }
    // if (!powerjobUseExistCluster) {
    //   throw new Error("powerjobUseExistCluster can not be null");
    // }
    // if (!powerjobWorker) {
    //   throw new Error("powerjobWorker can not be null");
    // }
    // if (!jobTpl) {
    //   throw new Error("jobTpl can not be null");
    // }


    this.dto.powderJobServerHetero = PluginsComponent.pluginDesc(powerjobServer, this.powerJobPluginCategory);
    this.dto.powderJobUseExistClusterHetero = PluginsComponent.pluginDesc(powerjobUseExistCluster, this.powerJobPluginCategory);
    this.dto.powderJobWorkerHetero = PluginsComponent.pluginDesc(powerjobWorker, this.powerJobPluginCategory);
    this.dto.powderjobJobTplHetero = PluginsComponent.pluginDesc(jobTpl, this.powerJobPluginCategory);
    this.dto.hasSetHetero = true;
  }

  public openPowerJobRelevantPlugin() {
    ItemPropValComponent.openPluginInstall(
      this.drawerService, this, 'PowerJob'
      , 'com.qlangtech.tis.datax.job.DataXJobWorker'
      , this.powerJobPluginCategory, true, (aftInstallPluginClose) => {
        // console.log(aftInstallPluginClose);
        this.ngOnInit();
      });
  }

  public openFlinkClusterRelevantPlugin() {
    ItemPropValComponent.openPluginInstall(
      this.drawerService, this, 'Flink'
      , 'com.qlangtech.tis.datax.job.DataXJobWorker'
      , this.flinkPluginCategory, true, (aftInstallPluginClose) => {
        // console.log(aftInstallPluginClose);
        this.ngOnInit();
      });
  }

  onClick() {

    // if (!this.dto.hasSetHetero) {
    //   this.openPowerJobRelevantPlugin();
    //   return;
    // }

    this.nextStep.emit(this.dto);
  }

  onClickAddExistPowerjobCluster() {

    // if (!this.dto.hasSetHetero) {
    //   this.openPowerJobRelevantPlugin();
    //   return;
    // }

    this.dto.usingPowderJobUseExistCluster = true;
    let direct: IntendDirect = {dto: this.dto, cpt: DataxWorkerAddExistPowerjobClusterComponent};
    this.nextStep.emit(direct)
  }


}

export class WorkerDTO {
  constructor(public workDesc: Map<string /* impl */, Descriptor>, public typedPluginCount: Map<PowerjobCptType, number>) {
  }
}

