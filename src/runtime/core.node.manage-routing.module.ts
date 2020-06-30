import {Injectable, NgModule} from '@angular/core';
import {CorenodemanageComponent} from './corenodemanage.component';

import {ActivatedRoute, ActivatedRouteSnapshot, CanActivateChild, Router, RouterModule, RouterStateSnapshot, Routes, UrlTree} from '@angular/router';
import {SnapshotsetComponent} from '../index/snapshotset.component';
import {CorenodemanageIndexComponent} from './core.node.manage.index.component';
import {IndexQueryComponent} from './index.query.component';
import {OperationLogComponent} from "../base/operation.log.component";
import {MonitorComponent} from "./monitor.component";
import {MembershipComponent} from "./membership.component";
import {CorePluginConfigComponent} from "./core.plugin.config.component";
import {IncrBuildComponent} from "./incr.build.component";
import {FullBuildHistoryComponent} from "../offline/full.build.history.component";
import {SchemaEditVisualizingModelComponent, SchemaXmlEditComponent} from "../corecfg/schema-xml-edit.component";
import {BuildProgressComponent} from "./core.build.progress.component";
import {Observable} from "rxjs";
import {TISService} from "../service/tis.service";
import {CurrentCollection} from "../common/basic.form.component";

@Injectable()
class CanActivateCollectionManage implements CanActivateChild {
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
    this.tisService.currentApp = new CurrentCollection(0, collectionName);
    // return this.permissions.canActivate(this.currentUser, route.params.id);
    return this.tisService.httpPost('/coredefine/coredefine.ajax'
      , 'action=core_action&emethod=get_index_exist')
      .then((r) => {
        let canActive: boolean = r.bizresult;
        if (!canActive) {
          // this.router.navigate(["/base/appadd"], {queryParams: {step: 2}, relativeTo: this.route});
          return this.router.parseUrl('/base/appadd?step=2');
        }
        return true;
      });
  }
}

const coreNodeRoutes: Routes = [
  {
    path: '', component: CorenodemanageIndexComponent,
    children: [
      {
        path: '',
        canActivateChild: [CanActivateCollectionManage],
        children: [
          {   // Schema 配置文件一览
            path: 'snapshotset',
            component: SnapshotsetComponent,
          },
          { // restype: xml | config
            path: 'xml_conf/:restype/:snapshotid',
            component: SchemaXmlEditComponent
          },
          {
            path: 'schema_visual/:snapshotid',
            component: SchemaEditVisualizingModelComponent
          },
          {   // Schema 配置文件一览
            path: 'build_history/:wfid',
            component: FullBuildHistoryComponent
          },
          {
            path: 'build_history/:wfid/:taskid',
            component: BuildProgressComponent
          },
          {   // 插件配置
            path: 'plugin',
            component: CorePluginConfigComponent
          },
          {   // Schema 配置文件一览
            path: 'query',
            component: IndexQueryComponent
          },
          {   // Schema 配置文件一览
            path: 'incr_build',
            component: IncrBuildComponent
          },
          {
            path: 'monitor',
            component: MonitorComponent
          },
          {
            path: 'membership',
            component: MembershipComponent
          },
          {
            path: 'operationlog',
            component: OperationLogComponent
          }
          ,
          {
            path: '',
            component: CorenodemanageComponent
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
  declarations: [], exports: [
    RouterModule
  ],
  providers: [CanActivateCollectionManage]
})
export class CoreNodeRoutingModule {

}




