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

import {NgModule} from '@angular/core';

import {BaseMangeIndexComponent} from './base.manage.index.component';

import {RouterModule, Routes} from '@angular/router';
import {DepartmentListComponent} from './department.list.component';
import {ApplistComponent} from './applist.component';
import {OperationLogComponent} from '../common/operation.log.component';
import {AddAppStepFlowComponent} from './addapp.step.flow.component';
import {BaseConfigComponent} from "./base-config.component";
// import {SnapshotsetComponent} from "../common/snapshotset.component";
import {SchemaEditVisualizingModelComponent, SchemaXmlEditComponent} from "../corecfg/schema-xml-edit.component";
import {DataxAddComponent} from "./datax.add.component";
import {DataxWorkerComponent} from "./datax.worker.component";
import {Breadcrumb, DataxWorkerDTO, ProcessMeta} from "../runtime/misc/RCDeployment";
import {PluginManageComponent} from "./plugin.manage.component";
import {StepType} from "../common/steps.component";
import {ErrorListComponent} from "./error.list.component";
import {Descriptor, EXTRA_PARAM_DATAX_NAME, ItemPropVal, PluginMeta, SavePluginEvent} from "../common/tis.plugin";
import {DataxWorkerAddStep0Component} from "./datax.worker.add.step0.component";
import {FlinkClusterListComponent} from "./flink.cluster.list.component";
import {DataxWorkerAddStep3Component} from "./datax.worker.add.step3.component";
import {DataxWorkerRunningComponent} from "./datax.worker.running.component";
import {EndCptListComponent} from "./end.cpt.list.component";
import {UserProfileComponent} from "./user.profile.component";

const get_job_worker_meta = "get_job_worker_meta";

export enum PowerjobCptType {
  Server = ("powerjob-server"),
  Worker = ("powerjob-worker"),
  JobTpl = ("powerjob-job-tpl"),
  UsingExistCluster = ("powerjob-use-exist-cluster"),
  // applicationAware
  JobTplAppOverwrite = ("powerjob-job-tpl-app-overwrite"),
  FlinkCluster = ("flink-cluster"),
  FlinkKubernetesApplicationCfg = ("flink-kubernetes-application-cfg")
}

const flinkClusterCfgTargetName = () => PowerjobCptType.FlinkCluster.toString();// "flink-cluster";
const dataXWorkerCfgTargetName = "datax-worker";

const KEY_TARGET_NAME = 'targetName';

