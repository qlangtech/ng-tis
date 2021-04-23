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
