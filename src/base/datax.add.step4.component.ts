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

import {AfterViewInit, Component, EventEmitter, Input, OnInit, TemplateRef, ViewChild} from "@angular/core";
import {TISService} from "../common/tis.service";
import {BasicFormComponent, CurrentCollection} from "../common/basic.form.component";
import {NzModalService} from "ng-zorro-antd/modal";
import {NzDrawerRef, NzDrawerService} from "ng-zorro-antd/drawer";
import {TransferChange, TransferDirection, TransferItem} from "ng-zorro-antd/transfer";
import {AttrDesc, Descriptor, HeteroList, Item, ItemPropVal, KEY_OPTIONS_ENUM, OptionEnum, PluginMeta, PluginSaveResponse, PluginType, SavePluginEvent, TisResponseResult, TYPE_PLUGIN_MULTI_SELECTION} from "../common/tis.plugin";
import {PluginsComponent} from "../common/plugins.component";
import {DataxDTO} from "./datax.add.component";
import {BasicDataXAddComponent, DATAX_PREFIX_DB} from "./datax.add.base";
import {ActivatedRoute, Router} from "@angular/router";
import {ExecModel} from "./datax.add.step7.confirm.component";
import {NzNotificationService} from "ng-zorro-antd/notification";

// 设置所选table的表以及 表的列
// 文档：https://angular.io/docs/ts/latest/guide/forms.html
@Component({
  // templateUrl: '/runtime/addapp.htm'
  selector: "datax-reader-table-select",
  template: `
      <tis-steps *ngIf="createModel && this.dto.headerStepShow" [type]="stepType" [step]="offsetStep(1)"></tis-steps>
      <nz-spin [nzSpinning]="this.formDisabled">
          <ng-container [ngSwitch]="createModel">
              <tis-steps-tools-bar [result]="this.result" *ngSwitchCase="true" [title]="'Reader 选择导入表'"
                                   (cancel)="cancel()" [goBackBtnShow]="_offsetStep>0" (goBack)="goback()" (goOn)="createStepNext()"></tis-steps-tools-bar>
              <tis-steps-tools-bar [result]="this.result" *ngSwitchCase="false">
                  <final-exec-controller *ngIf="!inReadonly">
                      <button nz-button [nzType]="'primary'" (click)="createStepNext()">保存</button>
                  </final-exec-controller>
              </tis-steps-tools-bar>
          </ng-container>

          <nz-transfer (nzChange)="transferChange($event)"
                       [nzDataSource]="transferList"
                       [nzDisabled]="inReadonly"
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
                          <th>表名
                              <button *ngIf="direction === 'right'" [disabled]="batchSettableTabs.length < 1 " nz-button nzType="primary" (click)="batchSet()" nzSize="small">批量设置</button>
                          </th>
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
                              <ng-container [ngSwitch]="subFormSetted( data.meta)">
                                  <nz-tag *ngSwitchCase="true" [nzColor]="'#87d068'"><i nz-icon nzType="check" nzTheme="outline"></i>已设置</nz-tag>
                                  <nz-tag *ngSwitchCase="false" [nzColor]="'#999999'"><i nz-icon nzType="warning" nzTheme="outline"></i>未设置</nz-tag>
                              </ng-container>
                              <!--                              <button nz-button (click)="tableColsSelect($event,data.meta)" [nzSize]="'small'">{{data.meta.behaviorMeta.clickBtnLabel}}</button>-->
                              <button nz-button (click)="tableColsSelect($event,data.meta)" [nzSize]="'small'">设置</button>
                          </td>
                      </tr>
                      </tbody>
                  </nz-table>
              </ng-template>
          </nz-transfer>
          <!--          <tis-form [formLayout]="formLayout" [fieldsErr]="errorItem" [labelSpan]="3" [controlerSpan]="19">-->
          <!--              <tis-ipt #selectTabs title="选择表" name="selectTabs" require="true">-->
          <!--              </tis-ipt>-->
          <!--          </tis-form>-->
          <ng-template #drawerTemplate let-data let-drawerRef="drawerRef">

          </ng-template>
      </nz-spin>
  `
  , styles: [
      `
    `
  ]
})
export class DataxAddStep4Component extends BasicDataXAddComponent implements OnInit, AfterViewInit {
  errorItem: Item = Item.create([]);
  @Input()
  execModel: ExecModel = ExecModel.Create;
  @Input()
  inReadonly = false;
  /**==========================
   * 子表单,保存历史记录
   ==========================*/
  subFieldForms: Map<string /*tableName*/, { string?: ItemPropVal }> = new Map();

