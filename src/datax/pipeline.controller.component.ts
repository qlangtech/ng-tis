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

import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {TISService} from '../common/tis.service';
import {ActivatedRoute, Router} from '@angular/router';
import {AppFormComponent, CurrentCollection} from '../common/basic.form.component';

import {NzModalService} from "ng-zorro-antd/modal";
import {DataxAddComponent, DataxDTO} from "../base/datax.add.component";
import {ExecModel} from "../base/datax.add.step7.confirm.component";
import {StepType} from "../common/steps.component";
import {ControlPanelComponent} from "../common/control.panel.component";
import {LatestSelectedIndex} from "../common/LatestSelectedIndex";
import {LocalStorageService} from "../common/local-storage.service";


@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <nz-tabset nzSize="large" [nzSelectedIndex]="tabIndex">
      <nz-tab [nzTitle]="cfgTemplate" (nzSelect)="cfgTabSelected()">
        <ng-template #cfgTemplate>
          <i nz-icon nzType="form" nzTheme="outline"></i>配置
        </ng-template>
        <ng-template nz-tab>
          <datax-cfg></datax-cfg>
        </ng-template>
      </nz-tab>
      <nz-tab [nzTitle]="settingTemplate" (nzSelect)="controlTabSelected()">
        <ng-template #settingTemplate>
          <i nz-icon nzType="setting" nzTheme="outline"></i>操作
        </ng-template>
        <ng-template nz-tab>

          <control-prompt panelType="danger-delete" [procDesc]="'删除数据通道'" (controlClick)="onDeleteClick($event)">

          </control-prompt>

          <!--            <nz-page-header class="danger-control-title" nzTitle="危险操作" nzSubtitle="以下操作可能造成某些组件功能不可用">-->
          <!--            </nz-page-header>-->

          <!--            <nz-list class="ant-advanced-search-form ant-advanced-search-form-danger" nzBordered>-->
          <!--              <nz-list-item>-->
          <!--                <span nz-typography>删除数据通道</span>-->
          <!--                <button nz-button nzType="primary" nzDanger (click)="pipelineDelete()"><i nz-icon nzType="delete" nzTheme="outline"></i>删除</button>-->
          <!--              </nz-list-item>-->
          <!--            </nz-list>-->
        </ng-template>
      </nz-tab>
    </nz-tabset>
  `,
  styles: [`
  `]
})
export class PipelineControllerComponent extends AppFormComponent implements OnInit {

  public dto: DataxDTO = null;
  stepType: StepType;

  tabIndex: number;

  // public stepType: StepType = StepType.CreateDatax;

  constructor(tisService: TISService, route: ActivatedRoute, modalService: NzModalService, private _localStorageService: LocalStorageService, private router: Router) {
    super(tisService, route, modalService);
    this.stepType = this.route.snapshot.data["stepType"];
    if (!this.stepType) {
      this.stepType = StepType.CreateDatax
    }
  }

  ngOnInit() {
    super.ngOnInit();
    this.route.fragment.subscribe((frag) => {
      switch (frag) {
        case "control":
          this.tabIndex = 1;
          break;
        case "config":
        default:
          this.tabIndex = 0;
      }
    })
  }

  protected initialize(app: CurrentCollection): void {

    // @ts-ignore
    // let stepType: StepType = this.route.snapshot.data["stepType"];
    // if (!stepType) {
    //   stepType = StepType.CreateDatax
    // }

    DataxAddComponent.getDataXMeta(this, this.stepType, app).then((dto) => {
      // console.log(dto);
      this.dto = dto;
    });
  }


  get execModel(): ExecModel {
    return ExecModel.Reader;
  }

  pipelineDelete() {

  }

  onDeleteClick(event: ControlPanelComponent) {

    this.httpPost("/coredefine/corenodemanage.ajax", "action=datax_action&emethod=delete_datax")
      .then((r) => {
        setTimeout(() => {
          if (r.success) {
            // 直接跳转
            this.tisService.tisMeta.then((meta) => {
              // 删除缓存中的app
              let selectedApps = meta.latestSelectedAppsIndex();
              selectedApps.remove(this._localStorageService, this.currentApp);
            });
            this.router.navigate(["base", "applist"]);
          } else {
            event.restoreInitialState();
          }
        }, 2000)
      }, (r) => {
        event.restoreInitialState();
      });

  }

  cfgTabSelected() {
    this.routeFrag("config");
  }

  private routeFrag(fragment: string) {
    this.router.navigate(['.'], {relativeTo: this.route, fragment: fragment});
  }

  controlTabSelected() {
    this.routeFrag("control");
  }
}
