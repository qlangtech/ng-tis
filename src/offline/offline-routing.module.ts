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
import {OffileIndexComponent} from './offline.index.component';
import {DatasourceComponent} from './ds.component';
import {WorkflowComponent} from './workflow.component';
import {RouterModule, Routes} from '@angular/router';
import {WorkflowAddComponent} from "./workflow.add.component";
import {BuildProgressComponent} from "../common/core.build.progress.component";
import {FullBuildHistoryComponent} from "../common/full.build.history.component";

const coreNodeRoutes: Routes = [
  {
    path: '', component: OffileIndexComponent,
    children: [
      {
        path: '',
        children: [
          {
            path: 'ds',
            component: DatasourceComponent,
          },
          {
            path: 'wf',
            component: WorkflowComponent
          },
          {
            path: 'wf/build_history/:wfid/:taskid',
            component: BuildProgressComponent,
            data: {showBreadcrumb: true}
          },
          {
            path: 'wf/build_history/:wfid',
            component: FullBuildHistoryComponent,
            data: {showBreadcrumb: true}
          },
          {
            path: 'wf_add',
            component: WorkflowAddComponent
          },
          {
            path: 'wf_update/:name',
            component: WorkflowAddComponent
          },
          {
            path: 'wf_update/:name/build_history/:wfid/:taskid',
            component: BuildProgressComponent,
            data: {showBreadcrumb: true}
          },
          {
            path: 'wf_update/:name/build_history/:wfid',
            component: FullBuildHistoryComponent,
            data: {showBreadcrumb: true}
          },
          {
            path: '',
            component: DatasourceComponent
          }
        ]
      }
    ]
  },

];

@NgModule({
  imports: [
    RouterModule.forChild(coreNodeRoutes)
  ],
  declarations: [],
  exports: [
    RouterModule
  ]
})
export class OfflineRoutingModule {
}
