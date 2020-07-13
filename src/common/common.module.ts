import {NgModule} from "@angular/core";
import {FormsModule} from "@angular/forms";
// import {HttpModule, JsonpModule} from "@angular/http";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {DateFormatPipe} from "../common/date.format.pipe";
import {PaginationComponent, TdContentDirective, ThDirective, TisColumn} from "../common/pagination.component";
import {CommonModule} from "@angular/common";
import {NavigateBarComponent} from "../runtime/navigate.bar.component";
import {RouterModule} from "@angular/router";
import {OperationLogComponent} from "../base/operation.log.component";
import {SafePipe} from "./safe.pipe";
import {PageHeaderComponent, TisHeaderTool, TisHeaderToolContent} from "./pager.header.component";
import {TisMsgComponent} from "./msg.component";
import {FormComponent, InputContentDirective, TisInputProp, TisInputTool} from "./form.component";
import {CodemirrorComponent} from "./codemirror.component";
import {NzSelectModule} from 'ng-zorro-antd/select';
import {HttpClientJsonpModule, HttpClientModule} from '@angular/common/http';
import {LocalStorageModule} from 'angular-2-local-storage';
import {NzNotificationModule} from 'ng-zorro-antd/notification';
import {NzIconModule} from 'ng-zorro-antd/icon';
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

@NgModule({
  id: 'tiscommonModule',
  imports: [
    LocalStorageModule.forRoot({
      prefix: 'my-app',
      storageType: 'localStorage'
    }),
    NzDrawerModule, NzToolTipModule, NzAnchorModule, NzTagModule,
    NgTerminalModule,
    NzLayoutModule,
    NzIconModule, NzSpinModule, NzCollapseModule, NzDropDownModule, NzFormModule, NzInputModule, NzButtonModule, NzBreadCrumbModule, NzStepsModule, NzAffixModule, NzInputNumberModule,
    FormsModule, CommonModule, HttpClientModule, HttpClientJsonpModule, NgbModule, RouterModule, NzSelectModule, NzNotificationModule, NzTableModule, NzCheckboxModule, NzAlertModule],
  declarations: [
    ProgressTitleComponent, ProgressComponent,
    DateFormatPipe, SafePipe, ItemPropValComponent, TisBreadcrumbComponent, FullBuildHistoryComponent, BuildProgressComponent, TisStepsComponent, SchemaVisualizingEditComponent,
    // pagination
    CodemirrorComponent, PluginsComponent,
    TisColumn, PaginationComponent, TdContentDirective, ThDirective, NavigateBarComponent, OperationLogComponent
    , PageHeaderComponent, TisMsgComponent, TisHeaderTool, TisHeaderToolContent, FormComponent, TisInputTool, InputContentDirective, TisInputProp
  ],
  exports: [NzStatisticModule,
    NzPopoverModule, NzListModule, NzButtonModule, NzToolTipModule, NzAnchorModule, NzSwitchModule, NzAffixModule, NzInputNumberModule,
    NzIconModule, NzSpinModule, NzTableModule, CodemirrorComponent, SafePipe, DateFormatPipe, TisColumn, PaginationComponent, TdContentDirective, ThDirective, NavigateBarComponent, NzBreadCrumbModule
    , OperationLogComponent, PageHeaderComponent, TisMsgComponent, TisHeaderTool, FormComponent, TisInputTool, InputContentDirective, TisInputProp, PluginsComponent, FullBuildHistoryComponent, BuildProgressComponent, NzSelectModule
    , TisStepsComponent, NzCheckboxModule, NzDescriptionsModule, NzBackTopModule, SchemaVisualizingEditComponent, NzTransferModule, NzTagModule, NzGridModule, NzCardModule, NzMenuModule, NzLayoutModule],
  entryComponents: [],
})
export class TisCommonModule {
  constructor() {
  }
}
