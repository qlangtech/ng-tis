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

import {NgModule} from '@angular/core';

import {BaseMangeIndexComponent} from './base.manage.index.component';

import {Routes, RouterModule} from '@angular/router';
import {DepartmentListComponent} from './department.list.component';
import {ApplistComponent} from './applist.component';
import {OperationLogComponent} from '../common/operation.log.component';
import {AddAppStepFlowComponent} from './addapp.step.flow.component';
import {BaseConfigComponent} from "./base-config.component";
import {SnapshotsetComponent} from "../common/snapshotset.component";
import {SchemaEditVisualizingModelComponent, SchemaXmlEditComponent} from "../corecfg/schema-xml-edit.component";
import {DataxAddComponent} from "./datax.add.component";
import {DataxWorkerComponent} from "./datax.worker.component";
import {PluginManageComponent} from "./plugin.manage.component";


const dataXWorkerCfg = {processMeta: {targetName: "datax-worker"}};
const flinkClusterCfg = {processMeta: {targetName: "flink-cluster"}};

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
          }
          ,
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
          {   // 配置模版一览
            path: 'tpl/snapshotset',
            component: SnapshotsetComponent,
            data: {
              showBreadcrumb: true,
              template: true
            }
          },
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
            path: 'operationlog',
            component: OperationLogComponent,
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
      }
    ]
  },

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