  subFormHetero: HeteroList = new HeteroList();
  subFormItemSetterFlag: Map<string, boolean> = new Map();
  formLayout = "vertical";

  @ViewChild('drawerTemplate', {static: false}) drawerTemplate?: TemplateRef<{
    $implicit: { value: string };
    drawerRef: NzDrawerRef<string>;
  }>;

  transferList: TransferItem[] = [];

  get createModel(): boolean {
    return this.execModel === ExecModel.Create;
  }

  @Input()
  set dtoooo(dto: DataxDTO) {
    this.dto = dto;
  }

  // savePlugin = new EventEmitter<any>();

  // 可选的数据源
  readerDesc: Array<Descriptor> = [];
  writerDesc: Array<Descriptor> = [];

  public static dataXReaderSubFormPluginMeta(readerDescName: string, readerDescImpl: string, subformFieldName: string, dataXReaderTargetName: string): PluginType {
    return {
      name: "dataxReader", require: true
      , extraParam: `targetDescriptorImpl_${readerDescImpl},targetDescriptorName_${readerDescName},subFormFieldName_${subformFieldName},${dataXReaderTargetName}`
    };

    // return {
    //   name: "dataxReader", require: true
    //   , extraParam: `${dataXReaderTargetName}`
    // };
  }

  static processSubFormHeteroList(baseCpt: BasicFormComponent, pluginMeta: PluginType
    , meta: ISubDetailTransferMeta, subForm: { string?: ItemPropVal }): Promise<HeteroList[]> {
    let metaParam = PluginsComponent.getPluginMetaParams([pluginMeta]);
    return baseCpt.httpPost('/coredefine/corenodemanage.ajax'
      , 'action=plugin_action&emethod=subform_detailed_click&plugin=' + metaParam + "&id=" + meta.id)
      .then((r) => {
        if (!r.success) {
          return;
        }
        // if (subForm) {
        //   r.bizresult.items[0].vals = subForm;
        // }
        // console.log(r.bizresult);
        let h: HeteroList = PluginsComponent.wrapperHeteroList(r.bizresult, pluginMeta);
        //  console.log(h.items);
        // h.items[0].vals = subForm;
        // let subFormDesc: Descriptor = h.descriptorList[0];
        // let result: { [subFormFieldName: string]: Array<{ name: string, value: string }> } = {}; // r.bizresult;
        let hlist: HeteroList[] = [h];
        return hlist;
        // PluginsComponent.pluginDesc(subFormDesc, pluginMeta, (key, propVal: ItemPropVal) => {
        //     if (propVal.pk) {
        //       propVal.primary = meta.id;
        //       propVal.disabled = true;
        //       return propVal;
        //     }
        //     return propVal;
        //     // ==================================================
        //     // if (!subForm) {
        //     //   return propVal;
        //     // }
        //     // // console.log(subForm);
        //     // let rawProp: ItemPropVal = subForm[key];
        //     // let rawVal: any;
        //     //
        //     // if (propVal.type === TYPE_PLUGIN_MULTI_SELECTION) {
        //     //   let allCols: Array<{ val: string, label: string }> = propVal.getEProp(KEY_OPTIONS_ENUM);
        //     //   // console.log([key, result[key], subForm[key]]);
        //     //   let colItemChecked: (optVal) => boolean = (_) => true;
        //     //   // TODO:
        //     //   let fieldDesc: AttrDesc = subFormDesc.attrs.find((attr) => {
        //     //     return key === attr.key
        //     //   });
        //     //   if (!fieldDesc) {
        //     //     throw new Error(`fieldKey:${key} relevant AttrDesc can not be null`);
        //     //   }
        //     //   let selOpts: Array<OptionEnum> = [];
        //     //   // console.log(subForm);
        //     //   // rawProp = subForm[key];
        //     //
        //     //   // if (fieldDesc.isMultiSelectableType) {
        //     //   // let colItemChecked: (optVal) => boolean = (_) => true;
        //     //   selOpts = rawProp.getEProp(KEY_OPTIONS_ENUM) || [];
        //     //   // if (result[key]) {
        //     //   colItemChecked = (optVal) => (selOpts.findIndex((o) => (o.val === optVal)) > -1);
        //     //   // }
        //     //   //  propVal.setPropValEnums(result[key], colItemChecked);
        //     //   // } else {
        //     //   //   propVal.primary = rawProp.primary;
        //     //   // }
        //     //
        //     //   propVal.setPropValEnums(allCols.map((c) => {
        //     //     return {"name": c.label, "value": c.val}
        //     //   }), colItemChecked);
        //     // } else if (!propVal.primaryVal) {
        //     //   console.log([rawProp, propVal]);
        //     // } else {
        //     //
        //     //   if (subForm
        //     //     && (rawProp = subForm[key]) !== undefined
        //     //     && (rawVal = rawProp.primary) !== undefined
        //     //   ) {
        //     //     propVal.primary = rawVal;
        //     //   }
        //     // }
        //
        //     // if (result[key]) {
        //     //   // console.log([key, result[key], subForm[key]]);
        //     //   let colItemChecked: (optVal) => boolean = (_) => true;
        //     //   // TODO:
        //     //   let fieldDesc: AttrDesc = subFormDesc.attrs.find((attr) => {
        //     //     return key === attr.key
        //     //   });
        //     //   if (!fieldDesc) {
        //     //     throw new Error(`fieldKey:${key} relevant AttrDesc can not be null`);
        //     //   }
        //     //   let selOpts: Array<OptionEnum> = [];
        //     //   if (subForm) {
        //     //     rawProp = subForm[key];
        //     //
        //     //     if (fieldDesc.isMultiSelectableType) {
        //     //       // let colItemChecked: (optVal) => boolean = (_) => true;
        //     //       selOpts = rawProp.getEProp(KEY_OPTIONS_ENUM) || [];
        //     //       if (result[key]) {
        //     //         colItemChecked = (optVal) => (selOpts.findIndex((o) => (o.val === optVal)) > -1);
        //     //       }
        //     //       //  propVal.setPropValEnums(result[key], colItemChecked);
        //     //     } else {
        //     //       propVal.primary = rawProp.primary;
        //     //     }
        //     //   }
        //     //   propVal.setPropValEnums(result[key], colItemChecked);
        //     // } else {
        //
        //     // }
        //
        //   }, meta.setted);

      });
  }