export const dataXWorkerCfg: { processMeta: ProcessMeta }
  = {

  processMeta: {
    endType: 'powerjob',
    step1PluginType: {
      name: 'datax-worker',
      require: true,
      extraParam: EXTRA_PARAM_DATAX_NAME + PowerjobCptType.Server
    },
    afterSuccessDelete: (cpt: DataxWorkerRunningComponent) => {
      cpt.nextStep.emit(Object.assign(new DataxWorkerDTO(), {processMeta: cpt.dto.processMeta}));
    },
    successCreateNext: (step3: DataxWorkerAddStep3Component) => {
      DataxWorkerComponent.getJobWorkerMeta(step3, null, step3.dto.processMeta)
        .then((dataXWorkerStatus) => {
          step3.nextStep.emit(dataXWorkerStatus);
        });
    },
    targetNameGetter: (params) => {
      // @ts-ignore
      return dataXWorkerCfgTargetName;
    },
    runningTabRouterGetter: (params) => {
      return [dataXWorkerCfgTargetName];
    },
    init_get_job_worker_meta: get_job_worker_meta,
    runningStepCfg: {
      showPowerJobWorkflowInstance: true,
      defaultTabExecute: (cpt) => {
        cpt.gotoPage(cpt.pager.curPage)
      }
    },
    step1CreateSaveEvent: (step1) => {
      let e = new SavePluginEvent(true);
      e.serverForward = "coredefine:datax_action:save_datax_worker";
      e.postPayload = {"k8sSpec": step1.dto.primaryRCSpec};
      return e;
    },
    relaunchClusterMethod: "relaunch_datax_worker",
    launchClusterMethod: "launch_datax_worker",
    targetName: dataXWorkerCfgTargetName
    , pageHeader: "PowerJob分布式执行器"
    , notCreateTips: "还未创建PowerJob执行器，创建之后可以将DataX构建任务提交到K8S PowerJob集群，高效并行执行分布式数据同步任务"
    //, createButtonLabel: "创建PowerJob执行器"
    , stepsType: StepType.CreateWorkderOfDataX
    , supportK8SReplicsSpecSetter: true,
    step1Buttons: [
      {
        label: '创建PowerJob执行器', click: (step1) => {
          if (!step1.dto.hasSetHetero) {
            step1.openPowerJobRelevantPlugin();
            return;
          }
          step1.onClick();
        }
      },
      {
        label: '接入已有PowerJob集群', click: (step1) => {
          if (!step1.dto.hasSetHetero) {
            step1.openPowerJobRelevantPlugin();
            return;
          }
          step1.onClickAddExistPowerjobCluster();
        }
      }
    ]
    , step0InitDescriptorProcess: (cpt: DataxWorkerAddStep0Component, desc: Array<Descriptor>) => {
      // console.log(desc);
      cpt.initPowerJobRelevantProperties(desc);
    }
    , step1HeteroGetter: (dto: DataxWorkerDTO) => {
      return dto.powderJobServerHetero;
    }
    , confirmStepCpts: [
      {

        heteroPluginTypeGetter: (dto) => {
          return {name: dataXWorkerCfgTargetName, require: true, extraParam: 'dataxName_' + PowerjobCptType.Server}
        },
        cptType: PowerjobCptType.Server,
        cptShow: (dto: DataxWorkerDTO) => true,
        cpuMemorySpecGetter: (dto: DataxWorkerDTO) => {
          if (dto.usingPowderJobUseExistCluster) {
            return null;
          }
          return dto.powderJobWorkerRCSpec;
        }
      }
      , {
        heteroPluginTypeGetter: (dto) => {
          return {name: dataXWorkerCfgTargetName, require: true, extraParam: 'dataxName_' + PowerjobCptType.Worker}
        },
        cptType: PowerjobCptType.Worker,
        cptShow: (dto: DataxWorkerDTO) => !dto.usingPowderJobUseExistCluster,
        cpuMemorySpecGetter: (dto: DataxWorkerDTO) => dto.powderJobWorkerRCSpec
      }
      , {
        heteroPluginTypeGetter: (dto) => {
          return {name: dataXWorkerCfgTargetName, require: true, extraParam: 'dataxName_' + PowerjobCptType.JobTpl}
        },
        cptType: PowerjobCptType.JobTpl,
        cptShow: (dto: DataxWorkerDTO) => true,
        cpuMemorySpecGetter: (dto: DataxWorkerDTO) => null
      }
    ]
  }
};

const step1FlinkCreateSaveEvent = new SavePluginEvent(true);

