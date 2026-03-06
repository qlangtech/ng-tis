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

import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NzNotificationService} from 'ng-zorro-antd/notification';
import {DAGGraphViewerComponent} from '../common/dag-graph-viewer.component';
import {
  DAGMonitorService,
  DAGNode,
  DAGTopology, NodeExecution,
  NodeStatus,
  QueueItem,
  RuntimeNodeStatus,
  WorkflowInstance,
  WorkflowRuntimeStatusResponse,
  WorkflowStatus
} from '../service/dag.monitor.service';

@Component({
  selector: 'workflow-dag-monitor',
  template: `
    <div class="dag-monitor-container">
      <nz-page-header
        nzTitle="工作流监控"
        [nzSubtitle]="workflowInstance?.workflowName"
        (nzBack)="goBack()"
        nzBackIcon
      >
        <nz-page-header-extra>
          <nz-space>
            <nz-switch
              *nzSpaceItem
              [(ngModel)]="autoRefresh"
              (ngModelChange)="onAutoRefreshChange()"
              [nzCheckedChildren]="autoRefreshOnTemplate"
              [nzUnCheckedChildren]="autoRefreshOffTemplate"
            ></nz-switch>
            <ng-template #autoRefreshOnTemplate>
              <span nz-icon nzType="sync" nzSpin></span>
              自动刷新
            </ng-template>
            <ng-template #autoRefreshOffTemplate>
              <span nz-icon nzType="sync"></span>
              自动刷新
            </ng-template>
            <button *nzSpaceItem nz-button nzType="default" (click)="refresh()">
              <span nz-icon nzType="reload"></span>
              刷新
            </button>
            <ng-container *ngIf="workflowInstance?.status === 'RUNNING'">
              <button *nzSpaceItem
                      nz-button
                      nzType="primary"
                      nzDanger

                      nz-popconfirm
                      nzPopconfirmTitle="确定要停止该工作流实例吗？"
                      (nzOnConfirm)="stopWorkflow()"
                      nzOkText="确定"
                      nzCancelText="取消"
              >
                <span nz-icon nzType="stop"></span>
                停止工作流
              </button>
            </ng-container>

          </nz-space>
        </nz-page-header-extra>
      </nz-page-header>

      <nz-spin [nzSpinning]="loading">
        <div class="monitor-content">
          <!-- 工作流状态概览 -->
          <nz-card nzTitle="工作流状态" style="margin-bottom: 16px;">
            <nz-descriptions nzBordered [nzColumn]="4" *ngIf="workflowInstance">
              <nz-descriptions-item nzTitle="实例 ID">
                {{workflowInstance.id}}
              </nz-descriptions-item>
              <nz-descriptions-item nzTitle="状态">
                <nz-tag [nzColor]="getStatusColor(workflowInstance.status)">
                  <span nz-icon [nzType]="getStatusIcon(workflowInstance.status)"></span>
                  {{getStatusLabel(workflowInstance.status)}}
                </nz-tag>
              </nz-descriptions-item>
              <nz-descriptions-item nzTitle="开始时间">
                {{formatTime(workflowInstance.startTime)}}
              </nz-descriptions-item>
              <nz-descriptions-item nzTitle="执行时长">
                {{workflowInstance.duration ? formatDuration(workflowInstance.duration) : '进行中...'}}
              </nz-descriptions-item>
            </nz-descriptions>
          </nz-card>

          <!-- DAG 图 -->
          <nz-card nzTitle="DAG 拓扑图" style="margin-bottom: 16px;" [nzExtra]="topologyExtraTemplate">
            <dag-graph-viewer
              [topology]="dagTopology"
              [autoRefresh]="autoRefresh"
              (nodeClick)="onNodeClick($event)"
            ></dag-graph-viewer>
          </nz-card>
          <ng-template #topologyExtraTemplate>
            <nz-space>
              <button *nzSpaceItem nz-button nzType="default" (click)="dagGraphViewer?.fitView()">
                <span nz-icon nzType="fullscreen"></span>
                适应画布
              </button>
              <button *nzSpaceItem nz-button nzType="default" (click)="dagGraphViewer?.zoomIn()">
                <span nz-icon nzType="zoom-in"></span>
                放大
              </button>
              <button *nzSpaceItem nz-button nzType="default" (click)="dagGraphViewer?.zoomOut()">
                <span nz-icon nzType="zoom-out"></span>
                缩小
              </button>
              <button *nzSpaceItem nz-button nzType="default" (click)="dagGraphViewer?.resetZoom()">
                <span nz-icon nzType="redo"></span>
                重置
              </button>
              <button *nzSpaceItem nz-button nzType="default" (click)="switchLayout()">
                <span nz-icon nzType="layout"></span>
                {{currentLayoutName}}
              </button>
            </nz-space>
          </ng-template>

          <!-- 节点详情抽屉 -->
          <nz-drawer
            [nzVisible]="!!selectedNodeExecution"
            nzWidth="720"
            [nzTitle]="'节点详情: ' + (selectedNode?.name || '')"
            (nzOnClose)="closeNodeDetail()"
          >
            <ng-container *nzDrawerContent>
              <node-execution-detail
                [execution]="selectedNodeExecution"
              ></node-execution-detail>
            </ng-container>
          </nz-drawer>

          <!-- 标签页：队列和历史 -->
          <nz-tabset>
            <nz-tab nzTitle="等待队列">
              <waiting-queue-viewer
                [items]="waitingQueueItems"
              ></waiting-queue-viewer>
            </nz-tab>
            <nz-tab nzTitle="执行队列">
              <running-queue-viewer
                [items]="runningQueueItems"
              ></running-queue-viewer>
            </nz-tab>
            <nz-tab nzTitle="执行历史">
              <workflow-history-list
                [workflowId]="workflowInstance?.workflowId || 0"
              ></workflow-history-list>
            </nz-tab>
          </nz-tabset>
        </div>
      </nz-spin>
    </div>
  `,
  styles: [`
    .dag-monitor-container {
      padding: 24px;
      background: #f0f2f5;
      min-height: 100vh;
    }

    .monitor-content {
      max-width: 1400px;
      margin: 0 auto;
    }
  `]
})
export class WorkflowDAGMonitorComponent implements OnInit, OnDestroy {
  @ViewChild(DAGGraphViewerComponent) dagGraphViewer: DAGGraphViewerComponent;
  instanceId: number = 0;
  workflowInstance: WorkflowInstance | null = null;
  dagTopology: DAGTopology | null = null;
  loading: boolean = false;
  autoRefresh: boolean = true;
 // nodeDetailVisible: boolean = false;
  selectedNode: DAGNode | null = null;
  selectedNodeExecution: NodeExecution = null;
 // selectedNodeExecutionId: number | null = null;
  waitingQueueItems: QueueItem[] = [];
  runningQueueItems: QueueItem[] = [];
  currentLayoutName: string = '水平居中';