  static initializeSubFieldForms(baseCpt: BasicFormComponent, pm: PluginType, readerDescriptorImpl: string
    , subFieldFormsCallback: (subFieldForms: Map<string /*tableName*/, { string?: ItemPropVal }>, subFormHetero: HeteroList, readDesc: Descriptor) => void) {
    PluginsComponent.initializePluginItems(baseCpt, [pm],
      (success: boolean, hList: HeteroList[], _) => {
        if (!success) {
          return;
        }
        let subFieldForms: Map<string /*tableName*/, { string?: ItemPropVal }> = new Map();
        let subFormHetero: HeteroList = hList[0];
        // console.log(subFormHetero);
        let item: Item = null;
        let subForm: { string?: ItemPropVal } = null;
        //  let desc: Descriptor = subFormHetero.descriptors.get(this.dto.readerDescriptor.impl);

        if (!readerDescriptorImpl) {
          item = subFormHetero.items[0];
          if (!item) {
            throw new Error("readerDescriptorImpl is undefined and first item also is undefined");
          }
          readerDescriptorImpl = item.impl;
        }

        if (!readerDescriptorImpl) {
          throw new Error("readerDescriptorImpl can not be undefined");
        }

        let desc: Descriptor = subFormHetero.descriptors.get(readerDescriptorImpl);
        if (!desc) {
          // console.log(subFormHetero.descriptors.keys());
          throw new Error("readerDescriptorImpl:" + readerDescriptorImpl);
        }
        for (let itemIdx = 0; itemIdx < subFormHetero.items.length; itemIdx++) {
          item = subFormHetero.items[itemIdx];
         // console.log(item);
          for (let tabKey in item.vals) {
            /**==========================
             *START: 删除历史脏数据保护措施
             ==========================*/
            if (desc.subForm) {
              if (desc.subFormMeta.idList.findIndex((existKey) => tabKey === existKey) < 0) {
                delete item.vals[tabKey];
                continue;
              }
            }
            /**==========================
             * END : 删除历史脏数据保护措施
             ==========================*/
            //  item.wrapItemVals();
            // @ts-ignore
            subForm = item.vals[tabKey];
            // Item.wrapItemPropVal(v, at);
            // console.log(subForm);
            subFieldForms.set(tabKey, subForm);
          }
          break;
        }

        if (!desc.subForm) {
          throw new Error("readerDescriptorImpl:" + readerDescriptorImpl + ",desc:" + desc.impl + " must has subForm");
        }


        subFieldFormsCallback(subFieldForms, subFormHetero, desc);

        // desc.subFormMeta.idList.forEach((subformId) => {
        //   let direction: TransferDirection = (this.subFieldForms.get(subformId) === undefined ? 'left' : 'right');
        //   this.transferList.push({
        //     key: subformId,
        //     title: subformId,
        //     direction: direction,
        //     disabled: false,
        //     meta: Object.assign({id: `${subformId}`}, desc.subFormMeta)
        //   });
        // });
        // this.transferList = [...this.transferList];


        // this.dto.componentCallback.step4.next(this);
      }
    );
  }

