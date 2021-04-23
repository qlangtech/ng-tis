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
import {FormsModule} from '@angular/forms';
import {UserRoutingModule} from './user-routing.module';
import {UserListComponent} from './user.list.component';

import {UserAddComponent} from './user.add.component';
import {UserIndexComponent} from './user.index.component';
import {CommonModule} from '@angular/common';
import {TisCommonModule} from '../common/common.module';



@NgModule({
  id: 'usermanage',
  imports: [CommonModule, FormsModule,  UserRoutingModule, TisCommonModule],
  declarations: [UserIndexComponent, UserListComponent, UserAddComponent
  ],
  entryComponents: [UserIndexComponent, UserListComponent, UserAddComponent,
    // pagination
    // TisColumn, PaginationComponent
  ]
})
export class UserModule {
}
