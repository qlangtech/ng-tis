import {NgModule} from '@angular/core';
import {UserIndexComponent} from './user.index.component';

import {RouterModule, Routes} from '@angular/router';
import {UserListComponent} from './user.list.component';


const userRoutes: Routes = [
  {
    path: '', component: UserIndexComponent,
    children: [
      {
        path: '',
        children: [
          {
            path: 'users',
            component: UserListComponent
          }
         ,
          {
            path: '',
            component: UserListComponent
          }
        ]
      }
    ]
  },

];

@NgModule({
  imports: [
    RouterModule.forChild(userRoutes)
  ],
  declarations: [
  ], exports: [
    RouterModule
  ]
})
export class UserRoutingModule {
}
