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

import {Component, Input, OnInit} from '@angular/core';
import {DAGMonitorService, WorkflowInstance, WorkflowStatus} from '../service/dag.monitor.service';
import {NzNotificationService} from 'ng-zorro-antd/notification';
import {Router} from '@angular/router';

@Component({
  selector: 'workflow-history-list',
  template: `
    <nz-card nzTitle="执行历史" [nzExtra]="extraTemplate">
      <div style="margin-bottom: 16px;">
        <nz-space>
          <nz-select
            *nzSpaceItem
            [(ngModel)]="filterStatus"
            (ngModelChange)="onFilterChange()"
            nzPlaceHolder="筛选状态"
            nzAllowClear
            style="width: 150px;"
          >
            <nz-option nzValue="WAITING" nzLabel="等待中"></nz-option>
            <nz-option nzValue="RUNNING" nzLabel="运行中"></nz-option>
            <nz-option nzValue="SUCCEED" nzLabel="成功"></nz-option>
            <nz-option nzValue="FAILED" nzLabel="失败"></nz-option>
            <nz-option nzValue="STOPPED" nzLabel="已停止"></nz-option>
          </nz-select>
          <button *nzSpaceItem nz-button nzType="default" (click)="refresh()">
            <span nz-icon nzType="reload"></span>
            刷新
          </button>
        </nz-space>
      </div>

      <nz-spin [nzSpinning]="loading">
        <nz-table
          #historyTable
          [nzData]="instances"
          [nzSize]="'small'"
          [nzPageSize]="pageSize"
          [nzTotal]="total"
          [nzPageIndex]="currentPage"
          (nzPageIndexChange)="onPageChange($event)"
          [nzFrontPagination]="false"
        >
          <thead>
          <tr>
            <th>实例 ID</th>
            <th>状态</th>
            <th>开始时间</th>
            <th>结束时间</th>
            <th>执行时长</th>
            <th>触发方式</th>
            <th>操作</th>
          </tr>
          </thead>
          <tbody>
          <tr *ngFor="let instance of historyTable.data">
            <td>
              <a (click)="viewInstance(instance.id)">{{instance.id}}</a>
            </td>
            <td>
              <nz-tag [nzColor]="getStatusColor(instance.status)">
                <span nz-icon [nzType]="getStatusIcon(instance.status)"></span>
                {{getStatusLabel(instance.status)}}
              </nz-tag>
            </td>
            <td>{{formatTime(instance.startTime)}}</td>
            <td>{{instance.endTime ? formatTime(instance.endTime) : '-'}}</td>
            <td>{{instance.duration ? formatDuration(instance.duration) : '-'}}</td>
            <td>
              <nz-tag nzColor="default">{{instance.triggerType || '手动'}}</nz-tag>
            </td>
            <td>
              <nz-space>
                <a *nzSpaceItem (click)="viewInstance(instance.id)">查看</a>
                <ng-container *ngIf="instance.status === 'RUNNING'">
                  <a
                    *nzSpaceItem
                    nz-popconfirm
                    nzPopconfirmTitle="确定要停止该工作流实例吗？"
                    (click)="stopInstance(instance.id)"
                    nzOkText="确定"
                    nzCancelText="取消"
                  >
                    停止
                  </a>
                </ng-container>

              </nz-space>
            </td>
          </tr>
          </tbody>
        </nz-table>
        <nz-empty *ngIf="instances.length === 0 && !loading" nzNotFoundContent="暂无执行历史"></nz-empty>
      </nz-spin>

      <ng-template #extraTemplate>
        <span nz-typography nzType="secondary">
          总计: {{total}} 条记录
        </span>
      </ng-template>
    </nz-card>
  `
})
export class WorkflowHistoryListComponent implements OnInit {
  @Input() workflowId!: number;

  instances: WorkflowInstance[] = [];
  loading: boolean = false;
  currentPage: number = 1;
  pageSize: number = 20;
  total: number = 0;
  filterStatus?: WorkflowStatus;

  constructor(
    private monitorService: DAGMonitorService,
    private notification: NzNotificationService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    if (!this.workflowId) {
      this.notification.error('错误', '工作流 ID 不能为空');
      return;
    }
    this.loadHistory();
  }

  loadHistory(): void {
    this.loading = true;
    this.monitorService.getWorkflowHistory(this.workflowId, this.currentPage, this.pageSize, this.filterStatus)
      .then((result) => {
        if (result.success) {
          const data = result.bizresult;
          this.instances = data.items || [];
          this.total = data.total || 0;
        } else {
          const errorMsg = Array.isArray(result.msg) ? result.msg.join(', ') : (result.msg || '加载执行历史失败');
          this.notification.error('加载失败', errorMsg);
        }
      })
      .catch((error) => {
        this.notification.error('加载失败', '加载执行历史时发生错误');
        console.error('Load workflow history error:', error);
      })
      .finally(() => {
        this.loading = false;
      });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadHistory();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadHistory();
  }

  refresh(): void {
    this.loadHistory();
  }

  viewInstance(instanceId: number): void {
    this.router.navigate(['/offline/wf_monitor', instanceId]);
  }

  stopInstance(instanceId: number): void {
    this.monitorService.stopWorkflowInstance(instanceId)
      .then((result) => {
        if (result.success) {
          this.notification.success('停止成功', '工作流实例已停止');
          this.loadHistory();
        } else {
          const errorMsg = Array.isArray(result.msg) ? result.msg.join(', ') : (result.msg || '停止工作流实例失败');
          this.notification.error('停止失败', errorMsg);
        }
      })
      .catch((error) => {
        this.notification.error('停止失败', '停止工作流实例时发生错误');
        console.error('Stop workflow instance error:', error);
      });
  }

  getStatusColor(status: WorkflowStatus): string {
    switch (status) {
      case WorkflowStatus.WAITING:
        return 'default';
      case WorkflowStatus.RUNNING:
        return 'processing';
      case WorkflowStatus.SUCCEED:
        return 'success';
      case WorkflowStatus.FAILED:
        return 'error';
      case WorkflowStatus.STOPPED:
        return 'warning';
      default:
        return 'default';
    }
  }

  getStatusIcon(status: WorkflowStatus): string {
    return this.monitorService.getNodeStatusIcon(status as any);
  }

  getStatusLabel(status: WorkflowStatus): string {
    switch (status) {
      case WorkflowStatus.WAITING:
        return '等待中';
      case WorkflowStatus.RUNNING:
        return '运行中';
      case WorkflowStatus.SUCCEED:
        return '成功';
      case WorkflowStatus.FAILED:
        return '失败';
      case WorkflowStatus.STOPPED:
        return '已停止';
      default:
        return status;
    }
  }

  formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN');
  }

  formatDuration(ms: number): string {
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
}
