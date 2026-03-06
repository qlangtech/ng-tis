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

import {Injectable} from '@angular/core';
import {TISService} from '../common/tis.service';
import {SavePluginEvent, TisResponseResult} from "../common/tis.plugin";
import {KEY_ASSEMBLE_CONTEXT_PATH, KEY_DAG_WORKFLOW_PATH} from "../common/basic.form.component";

export enum NodeStatus {
  WAITING = 'WAITING',
  QUEUED = 'QUEUED',
  RUNNING = 'RUNNING',
  SUCCEED = 'SUCCEED',
  FAILED = 'FAILED',
  STOPPED = 'STOPPED'
}

export enum WorkflowStatus {
  WAITING = 'WAITING',
  RUNNING = 'RUNNING',
  SUCCEED = 'SUCCEED',
  FAILED = 'FAILED',
  STOPPED = 'STOPPED'
}

export interface DAGNode {
  id: string;
  name: string;
  status: NodeStatus;
  startTime?: number;
  endTime?: number;
  duration?: number;
  workerAddress?: string;
  retryCount?: number;
  errorMessage?: string;
}

export interface DAGEdge {
  source: string;
  target: string;
}

export interface DAGTopology {
  nodes: DAGNode[];
  edges: DAGEdge[];
}

export interface WorkflowInstance {
  id: number;
  workflowId: number;
  workflowName: string;
  status: WorkflowStatus;
  startTime: number;
  endTime?: number;
  duration?: number;
  triggerType?: string;
  context?: Record<string, any>;
}

export interface NodeExecution {
  id: number;
  instanceId: number;
  nodeId: string;
  nodeName: string;
  status: NodeStatus;
  startTime?: number;
  endTime?: number;
  duration?: number;
  workerAddress?: string;
  retryCount: number;
  result?: string;
  errorMessage?: string;
}

export interface QueueItem {
  instanceId: number;
  workflowName: string;
  nodeId: string;
  nodeName: string;
  status: NodeStatus;
  waitingTime?: number;
  runningTime?: number;
  workerAddress?: string;
}

export interface ClusterMemberInfo {
  address: string;
  roles: string;
  status: string;
  upSince: number;
}

export interface ActiveWorkflowInfo {
  taskId: number;
  startTime: number;
  status: string;
  nodeCount: number;
  runningNodes: number;
}

export interface ActiveWorkerInfo {
  actorPath: string;
  taskId: number;
  nodeId: number;
  startTime: number;
  workerAddress: string;
}

export interface ActorSystemStatus {
  systemName: string;
  address: string;
  hostname: string;
  port: number;
  startTime: number;
  uptime: number;
  initialized: boolean;
  running: boolean;
  clusterMembers: ClusterMemberInfo[];
  actorCounts: Record<string, number>;
  activeWorkflows: ActiveWorkflowInfo[];
  activeWorkers: ActiveWorkerInfo[];
  maxInstancesPerNode: number;
}

export interface RuntimeNodeStatus {
  nodeId: number;
  nodeName: string;
  nodeType: string;
  status: string;
  result?: string;
  startTime?: number;
  finishedTime?: number;
  workerAddress?: string;
  retryTimes?: number;
}

export interface WorkflowRuntimeStatusResponse {
  instanceId: number;
  status: string;
  nodes: RuntimeNodeStatus[];
  edges?: { from: number; to: number }[];
  startTime?: number;
  updateTime?: number;
  totalNodes: number;
  waitingNodes: number;
  runningNodes: number;
  succeedNodes: number;
  failedNodes: number;
}

export interface ScheduleEntryInfo {
  pipelineName: string;
  cronExpression: string;
  turnOn: boolean;
  registerTime: number;
  lastTriggerTime: number;
  nextFireTime: number;
}

@Injectable({
  providedIn: 'root'
})
export class DAGMonitorService {

  constructor(private tisService: TISService) {
  }

  /**
   * KEY_DAG_WORKFLOW_PATH
   * query workflow runtime status from WorkflowInstanceActor in-memory state
   */
  queryWorkflowStatus(taskId: number): Promise<TisResponseResult> {
    let e = SavePluginEvent.createAssembleContext();
    return this.tisService.httpPost(KEY_DAG_WORKFLOW_PATH, `method=queryWorkflowStatus&taskid=${taskId}`, e);
  }

  /**
   * Query Akka Actor System status for monitoring dashboard
   */
  queryActorSystemStatus(): Promise<TisResponseResult> {
    let e = SavePluginEvent.createAssembleContext();
    return this.tisService.httpPost(KEY_DAG_WORKFLOW_PATH, 'method=queryActorSystemStatus', e);
  }

  /**
   * Query DAGSchedulerActor for all scheduled crontab entries detail
   */
  queryDAGSchedulerDetail(): Promise<TisResponseResult> {
    let e = SavePluginEvent.createAssembleContext();
    return this.tisService.httpPost(KEY_DAG_WORKFLOW_PATH, 'method=getDAGSchedulerDetail', e);
  }



