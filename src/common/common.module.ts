/**
 *   Licensed to the Apache Software Foundation (ASF) under one
 *   or more contributor license agreements.  See the NOTICE file
 *   distributed with this work for additional information
 *   regarding copyright ownership.  The ASF licenses this file
 *   to you under the Apache License, Version 2.0 (the
 *   "License"); you may not use this file except in compliance
 *   with the License.  You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import {NzUploadModule} from 'ng-zorro-antd/upload';
import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ErrorMsgPipe, ItemPropValPipe, MaxLengthPipe, TimeConsumePipe} from "../common/date.format.pipe";
import {ConsumeTimePipe} from "../common/consume.time.pipe";
import {
  PaginationComponent,
  TdContentDirective,
  ThDirective,
  TisColumn,
  TisPageHeader,
  TisPageRowAssist
} from "../common/pagination.component";
import {CommonModule} from "@angular/common";
import {NavigateBarComponent} from "./navigate.bar.component";
import {RouterModule} from "@angular/router";
import {OperationLogComponent} from "./operation.log.component";
import {PluginDescCallbackPipe, SafePipe} from "./safe.pipe";
import {
  FinalExecControllerComponent,
  PageHeaderComponent,
  PageHeaderLeftComponent,
  TisHeaderTool,
  TisHeaderToolContent
} from "./pager.header.component";
import {TisMsgComponent} from "./msg.component";
import {FormComponent, InputContentDirective, TisInputProp, TisInputTool} from "./form.component";
import {CodemirrorComponent} from "./codemirror.component";
import {NzSelectModule} from 'ng-zorro-antd/select';
import {HttpClientJsonpModule, HttpClientModule} from '@angular/common/http';
import {LocalStorageModule} from 'angular-2-local-storage';
import {NzNotificationModule} from 'ng-zorro-antd/notification';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {
  NotebookwrapperComponent,
  PluginsComponent,
  SelectionInputAssistComponent
} from "./plugins.component";
import {NzCollapseModule} from 'ng-zorro-antd/collapse';
import {NzDropDownModule} from 'ng-zorro-antd/dropdown';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzStepsModule} from 'ng-zorro-antd/steps';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb';
import {TisBreadcrumbComponent} from "./breadcrumb.component";
import {TisStepsComponent, TisStepsToolbarComponent} from "./steps.component";
import {NzTableModule} from 'ng-zorro-antd/table';
import {NzPopoverModule} from 'ng-zorro-antd/popover';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzDescriptionsModule} from 'ng-zorro-antd/descriptions';
import {NzBackTopModule} from 'ng-zorro-antd/back-top';
// import { NzCodeEditorModule } from 'ng-zorro-antd/code-editor';
import {
  SchemaExpertAppCreateEditComponent,
  SchemaVisualizingEditComponent
} from "./schema.expert.create.edit.component";
import {NzTransferModule} from 'ng-zorro-antd/transfer';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzAlertModule} from 'ng-zorro-antd/alert';
import {NzGridModule} from 'ng-zorro-antd/grid';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzMenuModule} from 'ng-zorro-antd/menu';
import {NzLayoutModule} from 'ng-zorro-antd/layout';
import {NzListModule} from 'ng-zorro-antd/list';
import {NzDatePickerModule} from 'ng-zorro-antd/date-picker';
import {BuildProgressComponent, ProgressComponent, ProgressTitleComponent} from "./core.build.progress.component";
import {NgTerminalModule} from 'ng-terminal';
import {NzDrawerModule} from 'ng-zorro-antd/drawer';
import {NzToolTipModule} from 'ng-zorro-antd/tooltip';
import {NzAnchorModule} from 'ng-zorro-antd/anchor';
import {NzSwitchModule} from 'ng-zorro-antd/switch';
import {NzAffixModule} from 'ng-zorro-antd/affix';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {NzStatisticModule} from 'ng-zorro-antd/statistic';
// import {SnapshotsetComponent} from "./snapshotset.component";
import {SnapshotLinkComponent} from "./snapshot.link";
// import {SnapshotChangeLogComponent} from "../runtime/snapshot.change.log";
import {SchemaEditVisualizingModelComponent, SchemaXmlEditComponent} from '../corecfg/schema-xml-edit.component';
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
import {K8SReplicsSpecComponent} from "./k8s.replics.spec.component";
import {DataxAddStep7Component, ViewGenerateCfgComponent} from "../base/datax.add.step7.confirm.component";
import {DataxAddStep4Component, SelectedTabsComponent} from "../base/datax.add.step4.component";
import {DataxAddComponent} from "../base/datax.add.component";
import {DataxAddStep1Component} from "../base/datax.add.step1.component";
import {DataxAddStep2Component} from "../base/datax.add.step2.component";
import {DataxAddStep5Component} from "../base/datax.add.step5.component";
import {DataxAddStep3Component} from "../base/datax.add.step3.component";
import {DataxAddStep6Component} from "../base/datax.add.step6.maptable.component";
import {
  DataxAddStep6ColsMetaSetterComponent,
  DataxAddStep6TransformerSetterComponent
} from "../base/datax.add.step6.cols-meta-setter.component";
import {IncrPodLogsStatusComponent} from "../runtime/incr.pod.logs.status.component";
import {AddAppDefSchemaComponent} from "../base/addapp-define-schema.component";
import {MarkdownModule} from "ngx-markdown";
import {PluginAddBtnComponent, TisPluginAddBtnExtractLiItem} from "./plugin.add.btn.component";
import {PluginUpdateCenterComponent} from "../base/plugin.update.center.component";
import {PluginManageComponent} from "../base/plugin.manage.component";
import {TerminalComponent} from "./terminal.component";
import {ErrorDetailComponent} from "../base/error.detail.component";
import {ControlPanelComponent} from "./control.panel.component";
import {FullBuildHistoryComponent} from './full.build.history.component';
import {LaunchK8SClusterWaittingProcessComponent} from './launch.waitting.process.component';
import {BliBliComponent} from "./common.component";
import {TransformerRulesComponent} from "./multi-selected/transformer.rules.component";
import {JdbcTypeComponent} from "./multi-selected/jdbc.type.component";
import {SchemaEditComponent} from "./multi-selected/schema.edit.component";
import {JdbcTypePropsComponent} from "./multi-selected/jdbc.type.props.component";
import {ItemPropValComponent} from "./plugin/item-prop-val.component";
import {UdfDescLiteria} from "./multi-selected/basic.tuples.view.component";

import {TableTransformerComponent} from './selectedtab/table.transformer.component';
import {TableBaseComponent} from './selectedtab/table.base.component';
import {PluginSubFormComponent} from './selectedtab/plugin-sub-form.component';
import {PreviewComponent} from "./preview.component";
// import {NgxTisCommonLibModule} from "ngx-tis-common-lib";
import {DatasourceQuickManagerComponent} from "./ds.quick.manager.component";
import {FreshmanReadmeComponent} from "./freshman.readme.component";
// angular libraries: https://angular.io/guide/creating-libraries
// https://intellij-support.jetbrains.com/hc/en-us/community/posts/360004216480-Angular-Library-Module-Import-Error
// import {HttpModule, JsonpModule} from "@angular/http";
// @ts-ignore
@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  id: 'tiscommonModule',
  providers: [],
  imports: [
    MarkdownModule.forChild(),
    // NzIconModule.forChild([MySQLOutline]),
    NzIconModule,
    LocalStorageModule.forRoot({
      prefix: 'my-app',
      storageType: 'localStorage'
    }), NzProgressModule, NzSpaceModule, NzTabsModule, NzCascaderModule, NzTransferModule, NzSwitchModule,
    // NgxTisCommonLibModule ,
    NzUploadModule, NzDatePickerModule,
    NzDrawerModule, NzToolTipModule, NzAnchorModule, NzTagModule, NzGridModule, NzDescriptionsModule, NzModalModule,
    NgTerminalModule, NzPageHeaderModule,
    NzLayoutModule, NzStatisticModule, NzEmptyModule, NzRadioModule, NzBadgeModule,
    NzSpinModule, NzCollapseModule, NzDropDownModule, NzFormModule, NzInputModule, NzButtonModule, NzBreadCrumbModule, NzStepsModule, NzAffixModule, NzInputNumberModule,
    FormsModule, CommonModule, HttpClientModule, HttpClientJsonpModule, RouterModule, NzSelectModule, NzNotificationModule, NzTableModule, NzCheckboxModule, NzAlertModule, ReactiveFormsModule, NzListModule],
  declarations: [FreshmanReadmeComponent,PreviewComponent, DatasourceQuickManagerComponent ,JdbcTypePropsComponent, UdfDescLiteria, BliBliComponent, LaunchK8SClusterWaittingProcessComponent, TransformerRulesComponent, JdbcTypeComponent,
    NotebookwrapperComponent, ControlPanelComponent, SchemaEditComponent,
    TerminalComponent, ErrorDetailComponent, PluginManageComponent, SchemaExpertAppCreateEditComponent, AddAppDefSchemaComponent, TableSelectComponent, SideBarToolBar, K8SReplicsSpecComponent,
    PageHeaderLeftComponent, ProgressTitleComponent, ProgressComponent, ConsumeTimePipe, SnapshotLinkComponent, SchemaXmlEditComponent, SchemaEditVisualizingModelComponent,
    TimeConsumePipe, MaxLengthPipe, SafePipe, ItemPropValPipe, ErrorMsgPipe, PluginDescCallbackPipe, ItemPropValComponent, TisBreadcrumbComponent, FullBuildHistoryComponent
    , BuildProgressComponent, TisStepsComponent, SchemaVisualizingEditComponent, PluginSubFormComponent, TableTransformerComponent, TableBaseComponent,
    CompareEachOtherComponent, CompareResultComponent,
    CodemirrorComponent, PluginsComponent, PluginAddBtnComponent, TisPluginAddBtnExtractLiItem, PluginUpdateCenterComponent, SelectionInputAssistComponent, FinalExecControllerComponent, DataxAddStep6ColsMetaSetterComponent, DataxAddStep6TransformerSetterComponent,
    TisPageHeader, TisPageRowAssist, TisColumn, PaginationComponent, TdContentDirective, ThDirective, NavigateBarComponent, InitSystemComponent, OperationLogComponent, DataxAddStep7Component
    , DataxAddStep4Component, SelectedTabsComponent, DataxAddComponent, DataxAddStep1Component, DataxAddStep2Component, ViewGenerateCfgComponent, DataxAddStep5Component, DataxAddStep3Component, DataxAddStep6Component
    , PageHeaderComponent, TisMsgComponent, TisHeaderTool, TisHeaderToolContent, FormComponent, TisInputTool, InputContentDirective, TisInputProp, TisStepsToolbarComponent, IncrPodLogsStatusComponent
  ],
  exports: [BliBliComponent, LaunchK8SClusterWaittingProcessComponent, SchemaEditComponent, ControlPanelComponent, PluginUpdateCenterComponent, SelectedTabsComponent, ErrorDetailComponent, SchemaExpertAppCreateEditComponent, AddAppDefSchemaComponent, K8SReplicsSpecComponent, SideBarToolBar, TableSelectComponent
    , NzSpaceModule, NzDropDownModule, PageHeaderLeftComponent, NzProgressModule, NzResultModule, NzPageHeaderModule
    , NzAlertModule, NzDrawerModule, NzDividerModule, NzStatisticModule, ConsumeTimePipe, SnapshotLinkComponent
    , SchemaXmlEditComponent, SchemaEditVisualizingModelComponent,
    NzPopoverModule, NzListModule, NzButtonModule, NzToolTipModule, NzAnchorModule, NzSwitchModule, NzAffixModule, NzInputNumberModule, NzEmptyModule, ViewGenerateCfgComponent,
    CompareEachOtherComponent, CompareResultComponent, NzModalModule, NzRadioModule, NzBadgeModule, TisStepsToolbarComponent,
    NzIconModule, NzSpinModule, NzTableModule, CodemirrorComponent, SafePipe, PluginDescCallbackPipe, TisPageHeader, TisPageRowAssist, TisColumn, PaginationComponent
    , TdContentDirective, ThDirective, NavigateBarComponent, NzBreadCrumbModule
    , OperationLogComponent, PageHeaderComponent, TisMsgComponent, TisHeaderTool, FormComponent, TisInputTool, InputContentDirective, TisInputProp
    , PluginsComponent, FullBuildHistoryComponent, BuildProgressComponent, NzSelectModule
    , TisStepsComponent, NzCheckboxModule, NzDescriptionsModule, NzBackTopModule, SchemaVisualizingEditComponent, NzTransferModule, NzTagModule, NzGridModule
    , NzCardModule, NzMenuModule, NzLayoutModule, NzFormModule, FinalExecControllerComponent, DataxAddStep7Component, MaxLengthPipe, DataxAddStep4Component, DataxAddStep6ColsMetaSetterComponent, DataxAddStep6TransformerSetterComponent
    , DataxAddComponent, DataxAddStep1Component, DataxAddStep2Component, DataxAddStep5Component, DataxAddStep3Component, IncrPodLogsStatusComponent, TimeConsumePipe, PluginAddBtnComponent, TisPluginAddBtnExtractLiItem],
  entryComponents: [CompareEachOtherComponent],
})
export class TisCommonModule {


}


