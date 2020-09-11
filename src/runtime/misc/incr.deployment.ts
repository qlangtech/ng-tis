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
