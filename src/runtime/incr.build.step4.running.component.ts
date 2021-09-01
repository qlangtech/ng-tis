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

import {AfterContentInit, Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from "@angular/core";
import {TISService} from "../common/tis.service";
import {AppFormComponent, CurrentCollection, WSMessage} from "../common/basic.form.component";
import {ActivatedRoute, Router} from "@angular/router";
import {NzModalService, NzNotificationService} from "ng-zorro-antd";
import {Subject} from "rxjs";
import {map} from "rxjs/operators";
import {IndexIncrStatus, K8sPodState, LogType} from "./misc/RCDeployment";

@Component({
  template: `
      <nz-spin size="large" [nzSpinning]="this.formDisabled">
          <nz-tabset [nzTabBarExtraContent]="extraTemplate" nzSize="large" [(nzSelectedIndex)]="tabSelectIndex">
              <nz-tab nzTitle="基本">
                  <ng-template nz-tab>
                      <nz-alert *ngIf="this.dto.incrProcessLaunchHasError" nzType="error" [nzDescription]="errorTpl" nzShowIcon></nz-alert>
                      <ng-template #errorTpl>
                          增量处理节点启动有误
                          <button nz-button nzType="link" (click)="tabSelectIndex=2">查看启动日志</button>
                      </ng-template>
                      <incr-build-step4-running-tab-base [msgSubject]="msgSubject" [dto]="dto"></incr-build-step4-running-tab-base>
                  </ng-template>
              </nz-tab>
              <nz-tab nzTitle="规格">
                  <nz-descriptions nzTitle="配置" nzBordered>
                      <nz-descriptions-item nzTitle="Docker Image">{{dto.rcDeployment.dockerImage}}</nz-descriptions-item>
                      <nz-descriptions-item nzTitle="创建时间">{{dto.rcDeployment.creationTimestamp | date : "yyyy/MM/dd HH:mm:ss"}}</nz-descriptions-item>
                  </nz-descriptions>
                  <nz-descriptions nzTitle="当前状态" nzBordered>
                      <nz-descriptions-item nzTitle="availableReplicas">{{dto.rcDeployment.status.availableReplicas}}</nz-descriptions-item>
                      <nz-descriptions-item nzTitle="fullyLabeledReplicas">{{dto.rcDeployment.status.fullyLabeledReplicas}}</nz-descriptions-item>
                      <nz-descriptions-item nzTitle="observedGeneration">{{dto.rcDeployment.status.observedGeneration}}</nz-descriptions-item>
                      <nz-descriptions-item nzTitle="readyReplicas">{{dto.rcDeployment.status.readyReplicas}}</nz-descriptions-item>
                      <nz-descriptions-item nzTitle="replicas">{{dto.rcDeployment.status.replicas}}</nz-descriptions-item>
                  </nz-descriptions>
                  <nz-descriptions nzTitle="资源分配" nzBordered>
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
                  <nz-descriptions nzTitle="环境变量" nzBordered>
                      <nz-descriptions-item *ngFor=" let e of  dto.rcDeployment.envs | keyvalue" [nzTitle]="e.key">{{e.value}}</nz-descriptions-item>
                  </nz-descriptions>

                  <h4 class="ant-descriptions-title pods">Pods</h4>
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
                      <incr-pod-logs-status [incrStatus]="this.dto" [msgSubject]="this.msgSubject"></incr-pod-logs-status>
                  </ng-template>
              </nz-tab>
              <nz-tab nzTitle="操作">
                  <nz-page-header class="danger-control-title" nzTitle="危险操作" nzSubtitle="以下操作可能造成某些组件功能不可用">
                  </nz-page-header>

                  <nz-list class="ant-advanced-search-form" nzBordered>
                      <nz-list-item>
                          <span nz-typography>删除增量实例</span>
                          <button nz-button nzType="danger" (click)="incrChannelDelete()"><i nz-icon nzType="delete" nzTheme="outline"></i>删除</button>
                      </nz-list-item>
                  </nz-list>
              </nz-tab>
          </nz-tabset>
          <ng-template #extraTemplate>
              <!--
               <button nz-button nz-dropdown [nzDropdownMenu]="menu4">
                   操作
                   <i nz-icon nzType="down"></i>
               </button>
               <nz-dropdown-menu #menu4="nzDropdownMenu">
                   <ul nz-menu>
                       <li nz-menu-item><i nz-icon nzType="delete" nzTheme="outline"></i>删除</li>
                   </ul>
               </nz-dropdown-menu>
              -->
          </ng-template>
      </nz-spin>
  `,
  styles: [
      `
          .pods {
              margin-top: 12px;
          }

          nz-descriptions {
              margin-top: 15px;
          }

          nz-tab {
              padding-left: 10px;
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

          [nz-row] {
              margin-bottom: 10px;
          }
    `
  ]
})
export class IncrBuildStep4RunningComponent extends AppFormComponent implements AfterContentInit, OnDestroy {
  private componentDestroy: boolean;
  tabSelectIndex = 0;
  @Output() nextStep = new EventEmitter<any>();
  @Output() preStep = new EventEmitter<any>();
  dto: IndexIncrStatus = new IndexIncrStatus();
  msgSubject: Subject<WSMessage>;

  // 实时流量配置
  constructor(tisService: TISService, route: ActivatedRoute, private router: Router, modalService: NzModalService, notification: NzNotificationService) {
    super(tisService, route, modalService, notification);
  }

  protected initialize(app: CurrentCollection): void {
  }

  ngAfterContentInit(): void {
    // console.log(this.dto);

    // this.startMonitorMqTagsStatus();

  }


  ngOnInit(): void {
    super.ngOnInit();
    this.route.fragment.subscribe((r) => {
      if (r === 'podlog') {
        this.tabSelectIndex = 2;

        let firstPod = this.dto.getFirstPod();
        if (firstPod) {
          this.startMonitorMqTagsStatus('incrdeploy-change:' + firstPod.name);
        } else {
          throw  new Error("have not found any pod");
        }
      } else {
        this.startMonitorMqTagsStatus('mq_tags_status');
      }
    })
  }

  public startMonitorMqTagsStatus(logtype: string) {
    // console.log(this.currentApp);
    this.msgSubject = this.getWSMsgSubject(logtype);
  }



  ngOnDestroy(): void {
    this.componentDestroy = true;
    if (this.msgSubject) {
      this.msgSubject.unsubscribe()
    }
  }

  /**
   * 删除增量通道
   */
  incrChannelDelete() {
    this.modalService.confirm({
      nzTitle: '删除',
      nzContent: `是否要删除增量实例'${this.currentApp.appName}'`,
      nzOkText: '执行',
      nzCancelText: '取消',
      nzOnOk: () => {
        this.httpPost('/coredefine/corenodemanage.ajax', "event_submit_do_incr_delete=y&action=core_action").then((r) => {
          if (r.success) {
            this.successNotify(`已经成功删除增量实例${this.currentApp.appName}`);
            //  this.router.navigate(["."], {relativeTo: this.route});
            this.nextStep.next(null);
          }
        });
      }
    });
  }
}

interface TisIncrStatus {
  summary: IncrSummary;
  tags: Array<TagState>;
}

interface TagState {
  tag: string;
  trantransferIncr: number;
}

interface IncrSummary {
  solrConsume: number;
  tableConsumeCount: number;
}
