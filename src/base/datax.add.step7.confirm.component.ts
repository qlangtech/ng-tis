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

import {AfterContentInit, AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild} from "@angular/core";
import {TISService} from "../service/tis.service";
import {BasicFormComponent} from "../common/basic.form.component";
import {AppDesc, ConfirmDTO} from "./addapp-pojo";
import {NzDrawerRef, NzDrawerService, NzModalService, NzTreeNodeOptions} from "ng-zorro-antd";
import {Descriptor, HeteroList, Item, PluginSaveResponse, PluginType} from "../common/tis.plugin";
import {PluginsComponent} from "../common/plugins.component";
import {DataxDTO, ISelectedTabMeta} from "./datax.add.component";
import {DatasourceComponent} from "../offline/ds.component";
import {PluginSubFormComponent} from "./datax.add.step4.component";
import {BasicDataXAddComponent} from "./datax.add.base";


// 文档：https://angular.io/docs/ts/latest/guide/forms.html
@Component({
  template: `
      <ng-container *ngIf="componentName">{{componentName}}</ng-container>
      <tis-steps type="createDatax" [step]="4"></tis-steps>
      <!--      <tis-page-header [showBreadcrumb]="false" [result]="result">-->
      <!--          <tis-header-tool>-->
      <!--              <button nz-button nzType="default">上一步</button>&nbsp;<button nz-button nzType="primary" (click)="createStepNext()">创建</button>-->
      <!--          </tis-header-tool>-->
      <!--      </tis-page-header>-->

      <tis-steps-tools-bar (cancel)="cancel()" (goBack)="goback()">
          <final-exec-controller>
              <button nz-button nzType="primary" (click)="createStepNext()"><i nz-icon nzType="rocket" nzTheme="outline"></i>创建</button>
          </final-exec-controller>
      </tis-steps-tools-bar>
      <h4>生成配置文件</h4>
      <ul class="item-block child-block">
          <li *ngFor="let f of genCfgFileList"><i nz-icon nzType="file-text" nzTheme="outline"></i>
              <button (click)="viewGenFile(f)" nz-button nzType="link">{{f}}</button>
          </li>
      </ul>
      <h4>基本信息</h4>
      <div class="item-block">
      </div>
      <h4>Reader</h4>
      <div class="item-block">
          <tis-plugins [errorsPageShow]="false"
                       [formControlSpan]="20" [shallInitializePluginItems]="false" [showSaveButton]="false" [disabled]="true"
                       [plugins]="[{name: 'dataxReader', require: true, extraParam: 'dataxName_' + this.dto.dataxPipeName}]"></tis-plugins>
      </div>
      <h4>Writer</h4>
      <div class="item-block">
          <tis-plugins [showExtensionPoint]="{open:false}" [errorsPageShow]="false"
                       [formControlSpan]="20" [shallInitializePluginItems]="false" [showSaveButton]="false" [disabled]="true"
                       [plugins]="[{name: 'dataxWriter', require: true, extraParam: 'dataxName_' + this.dto.dataxPipeName}]"></tis-plugins>
      </div>
  `
  , styles: [
      `
            .child-block {
                list-style-type: none;
            }

            .child-block li {
                display: inline-block;
                width: 20%;
                padding-right: 8px;
            }

            .editable-cell {
                position: relative;
                padding: 5px 12px;
                cursor: pointer;
            }

            .editable-row:hover .editable-cell {
                border: 1px solid #d9d9d9;
                border-radius: 4px;
                padding: 4px 11px;
            }


    `
  ]
})
export class DataxAddStep7Component extends BasicDataXAddComponent implements OnInit, AfterViewInit {
  errorItem: Item = Item.create([]);


  genCfgFileList: Array<string> = [];

  constructor(tisService: TISService, modalService: NzModalService, private drawerService: NzDrawerService) {
    super(tisService, modalService);
  }

  ngOnInit(): void {
    // this.dto.dataxPipeName
    let url = '/coredefine/corenodemanage.ajax';
    this.httpPost(url, 'action=datax_action&emethod=generate_datax_cfgs&dataxName=' + this.dto.dataxPipeName).then((r) => {
      if (r.success) {
        this.genCfgFileList = r.bizresult;
      }
    });
  }

  ngAfterViewInit(): void {
  }

  // 执行下一步
  public createStepNext(): void {

    // this.nextStep.emit(this.dto);
    // this.savePlugin.emit();
    // let dto = new DataxDTO();
    // dto.appform = this.readerDesc;
    this.jsonPost("/coredefine/corenodemanage.ajax?action=datax_action&emethod=create_datax&dataxName=" + this.dto.dataxPipeName
      , this.dto.profile)
      .then((r) => {
        this.processResult(r);
        if (r.success) {
          // console.log(dto);
          // this.nextStep.emit(this.dto);
        } else {
          this.errorItem = Item.processFieldsErr(r);
        }
      });
  }

  viewGenFile(fileName: string) {

    this.httpPost("/coredefine/corenodemanage.ajax"
      , "action=datax_action&emethod=get_gen_cfg_file&dataxName=" + this.dto.dataxPipeName + "&fileName=" + fileName)
      .then((r) => {
        this.processResult(r);
        if (r.success) {
          const drawerRef = this.drawerService.create<ViewGenerateCfgComponent, {}, {}>({
            nzHeight: "80%",
            nzPlacement: "bottom",
            nzTitle: `DataX Config File '${fileName}' `,
            nzContent: ViewGenerateCfgComponent,
            nzContentParams: {fileMeta: r.bizresult}
          });
        }
      });
  }
}

@Component({
  template: `
      <tis-codemirror [config]="{mode:'text/javascript'}" [(ngModel)]="fileMeta.content"></tis-codemirror>
  `
})
export class ViewGenerateCfgComponent {

  @Input()
  fileMeta: { content?: string } = {};

  constructor(private drawerRef: NzDrawerRef<{ hetero: HeteroList }>) {
  }

  close(): void {
    this.drawerRef.close();
  }
}


interface ITableAlias {
  from: string;
  to: string;
}
