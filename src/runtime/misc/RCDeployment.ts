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

import {BasicFormComponent} from "../../common/basic.form.component";
import {K8SRCSpec} from "../../common/k8s.replics.spec.component";
import {StepType} from "../../common/steps.component";
import FlinkJobDetail = flink.job.detail.FlinkJobDetail;
import {Descriptor, HeteroList, PluginName, PluginType, SavePluginEvent} from "../../common/tis.plugin";
import {ExecuteStep, MessageData} from "../../common/tis.service";
import {DataxWorkerAddStep0Component} from "../../base/datax.worker.add.step0.component";
import {PowerjobCptType} from "../../base/datax.worker.component";
import {DataxWorkerAddStep1Component} from "../../base/datax.worker.add.step1.component";
import {Params} from "@angular/router";
import {DataxWorkerAddStep3Component} from "../../base/datax.worker.add.step3.component";
import {DataxWorkerRunningComponent} from "../../base/datax.worker.running.component";

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

export class ScalaLog {
  faild: boolean;
  launchingTokenExist: boolean;
  logs: Array<MessageData>
  milestones: Array<ExecuteStep>
}

export interface RCDeployment {
  name: string;
  cpuLimit: CpuLimit;
  cpuRequest: CpuRequest;
  creationTimestamp: number;
  dockerImage: string;
  envs: Map<string, string>;
  pods: Array<K8sPodState>;
  memoryLimit: MemoryLimit;
  memoryRequest: MemoryRequest;
  replicaCount: number;
  replicaScalable: boolean;
  rcScalaLog: ScalaLog
  status: Status;
}

export interface K8sPodState {
  name: string;
  phase?: string;
  startTime?: string;
  restartCount?: number;
}

export enum LogType {
  INCR_DEPLOY_STATUS_CHANGE = "incrdeploy-change",
  DATAX_WORKER_POD_LOG = "datax-worker-pod-log"
}

export interface RcHpaStatus {
  conditions: Array<HpaConditionEvent>;
  currentMetrics: Array<HpaMetrics>;
  autoscalerStatus: HpaAutoscalerStatus;
  autoscalerSpec: HpaAutoscalerSpec;
}

export interface HpaConditionEvent {
  type: string;
  status: string;
  lastTransitionTime: string;
  reason: string;
  message: string;
}

export interface HpaAutoscalerStatus {
  currentCPUUtilizationPercentage: number;
  currentReplicas: number;
  desiredReplicas: number;
  lastScaleTime: number;
}

export interface HpaAutoscalerSpec {
  maxReplicas: number;
  minReplicas: number;
  targetCPUUtilizationPercentage: number;
}

export interface HpaMetrics {
  type: string;

  resource: UsingResource;
}

export interface UsingResource {
  name: string;
  currentAverageUtilization: any;
  currentAverageValue: any;
}

export class K8SControllerStatus {
  public k8sReplicationControllerCreated: boolean;
  public payloads: { string?: any } = {};

  public state: "NONE" | "STOPED" | "RUNNING" | "DISAPPEAR" | "FAILED";
  // 由于本地执行器没有安装，导致datax执行器无法执行
  public installLocal: boolean;
  public rcDeployments: Array<RCDeployment>;

  public get rcDeployment(): RCDeployment {
    if (!this.rcDeployments) {
      return null;
    }
    for (let idx = 0; idx < this.rcDeployments.length; idx++) {
      return this.rcDeployments[idx];
    }
    return null;
  }

  public findPod(podName: string): K8sPodState {
    if (!this.rcDeployments) {
      throw new Error("rcDeployments can not be null");
    }
    let pod: K8sPodState = null;
    for (let idx = 0; idx < this.rcDeployments.length; idx++) {
      pod = this.rcDeployments[idx].pods.find((pp) => (pp.name === podName));
      if (pod) {
        return pod;
      }
    }
    throw new Error(" has not found pod with name:" + podName);
  }
}

export interface PluginExtraProps {
  endType: string;
  extendPoint: string;
  supportIncr: boolean;
  impl: string;
  displayName: string;
}

export interface IncrDesc extends PluginExtraProps {
  extendSelectedTabProp: boolean;
}

export class IndexIncrStatus extends K8SControllerStatus {
  public incrScriptCreated: boolean;
  public incrScriptMainFileContent: string;
  public restorableByCheckpoint: boolean;
  public k8sPluginInitialized: boolean;
  public flinkJobDetail: FlinkJobDetail;
  public incrProcess: IncrProcess;

