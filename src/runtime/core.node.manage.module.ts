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
import {CorenodemanageComponent} from './corenodemanage.component';
import {TriggerDumpComponent} from './trigger_dump.component';
import {CoreNodeRoutingModule} from './core.node.manage-routing.module';

import {CommonModule} from '@angular/common';
import {CorenodemanageIndexComponent} from './core.node.manage.index.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {IndexQueryComponent, QueryResultRowContentComponent} from './index.query.component';
import {PojoComponent} from './pojo.component';
import {CopyOtherCoreComponent} from './copy.other.core.component';
import {SyncConfigComponent} from './sync.cfg.component';
import {TisCommonModule} from "../common/common.module";
import {MembershipComponent} from "./membership.component";
import {MonitorComponent} from "./monitor.component";
import {CorePluginConfigComponent} from "./core.plugin.config.component";
import {NzLayoutModule} from 'ng-zorro-antd/layout';
import {NzCollapseModule} from 'ng-zorro-antd/collapse';
import {IncrBuildComponent} from "./incr.build.component";

import {NzStepsModule} from 'ng-zorro-antd/steps';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {IncrBuildStep0Component} from "./incr.build.step0.component";
import {IncrBuildStep2Component} from "./incr.build.step2.component";
import {IncrBuildStep3Component} from "./incr.build.step3.component";
import {IncrBuildStep1Component} from "./incr.build.step1.component";
import {IncrBuildStep4RunningComponent} from "./incr.build.step4.running.component";
import {NgTerminalModule} from 'ng-terminal';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {ChartsModule} from 'ng2-charts';

// import {NzDropDownModule} from 'ng-zorro-antd/dropdown';
import {IncrPodLogsStatusComponent} from "./incr.pod.logs.status.component";
import {NzDividerModule} from 'ng-zorro-antd/divider';
import {NzIconModule, NZ_ICON_DEFAULT_TWOTONE_COLOR, NZ_ICONS} from 'ng-zorro-antd/icon';
import {NzTableModule} from 'ng-zorro-antd/table';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzPopoverModule} from 'ng-zorro-antd/popover';
// import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {IncrBuildStep4RunningTabBaseComponent} from "./incr.build.step4.running.tab-base.component";
import {LineChartComponent} from "./line.chart.component";



@NgModule({
  id: 'coremanage',
  imports: [CommonModule, CoreNodeRoutingModule, FormsModule, TisCommonModule, NzLayoutModule, NzCollapseModule
    , NzStepsModule, NzButtonModule, NzTabsModule, NgTerminalModule, NzFormModule, NzInputModule, ReactiveFormsModule, NzSelectModule, NzInputNumberModule
    , ChartsModule, NzDividerModule, NzIconModule, NzTableModule, NzTagModule, NzPopoverModule
  ],
  declarations: [LineChartComponent,
    TriggerDumpComponent, CorePluginConfigComponent, QueryResultRowContentComponent, IncrBuildStep4RunningTabBaseComponent,
    IndexQueryComponent, PojoComponent,
    CorenodemanageComponent, CorenodemanageIndexComponent,
    CopyOtherCoreComponent
    , SyncConfigComponent
    , MembershipComponent, MonitorComponent, IncrBuildComponent, IncrBuildStep0Component
    , IncrBuildStep1Component, IncrBuildStep2Component, IncrBuildStep3Component, IncrBuildStep4RunningComponent
    , IncrPodLogsStatusComponent
  ],
  providers: [
    // {provide: NZ_ICON_DEFAULT_TWOTONE_COLOR, useValue: '#00ff00'}, // 不提供的话，即为 Ant Design 的主题蓝色
    // {provide: NZ_ICONS, useValue: icons}
  ],
  entryComponents: [TriggerDumpComponent, PojoComponent,
    SyncConfigComponent,
    CopyOtherCoreComponent
    , MonitorComponent, MembershipComponent, IncrBuildStep0Component, IncrBuildStep1Component, IncrBuildStep2Component, IncrBuildStep3Component, IncrBuildStep4RunningComponent]
})
export class CoreNodeManageModule implements OnInit {
  ngOnInit(): void {

  }
}
