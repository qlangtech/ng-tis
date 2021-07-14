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

import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {TISService} from "../service/tis.service";
import {BasicFormComponent} from "../common/basic.form.component";
import {AppDesc, ConfirmDTO, Option} from "./addapp-pojo";
import {NzModalService} from "ng-zorro-antd";
import {Descriptor, HeteroList, Item, ItemPropVal, PluginSaveResponse} from "../common/tis.plugin";
import {DataxDTO} from "./datax.add.component";
import {PluginsComponent} from "../common/plugins.component";
import {DatasourceComponent} from "../offline/ds.component";
import {BasicDataXAddComponent} from "./datax.add.base";
import {ActivatedRoute, Router} from "@angular/router";

// 文档：https://angular.io/docs/ts/latest/guide/forms.html
@Component({
  selector: 'addapp-form',
  // templateUrl: '/runtime/addapp.htm'
  template: `
      <tis-steps type="createDatax" [step]="0"></tis-steps>
      <!--      <tis-form [fieldsErr]="errorItem">-->
      <!--          <tis-page-header [showBreadcrumb]="false">-->
      <!--              <tis-header-tool>-->
      <!--                  <button nz-button  (click)="createIndexStep1Next()">取消</button> &nbsp;  <button nz-button nzType="primary" (click)="createIndexStep1Next()">下一步</button>-->
      <!--              </tis-header-tool>-->
      <!--          </tis-page-header>-->
      <!--          <tis-ipt #indexName title="实例名称" name="projectName" require="true">-->
      <!--              <input nzSize="large" required type="text" [id]="indexName.name" nz-input [(ngModel)]="dto.profile.projectName" name="name"/>-->
      <!--          </tis-ipt>-->
      <!--          <tis-ipt #dptId title="所属部门" name="dptId" require="true">-->
      <!--              <nz-select nzSize="large" style="width: calc(100% - 6em)" nzPlaceHolder="请选择" name="dptId" class="form-control" [(ngModel)]="dto.profile.dptId">-->
      <!--                  <nz-option *ngFor="let pp of dpts" [nzValue]="pp.value" [nzLabel]="pp.name"></nz-option>-->
      <!--              </nz-select>-->
      <!--              <a class="tis-link-btn" [routerLink]="['/','base','departmentlist']">部门管理</a>-->
      <!--          </tis-ipt>-->

      <!--          <tis-ipt #recept title="接口人" name="recept" require="true">-->
      <!--              <input nzSize="large" nz-input [id]="recept.name" [(ngModel)]="dto.profile.recept" name="recept"-->
      <!--                     placeholder="小明">-->
      <!--          </tis-ipt>-->
      <!--      </tis-form>-->
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
          // let rList = PluginsComponent.wrapDescriptors(r.bizresult.descriptors);
          // let desc = Array.from(rList.values());
          let hlist: HeteroList = PluginsComponent.wrapperHeteroList(r.bizresult);
          if (hlist.items.length < 1) {
            Descriptor.addNewItem(hlist, hlist.descriptorList[0], false, (_, p) => p);
          }
//          DatasourceComponent.pluginDesc(desc[0])
          this.hlist = [hlist]; // DatasourceComponent.pluginDesc(desc[0])
          // console.log(this.hlist);
        }
      });
  }

  // 执行下一步
  public createIndexStep1Next(): void {
    // let dto = new ConfirmDTO();
    // dto.appform = this.model;
    this.savePlugin.emit();
    // this.jsonPost('/coredefine/corenodemanage.ajax?action=datax_action&emethod=validate_datax_profile'
    //   , this.dto.profile)
    //   .then((r) => {
    //     this.processResult(r);
    //     if (r.success) {
    //       // console.log(dto);
    //       this.nextStep.emit(this.dto);
    //     } else {
    //       this.errorItem = Item.processFieldsErr(r);
    //     }
    //   });
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


  // openTestDialog() {
  //   // PluginsComponent.openPluginInstanceAddDialog(this,);
  //   let impl = 'com.qlangtech.tis.plugin.datax.DataXGlobalConfig';
  //   let url = "/coredefine/corenodemanage.ajax";
  //   this.httpPost(url, "action=plugin_action&emethod=get_descriptor&impl=" + impl).then((r) => {
  //     let desc = PluginsComponent.wrapDescriptors(r.bizresult);
  //     desc.forEach((d) => {
  //       PluginsComponent.openPluginInstanceAddDialog(this, d, {name: "params-cfg", require: true, extraParam: "append_true"}, "添加" + d.displayName, (biz) => {
  //       });
  //     });
  //   });
  // }
}
