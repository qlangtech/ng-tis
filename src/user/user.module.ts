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
