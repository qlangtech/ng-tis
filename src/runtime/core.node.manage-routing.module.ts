import {NgModule} from '@angular/core';
import {CorenodemanageComponent} from './corenodemanage.component';

import {RouterModule, Routes} from '@angular/router';
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

const coreNodeRoutes: Routes = [
  {
    path: '', component: CorenodemanageIndexComponent,
    children: [
      {
        path: '',
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
  ]
})
export class CoreNodeRoutingModule {

}



