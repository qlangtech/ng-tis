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

declare module flink.job.detail {

  export interface JobManagerAddress {
    host: string;
    port: number;
    uRL: string;
  }

  export interface ClusterCfg {
    clusterId: string;
    jobManagerAddress: JobManagerAddress;
    name: string;
  }


  export interface JobVertexMetrics {
    bytesRead: number;
    bytesReadComplete: boolean;
    bytesWritten: number;
    bytesWrittenComplete: boolean;
    recordsRead: number;
    recordsReadComplete: boolean;
    recordsWritten: number;
    recordsWrittenComplete: boolean;
  }

  export interface TasksPerState {
    RECONCILING: number;
    FAILED: number;
    RUNNING: number;
    CANCELING: number;
    CREATED: number;
    SCHEDULED: number;
    CANCELED: number;
    DEPLOYING: number;
    FINISHED: number;
    INITIALIZING: number;
  }

  export interface JobVertexInfo {
    duration: number;
    endTime: number;
    executionState: string;
    jobVertexID: string;
    jobVertexMetrics: JobVertexMetrics;
    maxParallelism: number;
    name: string;
    parallelism: number;
    startTime: any;
    tasksPerState: TasksPerState;
  }

  export interface JobVerticesPerState {
    RECONCILING: number;
    FAILED: number;
    RUNNING: number;
    CANCELING: number;
    CREATED: number;
    SCHEDULED: number;
    CANCELED: number;
    DEPLOYING: number;
    FINISHED: number;
    INITIALIZING: number;
  }

  export interface PerExecState {
    count: number;
    stateColor: string;
  }

  export interface Timestamps {
    RECONCILING: number;
    INITIALIZING: number;
    RUNNING: number;
    CANCELLING: number;
    SUSPENDED: number;
    RESTARTING: number;
    FINISHED: number;
    FAILED: number;
    CANCELED: number;
    FAILING: number;
    CREATED: number;
  }

  export interface FlinkJobDetail {
    clusterCfg: ClusterCfg;
    cancelable: boolean;
    duration: number;
    endTime: number;
    jobId: string;
    jobStatus: string;
    statusColor: string;
    sources: JobVertexInfo[];
    jobVerticesPerState: PerExecState[];
    maxParallelism: number;
    name: string;
    now: number;
    startTime: number;
    stoppable: boolean;
    timestamps: Timestamps;
  }
}
