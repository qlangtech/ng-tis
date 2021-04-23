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

import {NgModule} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
// import {HttpModule, JsonpModule} from "@angular/http";

import {TimeConsumePipe} from "../common/date.format.pipe";
import {ConsumeTimePipe} from "../common/consume.time.pipe";
import {PaginationComponent, TdContentDirective, ThDirective, TisColumn} from "../common/pagination.component";
import {CommonModule} from "@angular/common";
import {NavigateBarComponent} from "../runtime/navigate.bar.component";
import {RouterModule} from "@angular/router";
import {OperationLogComponent} from "../base/operation.log.component";
import {SafePipe} from "./safe.pipe";
import {PageHeaderComponent, PageHeaderLeftComponent, TisHeaderTool, TisHeaderToolContent} from "./pager.header.component";
import {TisMsgComponent} from "./msg.component";
import {FormComponent, InputContentDirective, TisInputProp, TisInputTool} from "./form.component";
import {CodemirrorComponent} from "./codemirror.component";
import {NzSelectModule} from 'ng-zorro-antd/select';
import {HttpClientJsonpModule, HttpClientModule} from '@angular/common/http';
import {LocalStorageModule} from 'angular-2-local-storage';
import {NzNotificationModule} from 'ng-zorro-antd/notification';
import {NZ_ICON_DEFAULT_TWOTONE_COLOR, NZ_ICONS, NzIconModule} from 'ng-zorro-antd/icon';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {ItemPropValComponent, PluginsComponent} from "./plugins.component";
import {NzCollapseModule} from 'ng-zorro-antd/collapse';
import {NzDropDownModule} from 'ng-zorro-antd/dropdown';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzStepsModule} from 'ng-zorro-antd/steps';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb';
import {TisBreadcrumbComponent} from "./breadcrumb.component";
import {FullBuildHistoryComponent} from "../offline/full.build.history.component";
import {TisStepsComponent} from "./steps.component";
import {NzTableModule} from 'ng-zorro-antd/table';
import {NzPopoverModule} from 'ng-zorro-antd/popover';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzDescriptionsModule} from 'ng-zorro-antd/descriptions';
import {NzBackTopModule} from 'ng-zorro-antd/back-top';
import {SchemaVisualizingEditComponent} from "../base/schema.expert.create.edit.component";
import {NzTransferModule} from 'ng-zorro-antd/transfer';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzAlertModule} from 'ng-zorro-antd/alert';
import {NzGridModule} from 'ng-zorro-antd/grid';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzMenuModule} from 'ng-zorro-antd/menu';
import {NzLayoutModule} from 'ng-zorro-antd/layout';
import {NzListModule} from 'ng-zorro-antd/list';
import {BuildProgressComponent, ProgressTitleComponent} from "../runtime/core.build.progress.component";
import {NgTerminalModule} from 'ng-terminal';
import {NzDrawerModule} from 'ng-zorro-antd/drawer';
import {
  ProgressComponent
} from "../runtime/core.build.progress.component";
import {NzToolTipModule} from 'ng-zorro-antd/tooltip';
import {NzAnchorModule} from 'ng-zorro-antd/anchor';
import {NzSwitchModule} from 'ng-zorro-antd/switch';
import {NzAffixModule} from 'ng-zorro-antd/affix';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {NzStatisticModule} from 'ng-zorro-antd/statistic';
import {SnapshotsetComponent} from "../index/snapshotset.component";
import {SnapshotLinkComponent} from "../corecfg/snapshot.link";
import {SnapshotChangeLogComponent} from "../runtime/snapshot.change.log";
import {SchemaXmlEditComponent, SchemaEditVisualizingModelComponent} from '../corecfg/schema-xml-edit.component';
import {CompareEachOtherComponent, CompareResultComponent} from '../corecfg/compare.eachother.component';
import {NzModalModule} from 'ng-zorro-antd/modal';
import {NzEmptyModule} from 'ng-zorro-antd/empty';
import {NzRadioModule} from 'ng-zorro-antd/radio';
import {NzBadgeModule} from 'ng-zorro-antd/badge';
import {NzDividerModule} from 'ng-zorro-antd/divider';
import {NzPageHeaderModule} from 'ng-zorro-antd/page-header';
import {NzResultModule} from 'ng-zorro-antd/result';
import {NzProgressModule} from 'ng-zorro-antd/progress';
import {InitSystemComponent} from "../common/init.system.component";
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {TableSelectComponent} from "./table.select.component";
import {NzCascaderModule} from 'ng-zorro-antd/cascader';
import {SideBarToolBar} from "./basic.form.component";

