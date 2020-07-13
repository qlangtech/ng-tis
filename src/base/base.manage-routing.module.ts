import {NgModule} from '@angular/core';

// import {FormsModule} from '@angular/forms';
import {BaseMangeIndexComponent} from './base.manage.index.component';

import {Routes, RouterModule} from '@angular/router';
import {DepartmentListComponent} from './department.list.component';
import {ApplistComponent} from './applist.component';
import {OperationLogComponent} from './operation.log.component';
import {GlobalParamsComponent} from './global.params.component';
// import {AddAppFormComponent} from './addapp-form.component';
import {AddAppStepFlowComponent} from './addapp.step.flow.component';
import {BaseConfigComponent} from "./base-config.component";


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
            component: BaseConfigComponent
          }
          ,
          {   // 添加索引
            path: 'appadd',
            component: AddAppStepFlowComponent
          }
          ,
          {
            path: 'departmentlist',
            component: DepartmentListComponent
          },
          {
            path: 'globalparams',
            component: GlobalParamsComponent
          },
          {
            path: 'operationlog',
            component: OperationLogComponent,
            data: {showBreadcrumb: true}
          },
          {
            path: '',
            component: ApplistComponent
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
