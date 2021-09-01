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

import {Component, EventEmitter, OnInit, Output} from "@angular/core";
import {TISService} from "../common/tis.service";
import {NzModalService} from "ng-zorro-antd";
import {Descriptor, HeteroList, Item, PluginSaveResponse} from "../common/tis.plugin";
import {PluginsComponent} from "../common/plugins.component";
import {BasicDataXAddComponent} from "./datax.add.base";
import {ActivatedRoute, Router} from "@angular/router";

// 文档：https://angular.io/docs/ts/latest/guide/forms.html
@Component({
  selector: 'addapp-form',
  template: `
      <tis-steps type="createDatax" [step]="0"></tis-steps>
      <nz-spin [nzSpinning]="this.formDisabled">
          <tis-steps-tools-bar [title]="'基本信息'" (cancel)="cancel()" (goOn)="createIndexStep1Next()"></tis-steps-tools-bar>
          <div style="width: 80%;margin: 0 auto;">
              <tis-plugins [formControlSpan]="20" [pluginMeta]="[{name: 'appSource', require: true, extraParam: 'dataxName_' + this.dto.dataxPipeName}]"
                           (afterSave)="afterSaveReader($event)" [savePlugin]="savePlugin" [showSaveButton]="false" [shallInitializePluginItems]="false" [_heteroList]="hlist" #pluginComponent></tis-plugins>
          </div>
      </nz-spin>
      <!-- Content here -->
  `
  , styles: [
      `
    `
  ]
})
export class DataxAddStep1Component extends BasicDataXAddComponent implements OnInit {
  errorItem: Item = Item.create([]);
  // model = new AppDesc();

  @Output() nextStep = new EventEmitter<any>();
  savePlugin = new EventEmitter<any>();
  hlist: HeteroList[] = [];


  constructor(tisService: TISService, modalService: NzModalService, r: Router, route: ActivatedRoute) {
    super(tisService, modalService, r, route);
  }

  ngOnInit(): void {
    let dataxNameParam = '';
    if (this.dto.dataxPipeName) {
      dataxNameParam = `&dataxName=${this.dto.dataxPipeName}`;
    }

    this.httpPost('/coredefine/corenodemanage.ajax'
      , 'action=datax_action&emethod=datax_processor_desc' + dataxNameParam)
      .then((r) => {
        if (r.success) {
          let hlist: HeteroList = PluginsComponent.wrapperHeteroList(r.bizresult);
          if (hlist.items.length < 1) {
            Descriptor.addNewItem(hlist, hlist.descriptorList[0], false, (_, p) => p);
          }
          this.hlist = [hlist];
        }
      });
  }

  // 执行下一步
  public createIndexStep1Next(): void {
    this.savePlugin.emit();
  }

  afterSaveReader(event: PluginSaveResponse) {
    if (event.saveSuccess) {

      if (event.hasBiz()) {
        let pluginIdentityNames: Array<string> = event.biz();
        for (let i = 0; ; i++) {
          this.dto.dataxPipeName = pluginIdentityNames[i];
          break;
        }
        if (!this.dto.dataxPipeName) {
          throw new Error("have not set dataxPipeName properly");
        }
        this.nextStep.next(this.dto);
      } else {
        throw new Error("have not set biz result");
      }

    }
  }
}
