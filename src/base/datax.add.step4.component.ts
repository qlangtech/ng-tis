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

import {AfterContentInit, AfterViewInit, Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild} from "@angular/core";
import {TISService} from "../service/tis.service";
import {BasicFormComponent} from "../common/basic.form.component";
import {AppDesc, ConfirmDTO} from "./addapp-pojo";
import {NzDrawerRef, NzDrawerService, NzModalService, NzTreeNodeOptions, TransferChange, TransferItem} from "ng-zorro-antd";
import {Descriptor, HeteroList, Item, ItemPropVal, PluginName, PluginSaveResponse, PluginType} from "../common/tis.plugin";
import {PluginsComponent} from "../common/plugins.component";
import {DataxDTO, ISelectedCol, ISelectedTabMeta} from "./datax.add.component";
import {DatasourceComponent} from "../offline/ds.component";
import {BasicDataXAddComponent} from "./datax.add.base";

// 设置所选table的表以及 表的列
// 文档：https://angular.io/docs/ts/latest/guide/forms.html
@Component({
  // templateUrl: '/runtime/addapp.htm'
  template: `
      <tis-steps type="createDatax" [step]="1"></tis-steps>
      <tis-steps-tools-bar (cancel)="cancel()" (goBack)="goback()" (goOn)="createStepNext()"></tis-steps-tools-bar>
      <tis-form [formLayout]="'vertical'" [fieldsErr]="errorItem">
          <!--          <tis-page-header [showBreadcrumb]="false" [result]="result">-->
          <!--              <tis-header-tool>-->
          <!--                  <button nz-button nzType="primary" (click)="createStepNext()">下一步</button>-->
          <!--              </tis-header-tool>-->
          <!--          </tis-page-header>-->
          <tis-ipt #selectTabs title="选择表" name="selectTabs" require="true">
              <nz-transfer (nzChange)="transferChange($event)"
                           [nzDataSource]="transferList"
                           [nzDisabled]="false"
                           [nzShowSearch]="true"
                           [nzShowSelectAll]="true"
                           [nzRenderList]="[renderList, renderList]"
              >
                  <ng-template
                          #renderList
                          let-items
                          let-direction="direction"
                          let-stat="stat"
                          let-disabled="disabled"
                          let-onItemSelectAll="onItemSelectAll"
                          let-onItemSelect="onItemSelect"
                  >
                      <nz-table #t [nzData]="convertItems(items)" nzSize="small">
                          <thead>
                          <tr>
                              <th
                                      nzShowCheckbox
                                      [nzDisabled]="disabled"
                                      [nzChecked]="stat.checkAll"
                                      [nzIndeterminate]="stat.checkHalf"
                                      (nzCheckedChange)="onItemSelectAll($event)"
                              ></th>
                              <th>表名</th>
                              <th *ngIf="direction === 'right'">操作</th>
                          </tr>
                          </thead>
                          <tbody>
                          <tr *ngFor="let data of t.data" (click)="onItemSelect(data)">
                              <td
                                      nzShowCheckbox
                                      [nzChecked]="data.checked"
                                      [nzDisabled]="disabled || data.disabled"
                                      (nzCheckedChange)="onItemSelect(data)"
                              ></td>
                              <td>{{ data.title }}</td>
                              <td *ngIf="direction === 'right'">
                                  <nz-tag [nzColor]="'blue'">{{ data.meta  }}</nz-tag>
                                  <button nz-button (click)="tableColsSelect($event,data.meta)" [nzSize]="'small'">{{data.meta.behaviorMeta.clickBtnLabel}}</button>
                              </td>
                          </tr>
                          </tbody>
                      </nz-table>
                  </ng-template>
              </nz-transfer>
          </tis-ipt>
      </tis-form>
      <ng-template #drawerTemplate let-data let-drawerRef="drawerRef">

      </ng-template>
  `
  , styles: [
      `
    `
  ]
})
export class DataxAddStep4Component extends BasicDataXAddComponent implements OnInit, AfterViewInit {
  errorItem: Item = Item.create([]);
  // model = new Application(
  //   '', 'Lucene6.0', -1, new Crontab(), -1, ''
  // );
  model = new AppDesc();


  @ViewChild('drawerTemplate', {static: false}) drawerTemplate?: TemplateRef<{
    $implicit: { value: string };
    drawerRef: NzDrawerRef<string>;
  }>;

