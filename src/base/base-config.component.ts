import {BasicFormComponent} from "../common/basic.form.component";
import {Component, EventEmitter, OnInit} from "@angular/core";
import {TisResponseResult, TISService} from "../service/tis.service";

import {PluginSaveResponse} from "../common/tis.plugin";
import {NzModalService} from "ng-zorro-antd";

@Component({
  template: `
      <tis-page-header title="插件配置"></tis-page-header>
      <nz-spin [nzSize]="'large'" [nzSpinning]="this.formDisabled || pluginComponentDisabled">
          <nz-tabset (nzSelectedIndexChange)="tabChange($event)" [nzTabBarExtraContent]="extraTemplate">
              <nz-tab nzTitle="全局" (nzDeselect)="configDeSelect($event)">
                  <ng-template nz-tab>
                      <!--
                      <incr-build-step1-1-params-set (ajaxOccur)="buildStep1ParamsSetComponentAjax($event)" #buildStep1ParamsSetComponent></incr-build-step1-1-params-set>
                    -->
                      <tis-plugins [showExtensionPoint]="this.showExtensionPoint" [showSaveButton]="true" [plugins]="['params-cfg']" (ajaxOccur)="buildStep1ParamsSetComponentAjax($event)"></tis-plugins>
                  </ng-template>
              </nz-tab>
              <nz-tab nzTitle="实时" (nzDeselect)="configDeSelect($event)">
                  <!---->
                  <ng-template nz-tab>
                      <tis-plugins [showExtensionPoint]="this.showExtensionPoint" [showSaveButton]="true" [plugins]="['incr-config']" (ajaxOccur)="buildStep1ParamsSetComponentAjax($event)"></tis-plugins>
                  </ng-template>
              </nz-tab>
              <nz-tab nzTitle="离线" (nzDeselect)="configDeSelect($event)">
                  <ng-template nz-tab>
                      <tis-plugins [showExtensionPoint]="this.showExtensionPoint" [showSaveButton]="true" [plugins]="['fs','flat_table_builder','index_build_container','ds_dump']" (ajaxOccur)="buildStep1ParamsSetComponentAjax($event)"></tis-plugins>
                  </ng-template>
              </nz-tab>
          </nz-tabset>
          <ng-template #extraTemplate>
              <!--
              <button nz-button nzType="primary" (click)="save()">保存</button>
              -->
              <span>扩展点显示<nz-switch [nzLoading]="formDisabled" (ngModelChange)="showExtendsPointChange($event)" [ngModel]="this.showExtensionPoint.open" nzCheckedChildren="开" nzUnCheckedChildren="关"></nz-switch></span>
          </ng-template>
      </nz-spin>
  `
  ,
  styles: [`

  `]
})
export class BaseConfigComponent extends BasicFormComponent implements OnInit {
  showExtensionPoint: { open: boolean } = {open: false};
  pluginComponentDisabled = true;

  // savePlugin = new EventEmitter<any>();
  constructor(tisService: TISService, modalService: NzModalService) {
    super(tisService, modalService);
  }

  ngOnInit(): void {
    let url = '/coredefine/corenodemanage.ajax';
    this.httpPost(url, 'event_submit_do_get_extension_point_show=y&action=plugin_action')
      .then((r: TisResponseResult) => {
        this.showExtensionPoint = {open: r.bizresult};
      })
  }

  buildStep1ParamsSetComponentAjax(event: PluginSaveResponse) {
    console.log(event.formDisabled);
    if (!event.formDisabled) {
      this.pluginComponentDisabled = event.formDisabled;
    }
  }

  tabChange(event: number) {
    this.pluginComponentDisabled = true;
  }

  configDeSelect(event: void) {
  }

  save() {
    // this.savePlugin.emit();
  }

  showExtendsPointChange(event: boolean) {
    let url = '/coredefine/corenodemanage.ajax';
    this.httpPost(url, 'event_submit_do_switch_extension_point_show=y&action=plugin_action&switch=' + event)
      .then((r: TisResponseResult) => {
        this.showExtensionPoint = {open: event};
      })
  }
}