  constructor(tisService: TISService, modalService: NzModalService, private drawerService: NzDrawerService, r: Router, route: ActivatedRoute, notification: NzNotificationService) {
    super(tisService, modalService, r, route, notification);
  }

  subFormSetted(meta: ISubDetailTransferMeta): boolean {
    if (this.subFieldForms.get(meta.id) !== undefined) {
      return true;
    }
    return !!meta.setted;
  }

  ngOnInit(): void {
    this.formLayout = this.createModel ? "vertical" : "horizontal";
    super.ngOnInit();
  }

  protected initialize(app: CurrentCollection): void {

    // console.log(this.dto.readerDescriptor);
    DataxAddStep4Component.initializeSubFieldForms(this, this.getPluginMetas()[0], undefined // this.dto.readerDescriptor.impl
      , (subFieldForms: Map<string /*tableName*/, { string?: ItemPropVal }>, subFormHetero: HeteroList, readerDesc: Descriptor) => {
        // console.log(subFieldForms);
        this.subFieldForms = subFieldForms;
        this.subFormHetero = subFormHetero;
        readerDesc.subFormMeta.idList.forEach((subformId) => {
          let direction: TransferDirection = (this.subFieldForms.get(subformId) === undefined ? 'left' : 'right');
          this.transferList.push({
            key: subformId,
            title: subformId,
            direction: direction,
            disabled: false,
            meta: Object.assign({id: `${subformId}`}, readerDesc.subFormMeta)
          });
        });
        this.transferList = [...this.transferList];


        this.dto.componentCallback.step4.next(this);
      });

    // PluginsComponent.initializePluginItems(this, this.getPluginMetas(),
    //   (success: boolean, hList: HeteroList[], _) => {
    //     if (!success) {
    //       return;
    //     }
    //
    //     this.subFormHetero = hList[0];
    //     let item: Item = null;
    //     let subForm: { string?: ItemPropVal } = null;
    //     let desc: Descriptor = this.subFormHetero.descriptors.get(this.dto.readerDescriptor.impl);
    //
    //     for (let itemIdx = 0; itemIdx < this.subFormHetero.items.length; itemIdx++) {
    //       item = this.subFormHetero.items[itemIdx];
    //       for (let tabKey in item.vals) {
    //         /**==========================
    //          *START: 删除历史脏数据保护措施
    //          ==========================*/
    //         if (desc.subForm) {
    //           if (desc.subFormMeta.idList.findIndex((existKey) => tabKey === existKey) < 0) {
    //             delete item.vals[tabKey];
    //             continue;
    //           }
    //         }
    //         /**==========================
    //          * END : 删除历史脏数据保护措施
    //          ==========================*/
    //         // @ts-ignore
    //         subForm = item.vals[tabKey];
    //         // console.log(subForm);
    //         this.subFieldForms.set(tabKey, subForm);
    //       }
    //       break;
    //     }
    //     if (desc.subForm) {
    //       desc.subFormMeta.idList.forEach((subformId) => {
    //         let direction: TransferDirection = (this.subFieldForms.get(subformId) === undefined ? 'left' : 'right');
    //         this.transferList.push({
    //           key: subformId,
    //           title: subformId,
    //           direction: direction,
    //           disabled: false,
    //           meta: Object.assign({id: `${subformId}`}, desc.subFormMeta)
    //         });
    //       });
    //       this.transferList = [...this.transferList];
    //     }
    //
    //     this.dto.componentCallback.step4.next(this);
    //   }
    // );
  }