  transferList: TransferItem[] = [];

  // savePlugin = new EventEmitter<any>();

  // 可选的数据源
  readerDesc: Array<Descriptor> = [];
  writerDesc: Array<Descriptor> = [];

  subFormHetero: HeteroList = new HeteroList();

  constructor(tisService: TISService, modalService: NzModalService, private drawerService: NzDrawerService) {
    super(tisService, modalService);
  }

  ngOnInit(): void {
    // console.log(this.dto.readerDescriptor);
    PluginsComponent.initializePluginItems(this, this.getPluginMetas(),
      (success: boolean, hList: HeteroList[], _) => {
        // console.log(success);
        if (!success) {
          return;
        }
        // this._hList = hList;
        this.subFormHetero = hList[0];
        // console.log(this.subFormHetero);
        let desc: Descriptor = this.subFormHetero.descriptors.get(this.dto.readerDescriptor.impl);
        if (desc.subForm) {
          desc.subFormMeta.idList.forEach((subformId) => {
            this.transferList.push({
              key: subformId,
              title: subformId,
              direction: 'left',
              //   direction: (this.dto.coreNode.hosts.findIndex((host) => host.hostName === node.hostName) > -1 ? 'right' : 'left'),
              disabled: false,
              meta: Object.assign({id: `${subformId}`}, desc.subFormMeta)
            });
          });
          this.transferList = [...this.transferList];
          // console.log(this.transferList);
        }
      }
    );
  }

  private getPluginMetas(): PluginType[] {
    return [{
      name: "dataxReader", require: true
      , extraParam: `targetDescriptorName_${this.dto.readerDescriptor.displayName},subFormFieldName_selectedTabs,dataxName_${this.dto.dataxPipeName}`
    }];
  }

  ngAfterViewInit(): void {

  }


  convertItems(items: TransferItem[]): TransferItem[] {
    return items.filter(i => !i.hide);
    // return items;
  }