  /**
   * 查询工作流实例状态
   */
  getWorkflowInstance(instanceId: number): Promise<any> {
    return this.tisService.httpPost('/coredefine/corenodemanage.ajax',
      `action=workflow_action&emethod=getWorkflowInstance&instanceId=${instanceId}`);
  }

  /**
   * 查询工作流 DAG 拓扑结构
   */
  getDAGTopology(instanceId: number): Promise<any> {
    return this.tisService.httpPost('/coredefine/corenodemanage.ajax',
      `action=workflow_action&emethod=getDAGTopology&instanceId=${instanceId}`);
  }

  /**
   * 查询工作流节点执行状态列表
   */
  getNodeExecutions(instanceId: number): Promise<any> {
    return this.tisService.httpPost('/coredefine/corenodemanage.ajax',
      `action=workflow_action&emethod=getNodeExecutions&instanceId=${instanceId}`);
  }

  /**
   * 查询节点执行详情
   */
  getNodeExecutionDetail(executionId: number, nodeId: string): Promise<NodeExecution> {
    let e = SavePluginEvent.createAssembleContext();
    return this.tisService.httpPost(KEY_DAG_WORKFLOW_PATH,
      `method=getNodeExecutionDetail&taskId=${executionId}&nodeId=${nodeId}`,e)
      .then((result) => {
     if(result.success){
       return result.bizresult as NodeExecution
     }
    });
  }

  /**
   * 查询节点执行日志
   */
  getNodeExecutionLog(executionId: number): Promise<any> {
    return this.tisService.httpPost('/coredefine/corenodemanage.ajax',
      `action=workflow_action&emethod=getNodeExecutionLog&executionId=${executionId}`);
  }

  /**
   * 查询等待队列
   */
  getWaitingQueue(workflowId?: number): Promise<any> {
    const params = workflowId
      ? `action=workflow_action&emethod=getWaitingQueue&workflowId=${workflowId}`
      : 'action=workflow_action&emethod=getWaitingQueue';
    return this.tisService.httpPost('/coredefine/corenodemanage.ajax', params);
  }

  /**
   * 查询执行队列
   */
  getRunningQueue(workerId?: string): Promise<any> {
    const params = workerId
      ? `action=workflow_action&emethod=getRunningQueue&workerId=${encodeURIComponent(workerId)}`
      : 'action=workflow_action&emethod=getRunningQueue';
    return this.tisService.httpPost('/coredefine/corenodemanage.ajax', params);
  }

  /**
   * 查询工作流执行历史
   */
  getWorkflowHistory(workflowId: number, page: number = 1, pageSize: number = 20, status?: WorkflowStatus): Promise<any> {
    let params = `action=workflow_action&emethod=getWorkflowHistory&workflowId=${workflowId}&page=${page}&pageSize=${pageSize}`;
    if (status) {
      params += `&status=${status}`;
    }
    return this.tisService.httpPost('/coredefine/corenodemanage.ajax', params);
  }

  /**
   * 查询工作流执行统计
   */
  getWorkflowStatistics(workflowId: number): Promise<any> {
    return this.tisService.httpPost('/coredefine/corenodemanage.ajax',
      `action=workflow_action&emethod=getWorkflowStatistics&workflowId=${workflowId}`);
  }

  /**
   * 停止工作流实例
   */
  stopWorkflowInstance(instanceId: number): Promise<any> {
    return this.tisService.httpPost('/coredefine/corenodemanage.ajax',
      `action=workflow_action&emethod=stopWorkflowInstance&instanceId=${instanceId}`);
  }

  /**
   * 重试失败的节点
   */
  retryFailedNode(executionId: number): Promise<any> {
    return this.tisService.httpPost('/coredefine/corenodemanage.ajax',
      `action=workflow_action&emethod=retryFailedNode&executionId=${executionId}`);
  }

  /**
   * 获取节点状态对应的颜色
   */
  getNodeStatusColor(status: NodeStatus): string {
    switch (status) {
      case NodeStatus.WAITING:
        return '#d9d9d9'; // 灰色
      case NodeStatus.RUNNING:
        return '#1890ff'; // 蓝色
      case NodeStatus.SUCCEED:
        return '#52c41a'; // 绿色
      case NodeStatus.FAILED:
        return '#f5222d'; // 红色
      case NodeStatus.STOPPED:
        return '#faad14'; // 橙色
      default:
        return '#d9d9d9';
    }
  }

  /**
   * 获取节点状态对应的图标
   */
  getNodeStatusIcon(status: NodeStatus): string {
    switch (status) {
      case NodeStatus.WAITING:
        return 'clock-circle';
      case NodeStatus.RUNNING:
        return 'loading';
      case NodeStatus.SUCCEED:
        return 'check-circle';
      case NodeStatus.FAILED:
        return 'close-circle';
      case NodeStatus.STOPPED:
        return 'stop';
      default:
        return 'question-circle';
    }
  }
}