@NgModule({
  id: 'tiscommonModule',
  imports: [
    LocalStorageModule.forRoot({
      prefix: 'my-app',
      storageType: 'localStorage'
    }), NzProgressModule, NzSpaceModule, NzTabsModule, NzCascaderModule,
    NzDrawerModule, NzToolTipModule, NzAnchorModule, NzTagModule, NzGridModule, NzDescriptionsModule, NzModalModule,
    NgTerminalModule,
    NzLayoutModule, NzStatisticModule, NzEmptyModule, NzRadioModule,
    NzIconModule, NzSpinModule, NzCollapseModule, NzDropDownModule, NzFormModule, NzInputModule, NzButtonModule, NzBreadCrumbModule, NzStepsModule, NzAffixModule, NzInputNumberModule,
    FormsModule, CommonModule, HttpClientModule, HttpClientJsonpModule, RouterModule, NzSelectModule, NzNotificationModule, NzTableModule, NzCheckboxModule, NzAlertModule, ReactiveFormsModule],
  declarations: [TableSelectComponent, SideBarToolBar,
    PageHeaderLeftComponent, ProgressTitleComponent, ProgressComponent, ConsumeTimePipe, SnapshotsetComponent, SnapshotLinkComponent, SnapshotChangeLogComponent
    , SchemaXmlEditComponent, SchemaEditVisualizingModelComponent,
    TimeConsumePipe, SafePipe, ItemPropValComponent, TisBreadcrumbComponent, FullBuildHistoryComponent
    , BuildProgressComponent, TisStepsComponent, SchemaVisualizingEditComponent,
    CompareEachOtherComponent, CompareResultComponent,
    CodemirrorComponent, PluginsComponent,
    TisColumn, PaginationComponent, TdContentDirective, ThDirective, NavigateBarComponent, InitSystemComponent, OperationLogComponent
    , PageHeaderComponent, TisMsgComponent, TisHeaderTool, TisHeaderToolContent, FormComponent, TisInputTool, InputContentDirective, TisInputProp
  ],
  exports: [SideBarToolBar, TableSelectComponent, NzSpaceModule, NzDropDownModule, PageHeaderLeftComponent, NzProgressModule, NzResultModule, NzPageHeaderModule, NzAlertModule, NzDrawerModule, NzDividerModule, NzStatisticModule, ConsumeTimePipe, SnapshotsetComponent, SnapshotLinkComponent, SnapshotChangeLogComponent, SchemaXmlEditComponent, SchemaEditVisualizingModelComponent,
    NzPopoverModule, NzListModule, NzButtonModule, NzToolTipModule, NzAnchorModule, NzSwitchModule, NzAffixModule, NzInputNumberModule, NzEmptyModule,
    CompareEachOtherComponent, CompareResultComponent, NzModalModule, NzRadioModule, NzBadgeModule,
    NzIconModule, NzSpinModule, NzTableModule, CodemirrorComponent, SafePipe, TisColumn, PaginationComponent, TdContentDirective, ThDirective, NavigateBarComponent, NzBreadCrumbModule
    , OperationLogComponent, PageHeaderComponent, TisMsgComponent, TisHeaderTool, FormComponent, TisInputTool, InputContentDirective, TisInputProp, PluginsComponent, FullBuildHistoryComponent, BuildProgressComponent, NzSelectModule
    , TisStepsComponent, NzCheckboxModule, NzDescriptionsModule, NzBackTopModule, SchemaVisualizingEditComponent, NzTransferModule, NzTagModule, NzGridModule, NzCardModule, NzMenuModule, NzLayoutModule],
  entryComponents: [CompareEachOtherComponent],
})
export class TisCommonModule {
  constructor() {
  }
}