  // 执行下一步
  public createStepNext(): void {
    PluginsComponent.postHeteroList(this, this.getPluginMetas(), [this.subFormHetero], false, true, (result) => {
      if (result.success) {
        this.nextStep.emit(this.dto);
      }
    });
    // this.savePlugin.emit();

    // let dto = new DataxDTO();
    // dto.appform = this.readerDesc;
    // this.jsonPost('/coredefine/corenodemanage.ajax?action=datax_action&emethod=validate_reader_writer'
    //   , this.dto)
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

  afterSaveReader(response: PluginSaveResponse) {
    if (!response.saveSuccess) {
      return;
    }
    this.nextStep.emit(this.dto);
  }

  /**
   * 打开表列选择表单
   * @param event
   * @param data
   */
  tableColsSelect(event: MouseEvent, meta: ISubDetailTransferMeta) {

    let pluginMeta: PluginType[] = [{
      name: "dataxReader", require: true
      , extraParam: `targetDescriptorName_${this.dto.readerDescriptor.displayName},subFormFieldName_${meta.fieldName},dataxName_${this.dto.dataxPipeName}`
    }];
    // console.log(meta.id);
    let cachedVals = this.subFormHetero.items[0].vals[meta.id];
    if (cachedVals) {
      // console.log(cachedVals);
      let allHasFillEnums = true;
      for (let fieldKey in meta.behaviorMeta.onClickFillData) {
        // console.log(fieldKey);
        let pv: ItemPropVal = cachedVals[fieldKey];
        // console.log(pv.getEProp("enum"));
        if (!pv) {
          throw new Error(`fieldKey:${fieldKey} relevant ItemPropVal can not be null`);
        }
        let enums: Array<any> = pv.getEProp("enum");
        if (enums && enums.length < 1) {
          allHasFillEnums = false;
          break;
        }
      }

      if (allHasFillEnums) {
        let heteroList = DatasourceComponent.pluginDesc(this.subFormHetero.descriptorList[0]);
        heteroList[0].items[0].vals = cachedVals;
        this.openSubDetailForm(meta.id, pluginMeta, heteroList);
        event.stopPropagation();
        return;
      }
    }
    let metaParam = PluginsComponent.getPluginMetaParams(pluginMeta);
    // console.log(this.subFormHetero.descriptorList[0]);
    // let onClickMeta = meta.behaviorMeta.onClickFillData;
    // let param = onClickMeta.params.map(key => meta[key]).join(",");
    this.httpPost('/coredefine/corenodemanage.ajax'
      , 'action=plugin_action&emethod=subform_detailed_click&plugin=' + metaParam + "&id=" + meta.id)
      .then((r) => {
        // this.processResult(r);
        if (!r.success) {
          return;
        }

        let result = r.bizresult;

        let hlist: HeteroList[] = DatasourceComponent.pluginDesc(this.subFormHetero.descriptorList[0], (key, propVal) => {
          if (propVal.pk) {
            propVal.primary = meta.id;
          }
          if (result[key]) {
            let cols: Array<{ name: string, value: string }> = result[key];
            let enums = [];
            cols.forEach((s) => {
              enums.push({label: s.name, val: s.value})
            });
            propVal.setEProp("enum", enums);
          }
          return propVal;
        }, true);

        this.openSubDetailForm(meta.id, pluginMeta, hlist);
      });
    event.stopPropagation();
  }


  private openSubDetailForm(detailId: string, pluginMeta: PluginType[], hlist: HeteroList[]) {
    const drawerRef = this.drawerService.create<PluginSubFormComponent, { hetero: HeteroList[] }, { hetero: HeteroList }>({
      nzWidth: "35%",
      nzTitle: `Set ${detailId}`,
      nzContent: PluginSubFormComponent,
      nzContentParams: {
        pluginMeta: pluginMeta,
        hetero: hlist
      }
    });
    drawerRef.afterClose.subscribe(hetero => {
      if (!hetero) {
        return;
      }
      this.subFormHetero.items[0].vals[detailId] = hetero.hetero.items[0].vals;
    })
  }

  updateSingleChecked() {
  }


  transferChange(event: TransferChange) {
    let remove = (event.from === 'right');
    event.list.forEach((item) => {
      let meta: ISubDetailTransferMeta = item.meta;
      let itemVals = this.subFormHetero.items[0];
      if (remove) {
        delete itemVals.vals[meta.id]
      } else if (!itemVals.vals[meta.id]) {
        let hlist: HeteroList[] = DatasourceComponent.pluginDesc(this.subFormHetero.descriptorList[0], (key, propVal) => {
          if (propVal.pk) {
            propVal.primary = meta.id;
          }
          return propVal;
        }, true);
        // console.log(hlist[0].items[0].vals);
        itemVals.vals[meta.id] = hlist[0].items[0].vals;
      }
    });
  }
}

// 子记录点击详细显示
interface ISubDetailClickBehaviorMeta {
  clickBtnLabel: string;
  onClickFillData: { string: GetDateMethodMeta };
}

// meta: { id: string, behaviorMeta: ISubDetailClickBehaviorMeta, fieldName: string, idList: Array<string> }

interface ISubDetailTransferMeta {
  id: string;
  behaviorMeta: ISubDetailClickBehaviorMeta;
  fieldName: string;
  idList: Array<string>;
}

interface GetDateMethodMeta {
  method: string;
  params: Array<string>;
}


@Component({
  selector: 'nz-drawer-custom-component',
  template: `
      <sidebar-toolbar [deleteDisabled]="true" (close)="close()" (save)="_saveClick()"></sidebar-toolbar>
      <tis-plugins [pluginMeta]="pluginMeta" (ajaxOccur)="verifyPluginConfig($event)" [savePlugin]="savePlugin" [formControlSpan]="21"
                   [showSaveButton]="false" [shallInitializePluginItems]="false" [_heteroList]="hetero"></tis-plugins>
  `
})
export class PluginSubFormComponent {
  @Input() hetero: HeteroList[];
  @Input() pluginMeta: PluginType[];
  savePlugin = new EventEmitter<{ verifyConfig: boolean }>();

  constructor(public  drawer: NzDrawerRef<{ hetero: HeteroList }>) {
  }

  close(): void {
    this.drawer.close();
  }

  verifyPluginConfig(e: PluginSaveResponse) {
    if (e.saveSuccess) {
      this.drawer.close({hetero: this.hetero[0]});
    }
  }

  _saveClick() {
    this.savePlugin.emit({verifyConfig: true})
    // drawerRef.close();
  }
}


