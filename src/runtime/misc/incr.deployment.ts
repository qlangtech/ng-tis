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

export interface CpuLimit {
  unit: string;
  unitEmpty: boolean;
  val: number;
}

export interface CpuRequest {
  unit: string;
  unitEmpty: boolean;
  val: number;
}


export interface MemoryLimit {
  unit: string;
  unitEmpty: boolean;
  val: number;
}

export interface MemoryRequest {
  unit: string;
  unitEmpty: boolean;
  val: number;
}

export interface Status {
  availableReplicas: number;
  fullyLabeledReplicas: number;
  observedGeneration: number;
  readyReplicas: number;
  replicas: number;
}

export interface IncrDeployment {
  cpuLimit: CpuLimit;
  cpuRequest: CpuRequest;
  creationTimestamp: number;
  dockerImage: string;
  envs: Map<string, string>;
  pods: Array<K8sPodState>;
  memoryLimit: MemoryLimit;
  memoryRequest: MemoryRequest;
  replicaCount: number;
  status: Status;
}

export interface K8sPodState {
  name: string;
  phase: string;
  startTime: string;
}
