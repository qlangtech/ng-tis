import {NgModule} from '@angular/core';
import {OffileIndexComponent} from './offline.index.component';
import {DatasourceComponent} from './ds.component';
import {WorkflowComponent} from './workflow.component';
import {RouterModule, Routes} from '@angular/router';
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