const flinkClusterHeteroPkGetter: (dto: DataxWorkerDTO) => ItemPropVal = (dto: DataxWorkerDTO) => {
  if (dto && dto.flinkClusterHetero) {
    for (let i = 0; i < dto.flinkClusterHetero.length; i++) {
      let hlist = dto.flinkClusterHetero[i];
      for (let j = 0; j < hlist.items.length; j++) {
        let item = hlist.items[j];
        let pk = item.pk;
        if (pk) {
          return pk;
        }
      }
    }
  }
  return null;
}
const FlinkSessionPageHeader = "添加Kubernetes Session执行器";
// @ts-ignore
export const flinkClusterCfg: { processMeta: ProcessMeta }
  = {
  processMeta: {
    endType: 'flink',
    step1PluginType: {
      name: PowerjobCptType.FlinkCluster,
      require: true,
      extraParam: EXTRA_PARAM_DATAX_NAME + PowerjobCptType.FlinkCluster
    },
    afterSuccessDelete: (cpt: DataxWorkerRunningComponent) => {
      cpt.nextStep.emit(Object.assign(new DataxWorkerDTO(), {processMeta: cpt.dto.processMeta}));
    },
    breadcrumbGetter: (params) => {
      let crumb: Breadcrumb = flinkSessionDetail.processMeta.breadcrumbGetter(params);
      return {
        breadcrumb: crumb.breadcrumb,
        name: FlinkSessionPageHeader
      }
    },
    successCreateNext: (step3: DataxWorkerAddStep3Component) => {
      // DataxWorkerComponent.getJobWorkerMeta(this, null, step3.dto.processMeta)
      //   .then((dataXWorkerStatus) => {
      //     step3.nextStep.emit(dataXWorkerStatus);
      //   });
      let itemPkVal = flinkClusterHeteroPkGetter(step3.dto);
      step3.router.navigate(["/base", "flink-session-detail", itemPkVal.primary], {relativeTo: step3.route});
    },
    targetNameGetter: (params, justGroup: boolean, dto: DataxWorkerDTO) => {
      // @ts-ignore

      let itemPkVal = flinkClusterHeteroPkGetter(dto);
      if (itemPkVal) {
        return flinkClusterCfgTargetName() + "/" + itemPkVal.primary;
      }
      return flinkClusterCfgTargetName() + (justGroup ? '' : '/dummpnameX');
    },
    runningTabRouterGetter: (params) => {
      return [flinkClusterCfgTargetName()];
    },
    init_get_job_worker_meta: get_job_worker_meta,
    runningStepCfg: {
      showPowerJobWorkflowInstance: false,
      defaultTabExecute: (cpt) => {
      }
    },
    step1CreateSaveEvent: (step1) => {
      return step1FlinkCreateSaveEvent;
    },
    launchClusterMethod: "Launch_flink_cluster",
    relaunchClusterMethod: "relaunch_flink_cluster",
    targetName: flinkClusterCfgTargetName()
    , pageHeader: FlinkSessionPageHeader
    // , createButtonLabel: "创建Flink Native Cluster执行器"
    , notCreateTips: "还未创建Flink Kubernetes Session执行器，创建之后可以将Flink Job提交到Kubernetes Session集群，高效并行执行数据实时同步任务"
    , stepsType: StepType.CreateFlinkCluster
    , supportK8SReplicsSpecSetter: false
    , step1Buttons: [
      {
        label: '创建执行器', click: (step1) => {

          if (!step1.dto.hasSetHetero) {
            step1.openFlinkClusterRelevantPlugin();
            return;
          }

          step1.onClick();
        }
      }
    ]
    , step0InitDescriptorProcess: (cpt: DataxWorkerAddStep0Component, desc: Array<Descriptor>) => {
      cpt.initFlinkClusterRelevantProperties(desc);
    }
    , step1HeteroGetter: (dto: DataxWorkerDTO) => {
      return dto.flinkClusterHetero;
    }
    , confirmStepCpts: [
      {
        heteroPluginTypeGetter: (dto) => {

          let itemPkVal = flinkClusterHeteroPkGetter(dto);
          if (itemPkVal == null) {
            throw new Error("itemPkVal can not be null");
          }
          return <PluginMeta>{
            name: flinkClusterCfgTargetName(),
            require: true,
            extraParam: 'dataxName_' + itemPkVal.primary
          };

        },
        // hetero: flinkClusterCfgTargetName,
        cptType: PowerjobCptType.FlinkCluster,
        cptShow: (dto: DataxWorkerDTO) => true,
        cpuMemorySpecGetter: (dto: DataxWorkerDTO) => {
          return null;
        }
      }
    ]
  }
};

const get_flink_session = 'get_flink_session';
// @ts-ignore
export const flinkSessionDetail: { processMeta: ProcessMeta }
  = {
  processMeta: {
    endType: 'flink',
    step1PluginType: null,
    breadcrumbGetter: (params) => {
      return {
        breadcrumb: ['Flink Cluster', '/base/flink-cluster-list'],
        name: params[KEY_TARGET_NAME]
      }
    },
    afterSuccessDelete: (cpt: DataxWorkerRunningComponent) => {
      // cpt.nextStep.emit(Object.assign(new DataxWorkerDTO(), {processMeta: cpt.dto.processMeta}));
      cpt.router.navigate(["/base/flink-cluster-list"]);
    },
    successCreateNext: (step3: DataxWorkerAddStep3Component) => {
      throw  new Error("shall not execute");
    },
    targetNameGetter: (params) => {
      // @ts-ignore
      return flinkClusterCfgTargetName() + "/" + params[KEY_TARGET_NAME];
    },
    init_get_job_worker_meta: get_flink_session,
    runningTabRouterGetter: (params) => {
      return ['flink-session-detail', params[KEY_TARGET_NAME]];
    },
    runningStepCfg: {
      showPowerJobWorkflowInstance: false,
      defaultTabExecute: (cpt) => {
      }
    },
    step1CreateSaveEvent: (step1) => {
      throw new Error();
    },
    launchClusterMethod: null,
    relaunchClusterMethod: "relaunch_flink_cluster",
    targetName: "flink-session-detail"
    , pageHeader: "Flink Native Cluster执行器"
    // , createButtonLabel: "创建Flink Native Cluster执行器"
    , notCreateTips: null
    , stepsType: StepType.CreateFlinkCluster
    , supportK8SReplicsSpecSetter: false
    , step1Buttons: []
    , step0InitDescriptorProcess: (cpt: DataxWorkerAddStep0Component, desc: Array<Descriptor>) => {
      // cpt.initFlinkClusterRelevantProperties(desc);
    }
    , step1HeteroGetter: (dto: DataxWorkerDTO) => {
      // return dto.flinkClusterHetero;
      throw new Error();
    }
    , confirmStepCpts: [
      {

        //  hetero: flinkClusterCfgTargetName,
        heteroPluginTypeGetter: (dto, params) => {
          // console.log(params);
          // let itemPkVal = flinkClusterHeteroPkGetter(dto);
          // if (itemPkVal == null) {
          //   throw new Error("itemPkVal can not be null");
          // }
          return <PluginMeta>{
            name: flinkClusterCfgTargetName(),
            require: true,
            extraParam: 'dataxName_' + params[KEY_TARGET_NAME]
          };
        },
        cptType: PowerjobCptType.FlinkCluster,
        cptShow: (dto: DataxWorkerDTO) => true,
        cpuMemorySpecGetter: (dto: DataxWorkerDTO) => {
          return null;
        }
      }
    ]
  }
};