  private getPluginMetas(): PluginType[] {
    return [{
      name: "dataxReader", require: true
      , extraParam: `targetDescriptorImpl_${this.dto.readerDescriptor.impl},targetDescriptorName_${this.dto.readerDescriptor.displayName},subFormFieldName_selectedTabs,${this.getDataXReaderTargetName()},maxReaderTableCount_${!this.dto.writerDescriptor || (this.dto.writerDescriptor && this.dto.writerDescriptor.extractProps['supportMultiTable']) ? 9999 : 1}`
    }];
  }

  private getDataXReaderTargetName() {
    return this.dto.tablePojo ? (DATAX_PREFIX_DB + this.dto.tablePojo.dbName) : ("dataxName_" + this.dto.dataxPipeName);
  }

  ngAfterViewInit(): void {

  }


  convertItems(items: TransferItem[]): TransferItem[] {
    return items.filter(i => !i.hide);
    // return items;
  }

  // 执行下一步
  public createStepNext(): void {
    let savePluginEvent = new SavePluginEvent();
    savePluginEvent.notShowBizMsg = true;
    PluginsComponent.postHeteroList(this, this.getPluginMetas(), [this.subFormHetero], savePluginEvent, true, (result) => {
      if (result.success) {
        this.nextStep.emit(this.dto);
      } else {
        this.result = result;
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
    // console.log(meta);
    let pluginMeta: PluginType[]
      = [DataxAddStep4Component.dataXReaderSubFormPluginMeta(
      this.dto.readerDescriptor.displayName, this.dto.readerDescriptor.impl, meta.fieldName, this.getDataXReaderTargetName())];
    // console.log(meta.id);
    let ip = this.subFormHetero.items[0].vals[meta.id];
    if (ip instanceof ItemPropVal) {
      throw new Error("illegal type");
    }
    // console.log(ip);
    let cachedVals: { [key: string]: ItemPropVal } = ip;
    // console.log(cachedVals);
    if (cachedVals) {
      if (this.subFormItemSetterFlag.get(meta.id)) {
        let heteroList = PluginsComponent.pluginDesc(this.subFormHetero.descriptorList[0], pluginMeta[0]);
        heteroList[0].items[0].vals = cachedVals;
        this.openSubDetailForm(meta, pluginMeta, heteroList);
        // console.log(cachedVals);
        event.stopPropagation();
        return;
      }
    }

    // console.log([meta, this.subFieldForms.get(meta.id)], this.subFormHetero.descriptorList[0]);
    DataxAddStep4Component.processSubFormHeteroList(this, pluginMeta[0], meta, this.subFieldForms.get(meta.id) // , this.subFormHetero.descriptorList[0]
    ).then((hlist: HeteroList[]) => {
      // console.log(hlist[0].items[0]);
      this.openSubDetailForm(meta, pluginMeta, hlist);
    });

    // let metaParam = PluginsComponent.getPluginMetaParams(pluginMeta);
    // this.httpPost('/coredefine/corenodemanage.ajax'
    //   , 'action=plugin_action&emethod=subform_detailed_click&plugin=' + metaParam + "&id=" + meta.id)
    //   .then((r) => {
    //     if (!r.success) {
    //       return;
    //     }
    //     let subForm: { string?: ItemPropVal } = this.subFieldForms.get(meta.id);
    //     // console.log(meta.id);
    //     // console.log(this.subFieldForms);
    //     let result = r.bizresult;
    //     let desc = this.subFormHetero.descriptorList[0];
    //     let hlist: HeteroList[] = PluginsComponent.pluginDesc(desc, pluginMeta[0], (key, propVal: ItemPropVal) => {
    //       if (propVal.pk) {
    //         propVal.primary = meta.id;
    //         return propVal;
    //       }
    //       let rawProp: ItemPropVal;
    //       let rawVal: any;
    //       let colItemChecked: (optVal) => boolean = (_) => false;
    //       if (subForm && (rawProp = subForm[key]) !== undefined && (rawVal = rawProp.primary) !== undefined) {
    //         if (!(typeof rawVal === 'object')) {
    //           propVal.primary = rawVal;
    //         } else {
    //           let fieldDesc: AttrDesc = desc.attrs.find((attr) => {
    //             return key === attr.key
    //           });
    //           if (!fieldDesc) {
    //             throw new Error(`fieldKey:${key} relevant AttrDesc can not be null`);
    //           }
    //           // MULTI_SELECTABLE: please reference to com.qlangtech.tis.plugin.annotation.FormFieldType
    //           if (fieldDesc.isMultiSelectableType && result[key]) {
    //             // console.log(rawVal);
    //             if (!Array.isArray(rawVal)) {
    //               throw new Error(`rawProp must be a type of Array,but now is :${typeof rawVal}`);
    //             }
    //             let selectedItems: Array<any> = rawVal;
    //             colItemChecked = (optVal) => (selectedItems.indexOf(optVal) > -1);
    //           }
    //         }
    //       }
    //
    //       if (result[key]) {
    //         // TODO:
    //         propVal.setPropValEnums(result[key], colItemChecked);
    //       }
    //       return propVal;
    //     }, true);
    //
    //     this.openSubDetailForm(meta, pluginMeta, hlist);
    //   });
    event.stopPropagation();
  }


  private openSubDetailForm(meta: ISubDetailTransferMeta, pluginMeta: PluginType[], hlist: HeteroList[]) {
    let detailId: string = meta.id;
    // console.log(pluginMeta);
    pluginMeta = pluginMeta.map((pm) => {
      let m: PluginMeta = <any>pm;
      // 主要目的是将subFormPlugin的desc信息去除掉
      return {name: m.name, require: m.require, extraParam: m.extraParam + ",subformDetailIdValue_" + detailId};
    });
    const drawerRef = this.drawerService.create<PluginSubFormComponent, { hetero: HeteroList[] }, { hetero: HeteroList }>({
      nzWidth: "60%",
      nzTitle: `设置 ${detailId}`,
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
      meta.setted = true;
      // console.log(hetero.hetero.items[0].vals);
      // @ts-ignore
      this.subFormHetero.items[0].vals[detailId] = hetero.hetero.items[0].vals;
      this.subFormItemSetterFlag.set(detailId, true);
    });
  }

  get batchSettableTabs(): Array<ISubDetailTransferMeta> {
    let selected: ISubDetailTransferMeta[] = this.transferList.filter((t) => {
      if (t.direction !== 'right') {
        return false;
      }
      let meta: ISubDetailTransferMeta = t.meta;
      // console.log([meta.id, this.subFormHetero.items[0].vals[meta.id]]);
      return !this.subFormSetted(meta);
    }).map((t) => <ISubDetailTransferMeta>t.meta);
    return selected;
  }

  /**
   * 批量设置导入表，应对多表选择操作比较麻烦
   */
  batchSet() {
    let selected = this.batchSettableTabs;
    if (selected.length < 1) {
      this.errNotify("没有需要批量设置的表");
      return;
    }

    // console.log(selected);
    let pluginMetas = this.getPluginMetas();
    this.jsonPost('/offline/datasource.ajax?emethod=get_ds_tabs_vals&action=offline_datasource_action'
      , Object.assign({"tabs": selected.map((m) => m.id)}, pluginMetas[0]))
      .then((r: TisResponseResult) => {
        if (!r.success) {
          return;
        }
        let descMap = PluginsComponent.wrapDescriptors(r.bizresult.subformDescriptor);
        descMap.forEach((val, key) => {
          let subTabs: { string: any } = r.bizresult.tabVals;
          for (let tabName in subTabs) {

            let ii = new Item(val);
            ii.vals = subTabs[tabName];
            ii.wrapItemVals();
            this.subFormHetero.items[0].vals[tabName] = <{ [key: string]: ItemPropVal }>ii.vals;
            this.subFormItemSetterFlag.set(tabName, true);
          }
        });
        selected.forEach((meta) => meta.setted = true);
        this.successNotify("已经批量设置了" + selected.length + "张新表，接下来请保存");
      });


  }

  updateSingleChecked() {
  }


  transferChange(event: TransferChange) {
    let remove = (event.from === 'right');
    event.list.forEach((item) => {
      let meta: ISubDetailTransferMeta = item.meta;
      let itemVals = this.subFormHetero.items[0];
      if (remove) {
        meta.setted = false;
        this.subFieldForms.delete(meta.id);
        delete itemVals.vals[meta.id]
      } else if (!itemVals.vals[meta.id]) {
        let hlist: HeteroList[] = PluginsComponent.pluginDesc(this.subFormHetero.descriptorList[0], null, (key, propVal) => {
          if (propVal.pk) {
            propVal.primary = meta.id;
          }
          return propVal;
        }, true);
        // meta.setted = true;
        // console.log(hlist[0].items[0].vals);
        // @ts-ignore
        itemVals.vals[meta.id] = hlist[0].items[0].vals;
        // console.log(itemVals);
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

export interface ISubDetailTransferMeta {
  id: string;
  // behaviorMeta: ISubDetailClickBehaviorMeta;
  fieldName: string;
  idList: Array<string>;
  // 是否已经设置子表单
  setted: boolean;
}

interface GetDateMethodMeta {
  method: string;
  params: Array<string>;
}


@Component({
  // selector: 'nz-drawer-custom-component',
  template: `
      <sidebar-toolbar [deleteDisabled]="true" (close)="close()" (save)="_saveClick()"></sidebar-toolbar>
      <tis-plugins [getCurrentAppCache]="true" [pluginMeta]="pluginMeta" (ajaxOccur)="verifyPluginConfig($event)" [savePlugin]="savePlugin" [formControlSpan]="21"
                   [showSaveButton]="false" [shallInitializePluginItems]="false" [_heteroList]="hetero"></tis-plugins>
  `
})
export class PluginSubFormComponent {
  @Input() hetero: HeteroList[] = [];
  @Input() pluginMeta: PluginType[] = [];
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


