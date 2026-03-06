import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {
  ActorSystemStatus,
  ActiveWorkerInfo,
  ClusterMemberInfo,
  DAGMonitorService
} from '../service/dag.monitor.service';

export interface TaskGroup {
  taskId: number;
  workersByNode: Map<string, ActiveWorkerInfo[]>;
}

@Component({
  selector: 'akka-cluster-monitor',
  template: `
    <tis-page-header [title]="'Akka集群监控'" [showBreadcrumb]="true">
    </tis-page-header>

    <nz-spin [nzSpinning]="loading">
      <!-- System Overview -->
      <nz-card nzTitle="系统概览" style="margin-bottom:16px">
        <nz-descriptions [nzColumn]="3" nzBordered nzSize="small" *ngIf="status">
          <nz-descriptions-item nzTitle="System名称">{{status.systemName}}</nz-descriptions-item>
          <nz-descriptions-item nzTitle="地址">{{status.address}}</nz-descriptions-item>
          <nz-descriptions-item nzTitle="Host">{{status.hostname}}:{{status.port}}</nz-descriptions-item>
          <nz-descriptions-item nzTitle="启动时间">{{status.startTime | date:'yyyy-MM-dd HH:mm:ss'}}</nz-descriptions-item>
          <nz-descriptions-item nzTitle="运行时长">{{formatDuration(status.uptime)}}</nz-descriptions-item>
          <nz-descriptions-item nzTitle="状态">
            <nz-tag *ngIf="status.running" nzColor="success">Running</nz-tag>
            <nz-tag *ngIf="status.initialized && !status.running" nzColor="warning">Initialized</nz-tag>
            <nz-tag *ngIf="!status.initialized" nzColor="error">Not Initialized</nz-tag>
          </nz-descriptions-item>
        </nz-descriptions>
      </nz-card>

      <!-- Actor Counts -->
      <nz-card nzTitle="Actor统计" style="margin-bottom:16px" *ngIf="status">
        <div style="display:flex;gap:24px;flex-wrap:wrap">
          <ng-container *ngFor="let entry of actorCountEntries">
            <ng-container [ngSwitch]="entry.key">
              <a *ngSwitchCase="'DAGSchedulerActor'" [routerLink]="['/base/akka-monitor/dag-scheduler']"
                 class="clickable-stat">
                <nz-statistic [nzTitle]="dagSchedulerTitle" [nzValue]="entry.value"
                              style="min-width:160px">
                </nz-statistic>
                <ng-template #dagSchedulerTitle>
                  {{entry.key}} <i nz-icon nzType="link" nzTheme="outline" style="font-size:12px;margin-left:4px"></i>
                </ng-template>
              </a>
              <nz-statistic *ngSwitchDefault
                            [nzTitle]="entry.key" [nzValue]="entry.value"
                            style="min-width:160px">
              </nz-statistic>
            </ng-container>
          </ng-container>
          <nz-statistic nzTitle="Active Workers"
                        [nzValue]="status.activeWorkers?.length || 0"
                        style="min-width:160px">
          </nz-statistic>
        </div>
      </nz-card>

      <!-- Cluster Topology -->
      <nz-card nzTitle="集群拓扑" style="margin-bottom:16px" *ngIf="status">
        <div *ngIf="workerNodes.length === 0" style="text-align:center;color:#999;padding:24px">
          暂无 Worker 节点
        </div>

        <div class="topology-grid" *ngIf="workerNodes.length > 0">
          <table class="topology-table">
            <!-- Header: Worker Nodes -->
            <thead>
              <tr>
                <th class="task-col-header">Task</th>
                <th *ngFor="let node of workerNodes" class="node-col-header">
                  <div class="node-header-card">
                    <div class="node-address">{{extractShortAddress(node.address)}}</div>
                    <div class="node-meta">
                      <nz-tag [nzColor]="node.status === 'Up' ? 'success' : (node.status === 'UNREACHABLE' ? 'error' : 'warning')"
                              style="margin-right:4px">
                        {{node.status}}
                      </nz-tag>
                      <span class="node-roles" nz-tooltip [nzTooltipTitle]="node.roles">
                        {{extractPrimaryRoles(node.roles)}}
                      </span>
                    </div>
                    <div class="node-capacity">
                      <div class="capacity-bar-bg">
                        <div class="capacity-bar-fill"
                             [style.width.%]="getNodeUsagePercent(node.address)"
                             [style.background-color]="getNodeUsagePercent(node.address) > 80 ? '#ff4d4f' : '#52c41a'">
                        </div>
                      </div>
                      <span class="capacity-text">{{getNodeWorkerCount(node.address)}} / {{status.maxInstancesPerNode || 5}}</span>
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
            <!-- Body: Task Rows -->
            <tbody>
              <tr *ngFor="let group of taskGroups">
                <td class="task-label">
                  <strong>Task-{{group.taskId}}</strong>
                </td>
                <td *ngFor="let node of workerNodes" class="worker-cell">
                  <ng-container *ngFor="let worker of getWorkersForCell(group, node.address)">
                    <span class="worker-block"
                          [class.worker-stale]="isWorkerStale(worker)"
                          nz-popover
                          nzPopoverTrigger="hover"
                          nzPopoverPlacement="top"
                          [nzPopoverTitle]="'TaskWorker 详情'"
                          [nzPopoverContent]="workerPopover">
                    </span>
                    <ng-template #workerPopover>
                      <div class="worker-popover">
                        <div><strong>Actor路径:</strong> <span style="word-break:break-all">{{worker.actorPath}}</span></div>
                        <div><strong>TaskId:</strong> {{worker.taskId}}</div>
                        <div><strong>NodeId:</strong> {{worker.nodeId}}</div>
                        <div><strong>运行时长:</strong>
                          {{formatDuration(now - worker.startTime)}}
                          <nz-tag *ngIf="isWorkerStale(worker)" nzColor="error" style="margin-left:4px">long running</nz-tag>
                        </div>
                      </div>
                    </ng-template>
                  </ng-container>
                  <span *ngIf="getWorkersForCell(group, node.address).length === 0"
                        class="empty-cell">-</span>
                </td>
              </tr>
              <!-- Empty state -->
              <tr *ngIf="taskGroups.length === 0">
                <td [attr.colspan]="workerNodes.length + 1"
                    style="text-align:center;color:#999;padding:24px">
                  当前无活跃任务
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </nz-card>
    </nz-spin>
  `,
  styles: [`
    :host {
      display: block;
      padding: 16px;
    }

    .clickable-stat {
      display: inline-block;
      text-decoration: none;
      color: inherit;
      border-radius: 4px;
      border: 1px solid transparent;
      transition: all 0.3s;
      cursor: pointer;
    }

    .clickable-stat:hover {
      background: #e6f7ff;
      border-color: #91d5ff;
    }

    .topology-grid {
      overflow-x: auto;
    }

    .topology-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #f0f0f0;
    }

    .topology-table th,
    .topology-table td {
      border: 1px solid #f0f0f0;
      padding: 8px 12px;
      vertical-align: middle;
    }

    .task-col-header {
      min-width: 100px;
      background: #fafafa;
      font-weight: 600;
      text-align: center;
    }

    .node-col-header {
      min-width: 160px;
      background: #fafafa;
      text-align: center;
    }

    .node-header-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .node-address {
      font-weight: 600;
      font-size: 13px;
      color: #262626;
    }

    .node-meta {
      display: flex;
      align-items: center;
      gap: 2px;
    }

    .node-roles {
      font-size: 11px;
      color: #8c8c8c;
      max-width: 80px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      cursor: default;
    }

    .node-capacity {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }

    .capacity-bar-bg {
      width: 80%;
      height: 6px;
      background: #f0f0f0;
      border-radius: 3px;
      overflow: hidden;
    }

    .capacity-bar-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.3s, background-color 0.3s;
    }

    .capacity-text {
      font-size: 11px;
      color: #8c8c8c;
    }

    .task-label {
      background: #fafafa;
      text-align: center;
      white-space: nowrap;
    }

    .worker-cell {
      text-align: center;
      min-height: 36px;
    }

    .worker-block {
      display: inline-block;
      width: 24px;
      height: 24px;
      border-radius: 3px;
      margin: 2px;
      background-color: #52c41a;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      vertical-align: middle;
    }

    .worker-block:hover {
      transform: scale(1.2);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .worker-block.worker-stale {
      background-color: #ff4d4f;
    }

    .empty-cell {
      color: #d9d9d9;
      font-size: 12px;
    }

    .worker-popover div {
      margin-bottom: 4px;
      font-size: 13px;
    }

    .worker-popover div:last-child {
      margin-bottom: 0;
    }
  `]
})
export class AkkaClusterMonitorComponent implements OnInit, OnDestroy {

