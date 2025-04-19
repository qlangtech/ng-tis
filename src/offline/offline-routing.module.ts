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

import {Injectable, NgModule} from '@angular/core';
import {OffileIndexComponent} from './offline.index.component';
import {DatasourceComponent} from './ds.component';
import {WorkflowComponent} from './workflow.component';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  CanActivateChild,
  Router,
  RouterModule,
  RouterStateSnapshot,
  Routes, UrlTree
} from '@angular/router';
import {WorkflowAddComponent} from "./workflow.add.component";
import {BuildProgressComponent} from "../common/core.build.progress.component";
import {FullBuildHistoryComponent} from "../common/full.build.history.component";
// import {WorkspaceGuard} from "@zeppelin/pages/workspace/workspace.guard";
import {WFControllerComponent} from "./workflow.controller.component";
import {DataxConfigComponent} from "../datax/datax.config.component";
import {StepType} from "../common/steps.component";
import {DataxCanActivateCollectionManage} from "../datax/datax-routing.module";
import {TISService} from "../common/tis.service";
import {CurrentCollection} from "../common/basic.form.component";


@Injectable()
export class WorkflowCanActivateCollectionManage implements CanActivateChild {
  constructor(private tisService: TISService, private route: ActivatedRoute, private router: Router) {
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    // this.route.snapshot;
    let collectionName = route.params["name"];
    // console.log(`collection:${collectionName}`);
    if (!collectionName) {
      throw new Error("route param collectionName can not be null");
    }
    // console.log("======================");
    this.tisService.currentApp = new CurrentCollection(0, collectionName);
    // return this.permissions.canActivate(this.currentUser, route.params.id);
    return this.tisService.httpPost('/coredefine/coredefine.ajax'
      , 'action=core_action&emethod=get_index_exist')
      .then((r) => {
        let result: { indexExist: boolean, app: any } = r.bizresult;
        let canActive: boolean = result.indexExist;
        if (!canActive) {
          // this.router.navigate(["/base/appadd"], {queryParams: {step: 2}, relativeTo: this.route});
          return this.router.parseUrl(`/base/appadd?name=${collectionName}`);
        }
        this.tisService.currentApp.appTyp = result.app.appType;
        return true;
      });
  }
}

const coreNodeRoutes: Routes = [
  {
    path: '', component: OffileIndexComponent,
    children: [
      {
        path: '',
        // canActivateChild: [DataxCanActivateCollectionManage],
        children: [
          {
            path: 'ds',
            component: DatasourceComponent,
            //canActivate: [WorkspaceGuard],
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
            component: WFControllerComponent
          },
          {
            path: '',
          //  canActivateChild: [WorkflowCanActivateCollectionManage],
            children: [
              {
                path: 'wf_profile/:name/update',
                component: WFControllerComponent,
                data: {updateProfile: true}
              },
              {
                path: 'wf_update/:name',
                component: WorkflowAddComponent
              },
              {
                path: 'wf_profile/:name/config',
                component: DataxConfigComponent,
                data: {stepType: StepType.CreateWorkflow}
                // component: WFControllerComponent,
                // data: {updateProfile: true}
              },
              {
                path: 'wf_update/:name/build_history/:wfid/:taskid',
                component: BuildProgressComponent,
                data: {showBreadcrumb: true}
              },
              {
                path: 'wf_update/:name/build_history/:wfid',
                component: FullBuildHistoryComponent,
                data: {showBreadcrumb: true, showTriggerBtn: false}
              },
            ]
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
