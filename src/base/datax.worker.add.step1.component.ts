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

import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {TISService} from "../common/tis.service";
import {BasicFormComponent, CurrentCollection} from "../common/basic.form.component";

import {NzModalService} from "ng-zorro-antd";
import {HeteroList, PluginSaveResponse, SavePluginEvent} from "../common/tis.plugin";
import {PluginsComponent} from "../common/plugins.component";
import {DataxWorkerDTO} from "../runtime/misc/RCDeployment";

@Component({
  template: `
      <tis-steps type="CreateWorkderOfDataX" [step]="0"></tis-steps>
      <tis-page-header [showBreadcrumb]="false">
          <tis-header-tool>
              <button nz-button nzType="primary" (click)="createStep1Next()">下一步</button>
          </tis-header-tool>
      </tis-page-header>
      <nz-spin [nzSpinning]="this.formDisabled" class="item-block">
          <tis-plugins [formControlSpan]="20" [pluginMeta]="[{name: 'datax-worker', require: true}]"
                       (afterSave)="afterSaveReader($event)" [savePlugin]="savePlugin" [showSaveButton]="false"
                       [shallInitializePluginItems]="false" [_heteroList]="hlist" #pluginComponent></tis-plugins>
      </nz-spin>
  `
})
export class DataxWorkerAddStep1Component extends BasicFormComponent implements AfterViewInit, OnInit {
  hlist: HeteroList[] = [];
  savePlugin = new EventEmitter<SavePluginEvent>();
  @Input() dto: DataxWorkerDTO;
  @Output() nextStep = new EventEmitter<any>();
  @Output() preStep = new EventEmitter<any>();

  constructor(tisService: TISService, modalService: NzModalService) {
    super(tisService, modalService);
  }

  createStep1Next() {
    let e = new SavePluginEvent();
    e.notShowBizMsg = true;
    this.savePlugin.emit(e);
    // this.jsonPost('/coredefine/corenodemanage.ajax?action=datax_action&emethod=save_datax_worker'
    //   , {
    //     dataxWorker: this.hlist[0]
    //   })
    //   .then((r) => {
    //     if (r.success) {
    //       this.nextStep.emit(this.dto);
    //       // let rList = PluginsComponent.wrapDescriptors(r.bizresult.pluginDesc);
    //       // let desc = Array.from(rList.values());
    //       // this.hlist = DatasourceComponent.pluginDesc(desc[0])
    //     }
    //   });
  }

  protected initialize(app: CurrentCollection): void {
  }

  ngAfterViewInit() {
  }


  ngOnInit(): void {
    this.httpPost('/coredefine/corenodemanage.ajax'
      , 'action=datax_action&emethod=datax_worker_desc')
      .then((r) => {
        if (r.success) {
          let rList = PluginsComponent.wrapDescriptors(r.bizresult.pluginDesc);
          let desc = Array.from(rList.values());
          this.hlist = PluginsComponent.pluginDesc(desc[0])
        }
      });
  }

  afterSaveReader(e: PluginSaveResponse) {
    if (e.saveSuccess) {
      this.nextStep.emit(this.dto);
    }
  }


}

