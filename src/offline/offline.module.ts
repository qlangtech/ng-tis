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

import {NgModule} from "@angular/core";

import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {DatasourceComponent} from "./ds.component";
import {WorkflowComponent} from "./workflow.component";
import {OfflineRoutingModule} from "./offline-routing.module";
import {OffileIndexComponent} from "./offline.index.component";
import {DbAddComponent} from "./db.add.component";
import {TableAddComponent} from "./table.add.component";
import {TableAddStep1Component} from "./table.add.step1.component";
import {WorkflowAddComponent} from "./workflow.add.component";
import {NzTabsModule} from 'ng-zorro-antd/tabs';

import {NzGridModule} from 'ng-zorro-antd/grid';
import {NzTableModule} from 'ng-zorro-antd/table';
import {TisCommonModule} from "../common/common.module";
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzCascaderModule} from 'ng-zorro-antd/cascader';


import {WorkflowAddDbtableSetterComponent} from "./workflow.add.dbtable.setter.component";
import {BasiManageModule} from "../base/base.manage.module";
import {NzSelectModule} from 'ng-zorro-antd/select';
import {WorkflowAddJoinComponent} from "./workflow.add.join.component";
import {WorkflowAddUnionComponent} from "./workflow.add.union.component";
import {WorkflowAddNestComponent} from "./workflow.add.nest.component";
import {NzTreeModule} from 'ng-zorro-antd/tree';
import {NzLayoutModule} from 'ng-zorro-antd/layout';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzDescriptionsModule} from 'ng-zorro-antd/descriptions';
import {NzNotificationModule} from 'ng-zorro-antd/notification';
import {NzDividerModule} from 'ng-zorro-antd/divider';

import {NzCollapseModule} from 'ng-zorro-antd/collapse';
import {NzSwitchModule} from 'ng-zorro-antd/switch';
import {NzAlertModule} from 'ng-zorro-antd/alert';
import {NzListModule} from 'ng-zorro-antd/list';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzToolTipModule} from 'ng-zorro-antd/tooltip';
import {NzTypographyModule} from 'ng-zorro-antd/typography';
import {NzPageHeaderModule} from 'ng-zorro-antd/page-header';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzDrawerModule} from 'ng-zorro-antd/drawer';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzPopconfirmModule} from 'ng-zorro-antd/popconfirm';
import {WorkflowERComponent} from "./workflow.er.component";
import {WorkflowAddErCardinalityComponent} from "./workflow.add.er.cardinality.component";
import {WorkflowAddErMetaComponent} from "./workflow.add.er.meta.component";
import {WFControllerComponent} from "./workflow.controller.component";
import {WorkflowOfflineEngineSelectComponent} from "./workflow.offline.engine.select.component";
import {TableColsMetaComponent} from "./table.cols.meta.component";
import {WorkflowScheduleConfigComponent} from "./workflow.schedule.config.component";
import {WorkflowDAGMonitorComponent} from "./workflow.dag.monitor.component";



@NgModule({
  id: 'offline',
  imports: [ // CommonModule,
    NzCollapseModule,
    NzTabsModule,
    NzInputModule, NzTableModule,
    FormsModule, BasiManageModule, NzTreeModule, NzLayoutModule, NzDescriptionsModule
    , OfflineRoutingModule, // TreeModule,
    TisCommonModule, NzButtonModule, NzCascaderModule
    , CommonModule, NzSelectModule, ReactiveFormsModule, NzNotificationModule
    , NzDividerModule, NzGridModule, NzSwitchModule, NzAlertModule, NzListModule, NzSpaceModule
    , NzToolTipModule, NzTypographyModule, NzPageHeaderModule, NzSpinModule, NzIconModule
    , NzDrawerModule, NzCardModule, NzTagModule, NzPopconfirmModule
  ],
  providers: [
  ],
  declarations: [
    WorkflowComponent, WorkflowOfflineEngineSelectComponent, WFControllerComponent, DatasourceComponent ,OffileIndexComponent, DbAddComponent, WorkflowAddErMetaComponent
    , TableColsMetaComponent, TableAddComponent, TableAddStep1Component, // TableAddStep2Component,
    WorkflowAddComponent,
    WorkflowAddDbtableSetterComponent, WorkflowAddJoinComponent, WorkflowAddUnionComponent
    // tslint:disable-next-line:whitespace
    , WorkflowAddNestComponent, WorkflowERComponent, WorkflowAddErCardinalityComponent, WorkflowScheduleConfigComponent, WorkflowDAGMonitorComponent
  ]
})
export class OfflineModule {
}