const basemanageRoutes: Routes = [
  {
    path: '', component: BaseMangeIndexComponent,
    children: [
      {
        path: '',
        children: [
          {
            path: 'applist',
            component: ApplistComponent
          },
          {
            path: "cpt-list",
            component: EndCptListComponent
          },
          {
            path: 'basecfg',
            children: [
              {
                path: '',
                component: BaseConfigComponent
              },
              {
                path: ':tab',
                component: BaseConfigComponent
              }
            ]
          },
          {
            path: 'plugin-manage',
            children: [
              {
                path: '',
                component: PluginManageComponent
              },
              {
                path: ':tab',
                component: PluginManageComponent
              }
            ]
          }
          ,
          {   // 添加索引
            path: 'appadd',
            component: AddAppStepFlowComponent
          },
          // {   // 配置模版一览
          //   path: 'tpl/snapshotset',
          //   component: SnapshotsetComponent,
          //   data: {
          //     showBreadcrumb: true,
          //     template: true
          //   }
          // },
          {
            path: 'tpl/xml_conf/:restype/:snapshotid',
            component: SchemaXmlEditComponent
          },
          {
            path: 'tpl/schema_visual/:snapshotid',
            component: SchemaEditVisualizingModelComponent
          },
          {
            path: 'departmentlist',
            component: DepartmentListComponent
          },
          {
            path: 'user-profile',
            component: UserProfileComponent
          },
          {
            path: 'operationlog',
            component: OperationLogComponent,
            data: {showBreadcrumb: true}
          },
          {
            path: "sys-errors",
            component: ErrorListComponent,
            data: {showBreadcrumb: true}
          },
          {
            path: '',
            component: ApplistComponent
          },
          {
            path: 'dataxadd',
            component: DataxAddComponent
          },
          {
            path: dataXWorkerCfg.processMeta.targetName,
            component: DataxWorkerComponent,
            data: dataXWorkerCfg
          },
          {
            path: flinkClusterCfg.processMeta.targetName,
            component: DataxWorkerComponent,
            data: flinkClusterCfg
          },
          {
            path: flinkClusterCfg.processMeta.targetName + "-list",
            component: FlinkClusterListComponent,
            data: flinkClusterCfg
          },
          {
            path: "flink-session-detail/:targetName/:targetTab",
            component: DataxWorkerComponent,
            data: flinkSessionDetail
          },
          {
            path: "flink-session-detail/:targetName",
            component: DataxWorkerComponent,
            data: flinkSessionDetail
          },
          {
            path: flinkClusterCfg.processMeta.targetName + '/:targetTab',
            component: DataxWorkerComponent,
            data: flinkClusterCfg
          },
          {
            path: dataXWorkerCfg.processMeta.targetName + '/:targetTab',
            component: DataxWorkerComponent,
            data: dataXWorkerCfg
          }
        ]
      },

    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(basemanageRoutes)
  ],
  declarations: [], exports: [
    RouterModule
  ]
})
export class BaseMangeRoutingModule {
}
