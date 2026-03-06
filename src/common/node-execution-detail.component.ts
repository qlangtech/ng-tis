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

import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {DAGMonitorService, NodeExecution, NodeStatus} from '../service/dag.monitor.service';
import {NzNotificationService} from 'ng-zorro-antd/notification';

@Component({
  selector: 'node-execution-detail',
  template: `

    <nz-spin [nzSpinning]="loading">
      <div *ngIf="execution">
        <nz-descriptions nzBordered [nzColumn]="2">
          <nz-descriptions-item nzTitle="节点名称" [nzSpan]="2">
            {{execution.nodeName}}
          </nz-descriptions-item>
          <nz-descriptions-item nzTitle="节点 ID">
            {{execution.nodeId}}
          </nz-descriptions-item>
          <nz-descriptions-item nzTitle="状态">
            <nz-tag [nzColor]="getStatusColor(execution.status)">
              <span nz-icon [nzType]="getStatusIcon(execution.status)"></span>
              {{execution.status}}
            </nz-tag>
          </nz-descriptions-item>
          <nz-descriptions-item nzTitle="开始时间">
            {{execution.startTime ? formatTime(execution.startTime) : '-'}}
          </nz-descriptions-item>
          <nz-descriptions-item nzTitle="结束时间">
            {{execution.endTime ? formatTime(execution.endTime) : '-'}}
          </nz-descriptions-item>
          <nz-descriptions-item nzTitle="执行时长">
            {{execution.duration ? formatDuration(execution.duration) : '-'}}
          </nz-descriptions-item>
          <nz-descriptions-item nzTitle="Worker 地址">
            {{execution.workerAddress || '-'}}
          </nz-descriptions-item>
          <nz-descriptions-item nzTitle="重试次数">
            {{execution.retryCount}}
          </nz-descriptions-item>
          <nz-descriptions-item nzTitle="执行结果" [nzSpan]="2" *ngIf="execution.result">
            <pre style="max-height: 200px; overflow: auto;">{{execution.result}}</pre>
          </nz-descriptions-item>
          <nz-descriptions-item nzTitle="错误信息" [nzSpan]="2" *ngIf="execution.errorMessage">
            <nz-alert nzType="error" [nzMessage]="execution.errorMessage" nzShowIcon></nz-alert>
          </nz-descriptions-item>
        </nz-descriptions>

        <nz-divider nzText="执行日志" nzOrientation="left"></nz-divider>
        <div class="log-container">
          <nz-spin [nzSpinning]="loadingLog">
            <div *ngIf="executionLog" class="log-content">
              <pre>{{executionLog}}</pre>
            </div>
            <nz-empty *ngIf="!executionLog && !loadingLog" nzNotFoundContent="暂无日志"></nz-empty>
          </nz-spin>
        </div>

        <div style="margin-top: 16px;">
          <nz-space>
            <button *nzSpaceItem nz-button nzType="default" (click)="refreshLog()">
              <span nz-icon nzType="reload"></span>
              刷新日志
            </button>
            <ng-container  *ngIf="execution.status === 'FAILED'">
              <button
                *nzSpaceItem
                nz-button
                nzType="primary"
                nzDanger

                (click)="retryNode()"
                [nzLoading]="retrying"
              >
                <span nz-icon nzType="redo"></span>
                重试节点
              </button>
            </ng-container>
          </nz-space>
        </div>
      </div>
    </nz-spin>
  `,
  styles: [`
    .log-container {
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      padding: 16px;
      background: #fafafa;
      min-height: 200px;
      max-height: 400px;
      overflow: auto;
    }

    .log-content pre {
      margin: 0;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.5;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  `]
})
export class NodeExecutionDetailComponent implements OnChanges {
  @Input() execution: NodeExecution | null = null;

  //execution: NodeExecution | null = null;
  executionLog: string = '';
  loading: boolean = false;
  loadingLog: boolean = false;
  retrying: boolean = false;

  constructor(
    private monitorService: DAGMonitorService,
    private notification: NzNotificationService
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['executionId'] && this.execution) {
      //this.loadExecutionDetail();
     // this.loadExecutionLog();
    }
  }

  loadExecutionDetail(): void {
    // if (!this.executionId) {
    //   return;
    // }

    this.loading = true;
    // this.monitorService.getNodeExecutionDetail(this.executionId)
    //   .then((result) => {
    //     if (result.success) {
    //       this.execution = result.bizresult;
    //     } else {
    //       const errorMsg = Array.isArray(result.msg) ? result.msg.join(', ') : (result.msg || '加载节点执行详情失败');
    //       this.notification.error('加载失败', errorMsg);
    //     }
    //   })
    //   .catch((error) => {
    //     this.notification.error('加载失败', '加载节点执行详情时发生错误');
    //     console.error('Load node execution detail error:', error);
    //   })
    //   .finally(() => {
    //     this.loading = false;
    //   });
  }

  // loadExecutionLog(): void {
  //   if (!this.executionId) {
  //     return;
  //   }
  //
  //   this.loadingLog = true;
  //   this.monitorService.getNodeExecutionLog(this.executionId)
  //     .then((result) => {
  //       if (result.success) {
  //         this.executionLog = result.bizresult || '';
  //       } else {
  //         const errorMsg = Array.isArray(result.msg) ? result.msg.join(', ') : (result.msg || '加载执行日志失败');
  //         this.notification.error('加载失败', errorMsg);
  //       }
  //     })
  //     .catch((error) => {
  //       this.notification.error('加载失败', '加载执行日志时发生错误');
  //       console.error('Load node execution log error:', error);
  //     })
  //     .finally(() => {
  //       this.loadingLog = false;
  //     });
  // }

  refreshLog(): void {
   // this.loadExecutionLog();
  }

  retryNode(): void {
    // if (!this.executionId) {
    //   return;
    // }
    //
    // this.retrying = true;
    // this.monitorService.retryFailedNode(this.executionId)
    //   .then((result) => {
    //     if (result.success) {
    //       this.notification.success('重试成功', '节点已重新提交执行');
    //       // 刷新详情
    //       setTimeout(() => {
    //         this.loadExecutionDetail();
    //       }, 1000);
    //     } else {
    //       const errorMsg = Array.isArray(result.msg) ? result.msg.join(', ') : (result.msg || '重试节点失败');
    //       this.notification.error('重试失败', errorMsg);
    //     }
    //   })
    //   .catch((error) => {
    //     this.notification.error('重试失败', '重试节点时发生错误');
    //     console.error('Retry node error:', error);
    //   })
    //   .finally(() => {
    //     this.retrying = false;
    //   });
  }

  getStatusColor(status: NodeStatus): string {
    return this.monitorService.getNodeStatusColor(status);
  }

  getStatusIcon(status: NodeStatus): string {
    return this.monitorService.getNodeStatusIcon(status);
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
      return `${hours}小时${minutes % 60}分${seconds % 60}秒`;
    } else if (minutes > 0) {
      return `${minutes}分${seconds % 60}秒`;
    } else {
      return `${seconds}秒`;
    }
  }
}
