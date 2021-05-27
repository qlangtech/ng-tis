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

import {NgModule, OnInit} from '@angular/core';

import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {NzLayoutModule} from 'ng-zorro-antd/layout';

import {NzCollapseModule} from 'ng-zorro-antd/collapse';

import {NzStepsModule} from 'ng-zorro-antd/steps';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NgTerminalModule} from 'ng-terminal';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {ChartsModule} from 'ng2-charts';

// import {NzDropDownModule} from 'ng-zorro-antd/dropdown';

import {NzDividerModule} from 'ng-zorro-antd/divider';
import {NzIconModule, NZ_ICON_DEFAULT_TWOTONE_COLOR, NZ_ICONS} from 'ng-zorro-antd/icon';
import {NzTableModule} from 'ng-zorro-antd/table';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzPopoverModule} from 'ng-zorro-antd/popover';
import {TisCommonModule} from "../common/common.module";
import {DataxRoutingModule} from "./datax-routing.module";
import {DataxIndexComponent} from "./datax.index.component";
import {DataxMainComponent} from "./datax.main.component";
import {DataxConfigComponent} from "./datax.config.component";
import {BasiManageModule} from "../base/base.manage.module";
 // import {DataxAddStep7Component} from "../base/datax.add.step7.confirm.component";

// import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';


@NgModule({
  id: 'datax',
  imports: [CommonModule, DataxRoutingModule, FormsModule, TisCommonModule, NzLayoutModule, NzCollapseModule
    , NzStepsModule, NzButtonModule, NzTabsModule, NgTerminalModule, NzFormModule, NzInputModule, ReactiveFormsModule, NzSelectModule, NzInputNumberModule
    , ChartsModule, NzDividerModule, NzIconModule, NzTableModule, NzTagModule, NzPopoverModule
  ],
  declarations: [DataxIndexComponent, DataxMainComponent, DataxConfigComponent ],
  providers: [
    // {provide: NZ_ICON_DEFAULT_TWOTONE_COLOR, useValue: '#00ff00'}, // 不提供的话，即为 Ant Design 的主题蓝色
    // {provide: NZ_ICONS, useValue: icons}
  ],
  entryComponents: []
})
export class DataxModule implements OnInit {
  ngOnInit(): void {

  }
}