  public incrSourceDesc: IncrDesc;
  public incrSinkDesc: IncrDesc;
  public readerDesc: PluginExtraProps;
  public writerDesc: PluginExtraProps;


  public static getIncrStatusThenEnter(basicForm: BasicFormComponent, hander: ((r: IndexIncrStatus) => void), cache = true) {
    basicForm.httpPost('/coredefine/corenodemanage.ajax'
      , `action=core_action&emethod=get_incr_status&cache=${cache}`)
      .then((r) => {
        if (r.success) {
          let incrStatus: IndexIncrStatus = Object.assign(new IndexIncrStatus(), r.bizresult);
          hander(incrStatus);
        }
      });
  }

  /**
   * 增量处理节点启动有异常
   */
  public get incrProcessLaunchHasError(): boolean {
    return this.k8sReplicationControllerCreated
      && this.incrProcess
      && !this.incrProcess.incrGoingOn
      && !!this.rcDeployment
      && !!this.rcDeployment.status
      && this.rcDeployment.status.readyReplicas > 0;
  }

  public getFirstPod(): K8sPodState {
    for (let i = 0; i < this.rcDeployment.pods.length; i++) {
      return this.rcDeployment.pods[i];
      break;
    }
    return null;
  }
}

export interface IncrProcess {
  incrGoingOn: boolean;
  incrProcessPaused: boolean;
}

export interface Breadcrumb {
  breadcrumb: Array<string>;
  name: string;
}

export interface ProcessMeta {
  init_get_job_worker_meta: string;
  targetNameGetter: (params: Params, justGroup?: boolean, dto?: DataxWorkerDTO) => string;
  runningTabRouterGetter: (params: Params) => Array<string>;
  targetName: string;
  pageHeader: string;
  breadcrumbGetter?: (params: Params) => Breadcrumb;
  stepsType: StepType
  supportK8SReplicsSpecSetter: boolean;
  // step0
  notCreateTips: string;
  //createButtonLabel: string;

  step1Buttons?: Array<{ label: string, click: (cpt: DataxWorkerAddStep0Component) => void }>;
  confirmStepCpts?: Array<{
    // hetero: PluginName
    heteroPluginTypeGetter: (dto: DataxWorkerDTO, params: Params) => PluginType //
    , cptType: PowerjobCptType //
    , cptShow: (dto: DataxWorkerDTO) => boolean //
    , cpuMemorySpecGetter: (dto: DataxWorkerDTO) => K8SRCSpec
  }>;

  step0InitDescriptorProcess: (cpt: DataxWorkerAddStep0Component, desc: Array<Descriptor>) => void

  step1CreateSaveEvent: (step1: DataxWorkerAddStep1Component) => SavePluginEvent
  step1PluginType: PluginType;
  successCreateNext: (step3: DataxWorkerAddStep3Component) => void
  step1HeteroGetter: (dto: DataxWorkerDTO) => HeteroList[]

  launchClusterMethod: string;
  relaunchClusterMethod: string;
  runningStepCfg: { showPowerJobWorkflowInstance: boolean, defaultTabExecute: (cpt: DataxWorkerRunningComponent) => void }
}

export class DataXJobWorkerStatus extends K8SControllerStatus {
  processMeta: ProcessMeta;
}

export class DataxWorkerDTO {
  primaryRCSpec: K8SRCSpec;
  powderJobWorkerRCSpec: K8SRCSpec;
  processMeta: ProcessMeta;


  powderJobServerHetero: HeteroList[] = [];
  powderJobUseExistClusterHetero: HeteroList[] = [];
  powderJobWorkerHetero: HeteroList[] = [];
  powderjobJobTplHetero: HeteroList[] = [];

  usingPowderJobUseExistCluster = false;


  flinkClusterHetero: HeteroList[] = [];

  public get step1Hetero(): HeteroList[] {
    return this.processMeta.step1HeteroGetter(this);
  }


  public get containPowerJob(): boolean {
    return this.powderJobServerHetero.length > 0 && this.powderJobWorkerHetero.length > 0 && this.powderjobJobTplHetero.length > 0;
  }
}

export interface PowerJobWorkflow {
  wfName: string;
  id: number;
  cronInfo: string;
  enable: true,
  gmtCreate: number;//1699937621000,
  gmtModified: number,
  // "id":16,
  // "maxWfInstanceNum":1,
  // "timeExpression":"0 0 12 * * ?",
  // "timeExpressionType":"CRON",
}
