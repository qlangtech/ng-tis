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

import {Injectable, NgModule} from '@angular/core';

import {ActivatedRoute, ActivatedRouteSnapshot, CanActivateChild, Router, RouterModule, RouterStateSnapshot, Routes, UrlTree} from '@angular/router';

import {OperationLogComponent} from "../base/operation.log.component";
import {FullBuildHistoryComponent} from "../offline/full.build.history.component";
import {TISService} from "../service/tis.service";
import {CurrentCollection} from "../common/basic.form.component";
import {DataxIndexComponent} from "./datax.index.component";
import {DataxMainComponent} from "./datax.main.component";
import {BuildProgressComponent} from "../runtime/core.build.progress.component";
import {MonitorComponent} from "../runtime/monitor.component";
import {DataxConfigComponent} from "./datax.config.component";
import {DataxAddComponent} from "../base/datax.add.component";

@Injectable()
export class DataxCanActivateCollectionManage implements CanActivateChild {
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

const dataxNodeRoutes: Routes = [
  {
    path: '', component: DataxIndexComponent,
    children: [
      {
        path: '',
        canActivateChild: [DataxCanActivateCollectionManage],
        children: [
          {   // Schema 配置文件一览
            path: 'app_build_history',
            component: FullBuildHistoryComponent,
            data: {datax: true}
          },
          {   // Schema 配置文件一览
            path: 'update',
            component: DataxAddComponent,
            data: {datax: true}
          },
          {
            path: 'app_build_history/:taskid',
            component: BuildProgressComponent,
            data: {datax: true}
          },
          {
            path: 'operationlog',
            component: OperationLogComponent
          },
          {
            path: 'config',
            component: DataxConfigComponent
          },
          {
            path: 'monitor',
            component: MonitorComponent
          }, {
            path: '',
            component: DataxMainComponent
          }
        ]
      }
    ]
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(dataxNodeRoutes)
  ],
  declarations: [], exports: [
    RouterModule
  ],
  providers: [DataxCanActivateCollectionManage]
})
export class DataxRoutingModule {

}




