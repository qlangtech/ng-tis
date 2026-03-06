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

import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {DAGMonitorService, QueueItem} from '../service/dag.monitor.service';
import {NzNotificationService} from 'ng-zorro-antd/notification';

@Component({
  selector: 'waiting-queue-viewer',
  template: `
    <nz-card nzTitle="等待队列" [nzExtra]="extraTemplate">
      <nz-spin [nzSpinning]="loading">
        <nz-table
          #waitingTable
          [nzData]="queueItems"
          [nzSize]="'small'"
          [nzPageSize]="10"
          [nzShowPagination]="queueItems.length > 10"
        >
          <thead>
          <tr>
            <th>工作流</th>
            <th>节点名称</th>
            <th>节点 ID</th>
            <th>等待时长</th>
            <th>实例 ID</th>
          </tr>
          </thead>
          <tbody>
          <tr *ngFor="let item of waitingTable.data">
            <td>{{item.workflowName}}</td>
            <td>{{item.nodeName}}</td>
            <td><code>{{item.nodeId}}</code></td>
            <td>{{formatWaitingTime(item.waitingTime)}}</td>
            <td>
              <a [routerLink]="['/offline/wf_monitor', item.instanceId]">
                {{item.instanceId}}
              </a>
            </td>
          </tr>
          </tbody>
        </nz-table>
        <nz-empty *ngIf="queueItems.length === 0 && !loading" nzNotFoundContent="暂无等待节点"></nz-empty>
      </nz-spin>

      <ng-template #extraTemplate>
        <nz-space>
          <span *nzSpaceItem nz-typography nzType="secondary">
            总计: {{queueItems.length}} 个节点
          </span>
          <button *nzSpaceItem nz-button nzType="text" nzSize="small" (click)="refresh()">
            <span nz-icon nzType="reload"></span>
            刷新
          </button>
        </nz-space>
      </ng-template>
    </nz-card>
  `
})
export class WaitingQueueViewerComponent implements OnInit, OnChanges, OnDestroy {
  @Input() workflowId?: number;
  @Input() autoRefresh: boolean = false;
  @Input() items?: QueueItem[];

  queueItems: QueueItem[] = [];
  loading: boolean = false;
  private refreshInterval: any;

  constructor(
    private monitorService: DAGMonitorService,
    private notification: NzNotificationService
  ) {
  }

  ngOnInit(): void {
    if (this.items) {
      this.queueItems = this.items;
    } else {
      this.loadQueue();
    }

    if (this.autoRefresh && !this.items) {
      this.startAutoRefresh();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items'] && this.items) {
      this.queueItems = this.items;
    }
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  loadQueue(): void {
    this.loading = true;
    this.monitorService.getWaitingQueue(this.workflowId)
      .then((result) => {
        if (result.success) {
          this.queueItems = result.bizresult || [];
        } else {
          const errorMsg = Array.isArray(result.msg) ? result.msg.join(', ') : (result.msg || '加载等待队列失败');
          this.notification.error('加载失败', errorMsg);
        }
      })
      .catch((error) => {
        this.notification.error('加载失败', '加载等待队列时发生错误');
        console.error('Load waiting queue error:', error);
      })
      .finally(() => {
        this.loading = false;
      });
  }

  refresh(): void {
    this.loadQueue();
  }

  formatWaitingTime(ms?: number): string {
    if (!ms) {
      return '-';
    }

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}小时${minutes % 60}分`;
    } else if (minutes > 0) {
      return `${minutes}分${seconds % 60}秒`;
    } else {
      return `${seconds}秒`;
    }
  }

  private startAutoRefresh(): void {
    this.refreshInterval = setInterval(() => {
      this.loadQueue();
    }, 5000); // 每 5 秒刷新一次
  }

  private stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }
}