import {NgModule, OnInit} from '@angular/core';
import {CorenodemanageComponent} from './corenodemanage.component';
// import {LocalStorageService} from 'angular-2-local-storage';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {TriggerDumpComponent} from './trigger_dump.component';


// import {SolrCfgEditComponent} from '../corecfg/solrcfg.edit.component';

import {CoreNodeRoutingModule} from './core.node.manage-routing.module';

import {CommonModule} from '@angular/common';
import {CorenodemanageIndexComponent} from './core.node.manage.index.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {IndexQueryComponent, QueryResultRowContentComponent} from './index.query.component';
import {PojoComponent} from './pojo.component';
import {CopyOtherCoreComponent} from './copy.other.core.component';
// import {SnapshotChangeLogComponent} from './snapshot.change.log';
// import {SnapshotLinkComponent} from '../corecfg/snapshot.link';
import {SyncConfigComponent} from './sync.cfg.component';
import {TISService} from '../service/tis.service';

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
// import {AddAppFlowDirective} from "../base/addapp.directive";
import {NgTerminalModule} from 'ng-terminal';
// import {IncrBuildStep1ParamsSetComponent, ItemPropValComponent} from "./incr.build.step1_1_params_set.component";
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {ChartsModule} from 'ng2-charts';

import {NzDropDownModule} from 'ng-zorro-antd/dropdown';
import {IncrPodLogsStatusComponent} from "./incr.pod.logs.status.component";
import {NzDividerModule} from 'ng-zorro-antd/divider';
import {NzIconModule, NZ_ICON_DEFAULT_TWOTONE_COLOR, NZ_ICONS} from 'ng-zorro-antd/icon';
import {NzTableModule} from 'ng-zorro-antd/table';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzPopoverModule} from 'ng-zorro-antd/popover';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {IncrBuildStep4RunningTabBaseComponent} from "./incr.build.step4.running.tab-base.component";

// import {FullBuildHistoryComponent} from "../offline/full.build.history.component";
// import { NzStepsModule } from 'ng-zorro-antd/steps';

// import {AccountBookFill, AlertFill, AlertOutline, CloseSquareFill} from '@ant-design/icons-angular/icons';
// import {IconDefinition} from '@ant-design/icons-angular';
// import {HttpClientJsonpModule} from "@angular/common/http";

// const icons: IconDefinition[] = [AccountBookFill, AlertOutline, AlertFill, CloseSquareFill];

@NgModule({
  id: 'coremanage',
  imports: [CommonModule, CoreNodeRoutingModule, FormsModule, NgbModule, TisCommonModule, NzLayoutModule, NzCollapseModule
    , NzStepsModule, NzButtonModule, NzTabsModule, NgTerminalModule, NzFormModule, NzInputModule, ReactiveFormsModule, NzSelectModule, NzInputNumberModule
    , ChartsModule, NzDropDownModule, NzDividerModule, NzIconModule, NzTableModule, NzTagModule, NzPopoverModule, NzCheckboxModule
  ],
  declarations: [
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
