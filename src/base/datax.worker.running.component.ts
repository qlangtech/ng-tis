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

import {NzModalService} from "ng-zorro-antd";
import {PluginSaveResponse} from "../common/tis.plugin";
import {K8SReplicsSpecComponent} from "../common/k8s.replics.spec.component";
import {DataXJobWorkerStatus, DataxWorkerDTO} from "./datax.worker.component";
import {IndexIncrStatus} from "../runtime/incr.build.component";

@Component({
  template: `
      <nz-spin size="large" [nzSpinning]="this.formDisabled">
          <nz-tabset  nzSize="large" [(nzSelectedIndex)]="tabSelectIndex">
              <nz-tab nzTitle="基本">
                  <ng-template nz-tab>
                      <!--
                          <nz-alert *ngIf="this.dto.incrProcessLaunchHasError" nzType="error" [nzDescription]="errorTpl" nzShowIcon></nz-alert>
                          <ng-template #errorTpl>
                              增量处理节点启动有误
                              <button nz-button nzType="link" (click)="tabSelectIndex=2">查看启动日志</button>
                          </ng-template>
                          <incr-build-step4-running-tab-base [msgSubject]="msgSubject" [dto]="dto"></incr-build-step4-running-tab-base>
                      -->
                  </ng-template>
              </nz-tab>
              <nz-tab nzTitle="规格">
                  <nz-descriptions class="desc-block" nzTitle="配置" nzBordered>
                      <nz-descriptions-item nzTitle="Docker Image">{{dto.rcDeployment.dockerImage}}</nz-descriptions-item>
                      <nz-descriptions-item nzTitle="创建时间">{{dto.rcDeployment.creationTimestamp | date : "yyyy/MM/dd HH:mm:ss"}}</nz-descriptions-item>
                  </nz-descriptions>
                  <nz-descriptions class="desc-block" nzTitle="当前状态" nzBordered>
                      <nz-descriptions-item nzTitle="availableReplicas">{{dto.rcDeployment.status.availableReplicas}}</nz-descriptions-item>
                      <nz-descriptions-item nzTitle="fullyLabeledReplicas">{{dto.rcDeployment.status.fullyLabeledReplicas}}</nz-descriptions-item>
                      <nz-descriptions-item nzTitle="observedGeneration">{{dto.rcDeployment.status.observedGeneration}}</nz-descriptions-item>
                      <nz-descriptions-item nzTitle="readyReplicas">{{dto.rcDeployment.status.readyReplicas}}</nz-descriptions-item>
                      <nz-descriptions-item nzTitle="replicas">{{dto.rcDeployment.status.replicas}}</nz-descriptions-item>
                  </nz-descriptions>
                  <nz-descriptions class="desc-block" nzTitle="资源分配" nzBordered>
                      <nz-descriptions-item nzTitle="CPU">
                          <nz-tag>request</nz-tag>
                          {{dto.rcDeployment.cpuRequest.val + dto.rcDeployment.cpuRequest.unit}}
                          <nz-tag>limit</nz-tag>
                          {{dto.rcDeployment.cpuLimit.val + dto.rcDeployment.cpuLimit.unit}}</nz-descriptions-item>
                      <nz-descriptions-item nzTitle="Memory">
                          <nz-tag>request</nz-tag>
                          {{dto.rcDeployment.memoryRequest.val + dto.rcDeployment.memoryRequest.unit}}
                          <nz-tag>limit</nz-tag>
                          {{dto.rcDeployment.memoryLimit.val + dto.rcDeployment.memoryLimit.unit}}</nz-descriptions-item>
                  </nz-descriptions>
                  <nz-descriptions class="desc-block" nzTitle="环境变量" nzBordered>
                      <nz-descriptions-item *ngFor=" let e of  dto.rcDeployment.envs | keyvalue" [nzTitle]="e.key">{{e.value}}</nz-descriptions-item>
                  </nz-descriptions>

                  <h4 class="ant-descriptions-title pods desc-block">Pods</h4>
                  <nz-table #pods nzSize="small" nzBordered="true" nzShowPagination="false" [nzData]="this?.dto.rcDeployment.pods">
                      <thead>
                      <tr>
                          <th width="20%">名称</th>
                          <th>状态</th>
                          <th>创建时间</th>
                      </tr>
                      </thead>
                      <tbody>
                      <tr *ngFor="let pod of pods.data">
                          <td>{{pod.name}}</td>
                          <td>
                              <nz-tag [nzColor]="'blue'"> {{pod.phase}}</nz-tag>
                          </td>
                          <td>{{pod.startTime | date:'yyyy/MM/dd HH:mm:ss'}}</td>
                      </tr>
                      </tbody>
                  </nz-table>
              </nz-tab>
              <nz-tab nzTitle="日志">
                  <ng-template nz-tab>
                      <!--
                      <incr-pod-logs-status [incrStatus]="this.dto" [msgSubject]="this.msgSubject"></incr-pod-logs-status>
                   -->
                  </ng-template>
              </nz-tab>
              <nz-tab nzTitle="操作">
                  <nz-page-header class="danger-control-title" nzTitle="危险操作" nzSubtitle="以下操作可能造成某些组件功能不可用">
                  </nz-page-header>
                  <nz-list class="ant-advanced-search-form" nzBordered>
                      <nz-list-item>
                          <span nz-typography>删除DataX Worker</span>
                          <button nz-button nzType="danger" (click)="dataXWorkerDelete()"><i nz-icon nzType="delete" nzTheme="outline"></i>删除</button>
                      </nz-list-item>
                  </nz-list>
              </nz-tab>
          </nz-tabset>
      </nz-spin>
  `
  , styles: [
      `
            .desc-block {
                margin-top: 20px;
            }
            .danger-control-title {
                margin-top: 10px;
                padding: 0px 0;
            }
            .ant-advanced-search-form {
                padding: 10px;
                #background: #fbfbfb;
                border: 2px solid #d97f85;
                border-radius: 6px;
                margin-bottom: 10px;
                clear: both;
            }
    `]
})
export class DataxWorkerRunningComponent extends AppFormComponent implements AfterViewInit, OnInit {
  // savePlugin = new EventEmitter<any>();
  // @ViewChild('k8sReplicsSpec', {read: K8SReplicsSpecComponent, static: true}) k8sReplicsSpec: K8SReplicsSpecComponent;
   @Output() nextStep = new EventEmitter<any>();
  // @Output() preStep = new EventEmitter<any>();
  // @Input() dto: DataxWorkerDTO;

  dto: DataXJobWorkerStatus = new DataXJobWorkerStatus();
  tabSelectIndex = 0;

  constructor(tisService: TISService, route: ActivatedRoute, modalService: NzModalService) {
    super(tisService, route, modalService);
  }

  ngOnInit(): void {
    // if (!this.dto.rcSpec) {
    //   throw new Error("rcSpec can not be null");
    // }
  }

  launchK8SController() {
    this.jsonPost('/coredefine/corenodemanage.ajax?action=datax_action&emethod=launch_datax_worker'
      , {
        // k8sSpec: this.k8sReplicsSpec.k8sControllerSpec,
      })
      .then((r) => {
        if (r.success) {
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


  prestep() {
    // this.preStep.next(this.dto);
  }

  dataXWorkerDelete() {

    this.jsonPost('/coredefine/corenodemanage.ajax?action=datax_action&emethod=remove_datax_worker'
      , {})
      .then((r) => {
        if (r.success) {
          // let rList = PluginsComponent.wrapDescriptors(r.bizresult.pluginDesc);
          // let desc = Array.from(rList.values());
          // this.hlist = DatasourceComponent.pluginDesc(desc[0])
          this.nextStep.emit(new DataxWorkerDTO());
        }
      });
  }
}

