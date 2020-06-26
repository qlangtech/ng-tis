import {NgModule} from '@angular/core';
import {OffileIndexComponent} from './offline.index.component';
import {DatasourceComponent} from './ds.component';
import {WorkflowComponent} from './workflow.component';
import {RouterModule, Routes} from '@angular/router';
import {DatasourceGitCommitsComponent} from './datasource.git.commits.component';
import {WorkflowGitCommitsComponent} from './workflow.git.commits.component';
// import {DbAddComponent} from './db.add.component';
// import {TableAddComponent} from './table.add.component';
import {WorkflowChangeListComponent} from './workflow.change.list.component';
import {WorkflowAddComponent} from "./workflow.add.component";
import {BuildProgressComponent} from "../runtime/core.build.progress.component";
import {FullBuildHistoryComponent} from "./full.build.history.component";
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
            component: BuildProgressComponent
          },
          {
            path: 'wf/build_history/:wfid',
            component: FullBuildHistoryComponent
          },
          {
            path: 'wf_add' ,
            component:  WorkflowAddComponent
          },
          {
            path: 'wf_update/:name' ,
            component:  WorkflowAddComponent
          },
          {
            path: 'wf_change_list',
            component: WorkflowChangeListComponent
          },
          {
            path: '',
            component: DatasourceComponent
          },
          {
            path: 'datasourcecommits',
            component: DatasourceGitCommitsComponent,
          },
          {
            path: 'workflowcommits',
            component: WorkflowGitCommitsComponent,
          },
          // {
          //   path: 'db-add',
          //   component: DbAddComponent
          // },
          // {
          //   path: 'table-add',
          //   component: TableAddComponent
          // },
          // {
          //   path: 'db_edit',
          //   component: DbAddComponent
          // },
          // {
          //   path: 'table_edit',
          //   component: TableAddComponent
          // },
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