  status: ActorSystemStatus;
  loading = true;
  now = Date.now();
  actorCountEntries: { key: string, value: number }[] = [];

  workerNodes: ClusterMemberInfo[] = [];

  taskGroups: TaskGroup[] = [];
  private nodeWorkerCounts: Map<string, number> = new Map();

  private refreshTimer: any;
  /** 2 hours in ms */
  private readonly STALE_THRESHOLD = 2 * 60 * 60 * 1000;

  constructor(private dagMonitorService: DAGMonitorService, private router: Router) {
  }

  ngOnInit(): void {
    this.loadStatus();
    this.refreshTimer = setInterval(() => {
      this.now = Date.now();
      this.loadStatus();
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  }

  loadStatus(): void {
    this.dagMonitorService.queryActorSystemStatus().then(result => {
      this.loading = false;
      if (result.success) {
        this.status = result.bizresult as ActorSystemStatus;
        this.actorCountEntries = [];
        if (this.status.actorCounts) {
          for (const key of Object.keys(this.status.actorCounts)) {
            this.actorCountEntries.push({key, value: this.status.actorCounts[key]});
          }
        }
        this.buildTopology();
      }
    }).catch(() => {
      this.loading = false;
    });
  }

  private buildTopology(): void {
    // 1. Filter worker-role nodes
    this.workerNodes = (this.status.clusterMembers || [])
      .filter(m => m.roles && m.roles.includes('worker'));

    // 2. Group activeWorkers by taskId, then by node address
    const taskMap = new Map<number, Map<string, ActiveWorkerInfo[]>>();
    const nodeCounts = new Map<string, number>();

    for (const node of this.workerNodes) {
      nodeCounts.set(node.address, 0);
    }

    for (const worker of (this.status.activeWorkers || [])) {
      const nodeAddr = worker.workerAddress;

      // Increment node worker count
      nodeCounts.set(nodeAddr, (nodeCounts.get(nodeAddr) || 0) + 1);

      // Group by taskId
      if (!taskMap.has(worker.taskId)) {
        taskMap.set(worker.taskId, new Map());
      }
      const nodeMap = taskMap.get(worker.taskId);
      if (!nodeMap.has(nodeAddr)) {
        nodeMap.set(nodeAddr, []);
      }
      nodeMap.get(nodeAddr).push(worker);
    }



    this.nodeWorkerCounts = nodeCounts;

    // 3. Build sorted task groups
    this.taskGroups = [];
    taskMap.forEach((workersByNode, taskId) => {
      this.taskGroups.push({taskId, workersByNode});
    });
    this.taskGroups.sort((a, b) => a.taskId - b.taskId);
  }

  extractNodeAddress(actorPath: string): string {
    if (!actorPath) return '';
    const match = actorPath.match(/^(akka:\/\/[^/]+)/);
    return match ? match[1] : '';
  }

  extractShortAddress(address: string): string {
    if (!address) return '';
    const match = address.match(/@(.+)$/);
    return match ? match[1] : address;
  }

  extractPrimaryRoles(roles: string): string {
    if (!roles) return '';
    const parts = roles.split(',').map(r => r.trim()).filter(r => r !== 'dc-default');
    return parts.join(',');
  }

  getNodeWorkerCount(nodeAddress: string): number {
    return this.nodeWorkerCounts.get(nodeAddress) || 0;
  }

  getNodeUsagePercent(nodeAddress: string): number {
    const max = this.status.maxInstancesPerNode || 5;
    const count = this.getNodeWorkerCount(nodeAddress);
    return Math.min(100, (count / max) * 100);
  }

  getWorkersForCell(group: TaskGroup, nodeAddress: string): ActiveWorkerInfo[] {
    return group.workersByNode.get(nodeAddress) || [];
  }

  isWorkerStale(worker: ActiveWorkerInfo): boolean {
    return (this.now - worker.startTime) > this.STALE_THRESHOLD;
  }

  formatDuration(ms: number): string {
    if (!ms || ms < 0) return '-';
    const seconds = Math.floor(ms / 1000);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}h ${m}m ${s}s`;
    } else if (m > 0) {
      return `${m}m ${s}s`;
    }
    return `${s}s`;
  }
}