  private refreshInterval: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private monitorService: DAGMonitorService,
    private notification: NzNotificationService
  ) {
  }

  ngOnInit(): void {
    this.instanceId = Number(this.route.snapshot.params['instanceId']);
    if (!this.instanceId) {
      this.notification.error('错误', '工作流实例 ID 不能为空');
      this.goBack();
      return;
    }

    this.loadWorkflowStatus();

    if (this.autoRefresh) {
      this.startAutoRefresh();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  loadWorkflowStatus(): void {
    this.loading = true;
    this.monitorService.queryWorkflowStatus(this.instanceId)
      .then((result) => {
        if (result.success) {
          const runtimeStatus: WorkflowRuntimeStatusResponse = result.bizresult;
          //console.log(runtimeStatus);
          // build WorkflowInstance from unified response
          this.workflowInstance = {
            id: runtimeStatus.instanceId,
            workflowId: 0,
            workflowName: '',
            status: runtimeStatus.status as WorkflowStatus,
            startTime: runtimeStatus.startTime || 0,
            duration: runtimeStatus.startTime ? (Date.now() - runtimeStatus.startTime) : undefined
          };

          // build DAGTopology from nodes
          const dagNodes: DAGNode[] = (runtimeStatus.nodes || []).map((n: RuntimeNodeStatus) => ({
            id: String(n.nodeId),
            name: n.nodeName,
            status: (n.status as NodeStatus) || NodeStatus.WAITING,
            workerAddress: n.workerAddress
          }));
          this.dagTopology = {
            nodes: dagNodes,
            edges: (runtimeStatus.edges || []).map(e => ({
              source: String(e.from),
              target: String(e.to)
            }))
          };

          // console.log(this.dagTopology);

          // build waiting queue items (WAITING + QUEUED)
          this.waitingQueueItems = (runtimeStatus.nodes || [])
            .filter((n: RuntimeNodeStatus) => n.status === 'WAITING' || n.status === 'QUEUED')
            .map((n: RuntimeNodeStatus) => ({
              instanceId: runtimeStatus.instanceId,
              workflowName: '',
              nodeId: String(n.nodeId),
              nodeName: n.nodeName,
              status: (n.status as NodeStatus) || NodeStatus.WAITING
            }));

          // build running queue items
          this.runningQueueItems = (runtimeStatus.nodes || [])
            .filter((n: RuntimeNodeStatus) => n.status === 'RUNNING')
            .map((n: RuntimeNodeStatus) => ({
              instanceId: runtimeStatus.instanceId,
              workflowName: '',
              nodeId: String(n.nodeId),
              nodeName: n.nodeName,
              status: NodeStatus.RUNNING,
              workerAddress: n.workerAddress
            }));
        } else {
          const errorMsg = Array.isArray(result.msg) ? result.msg.join(', ') : (result.msg || '加载工作流状态失败');
          this.notification.error('加载失败', errorMsg);
        }
      })
      .catch((error) => {
        this.notification.error('加载失败', '加载工作流状态时发生错误');
        console.error('Load workflow status error:', error);
      })
      .finally(() => {
        this.loading = false;
      });
  }

  onNodeClick(node: DAGNode): void {
    console.log(node);
    this.selectedNode = node;
    // 查询节点执行记录 ID
    this.monitorService.getNodeExecutionDetail(this.instanceId, node.id)
      .then((result) => {
       // console.log(result);
        this.selectedNodeExecution = result;
        // if (result.success) {
        //   const executions = result.bizresult || [];
        //   const execution = executions.find((e: any) => e.nodeId === node.id);
        //   if (execution) {
          //   this.selectedNodeExecutionId = execution.id;
        //     this.nodeDetailVisible = true;
        //   } else {
        //     this.notification.warning('提示', '未找到该节点的执行记录');
        //   }
        // }
      })
      .catch((error) => {
        this.notification.error('查询失败', '查询节点执行记录时发生错误');
        console.error('Get node executions error:', error);
      });
  }

  closeNodeDetail(): void {
   // this.nodeDetailVisible = false;
    this.selectedNode = null;
    //this.selectedNodeExecutionId = null;
    this.selectedNodeExecution = null;
  }

  refresh(): void {
    this.loadWorkflowStatus();
  }

  switchLayout(): void {
    this.currentLayoutName = this.dagGraphViewer?.switchLayout();
  }

  onAutoRefreshChange(): void {
    if (this.autoRefresh) {
      this.startAutoRefresh();
    } else {
      this.stopAutoRefresh();
    }
  }

  stopWorkflow(): void {
    this.monitorService.stopWorkflowInstance(this.instanceId)
      .then((result) => {
        if (result.success) {
          this.notification.success('停止成功', '工作流实例已停止');
          this.refresh();
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

  goBack(): void {
    this.router.navigate(['/offline/wf']);
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
      return `${hours}小时${minutes % 60}分${seconds % 60}秒`;
    } else if (minutes > 0) {
      return `${minutes}分${seconds % 60}秒`;
    } else {
      return `${seconds}秒`;
    }
  }

  private startAutoRefresh(): void {
    this.refreshInterval = setInterval(() => {
      this.refresh();
    }, 5000); // 每 5 秒刷新一次
  }

  private stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }
}
