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

import {AfterViewInit, Component, EventEmitter, Input, OnInit, TemplateRef, ViewChild} from "@angular/core";
import {TISService} from "../common/tis.service";
import {CurrentCollection} from "../common/basic.form.component";
import {NzDrawerRef, NzDrawerService, NzModalService, TransferChange, TransferDirection, TransferItem} from "ng-zorro-antd";
import {AttrDesc, Descriptor, HeteroList, Item, ItemPropVal, PluginSaveResponse, PluginType} from "../common/tis.plugin";
import {PluginsComponent} from "../common/plugins.component";
import {DataxDTO} from "./datax.add.component";
import {BasicDataXAddComponent} from "./datax.add.base";
import {ActivatedRoute, Router} from "@angular/router";
import {ExecModel} from "./datax.add.step7.confirm.component";

// 设置所选table的表以及 表的列
// 文档：https://angular.io/docs/ts/latest/guide/forms.html
@Component({
  // templateUrl: '/runtime/addapp.htm'
  selector: "datax-reader-table-select",
  template: `
      <tis-steps *ngIf="createModel" [type]="stepType" [step]="offsetStep(1)"></tis-steps>
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
          <tis-form [formLayout]="formLayout" [fieldsErr]="errorItem" [labelSpan]="3" [controlerSpan]="19">

              <tis-ipt #selectTabs title="选择表" name="selectTabs" require="true">
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
                                      <ng-container [ngSwitch]="subFormSetted( data.meta)">
                                          <nz-tag *ngSwitchCase="true" [nzColor]="'#87d068'"><i nz-icon nzType="check" nzTheme="outline"></i>已设置</nz-tag>
                                          <nz-tag *ngSwitchCase="false" [nzColor]="'#999999'"><i nz-icon nzType="warning" nzTheme="outline"></i>未设置</nz-tag>
                                      </ng-container>
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

  subFormHetero: HeteroList = new HeteroList();

  constructor(tisService: TISService, modalService: NzModalService, private drawerService: NzDrawerService, r: Router, route: ActivatedRoute) {
    super(tisService, modalService, r, route);
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

    PluginsComponent.initializePluginItems(this, this.getPluginMetas(),
      (success: boolean, hList: HeteroList[], _) => {
        if (!success) {
          return;
        }

        this.subFormHetero = hList[0];
        // console.log(this.subFormHetero);
        let item: Item = null;
        let subForm: { string?: ItemPropVal } = null;
        let desc: Descriptor = this.subFormHetero.descriptors.get(this.dto.readerDescriptor.impl);

        for (let itemIdx = 0; itemIdx < this.subFormHetero.items.length; itemIdx++) {
          item = this.subFormHetero.items[itemIdx];
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
            // @ts-ignore
            subForm = item.vals[tabKey];
            // console.log(subForm);
            this.subFieldForms.set(tabKey, subForm);
          }
          break;
        }
        if (desc.subForm) {
          desc.subFormMeta.idList.forEach((subformId) => {
            let direction: TransferDirection = (this.subFieldForms.get(subformId) === undefined ? 'left' : 'right');
            this.transferList.push({
              key: subformId,
              title: subformId,
              direction: direction,
              disabled: false,
              meta: Object.assign({id: `${subformId}`}, desc.subFormMeta)
            });
          });
          this.transferList = [...this.transferList];
        }
      }
    );
  }

  private getPluginMetas(): PluginType[] {
    return [{
      name: "dataxReader", require: true
      , extraParam: `targetDescriptorName_${this.dto.readerDescriptor.displayName},subFormFieldName_selectedTabs,dataxName_${this.dto.dataxPipeName},maxReaderTableCount_${this.dto.writerDescriptor.extractProps['supportMultiTable'] ? 9999 : 1}`
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
    // console.log(this.subFormHetero);
    // console.log(this.tisService.currentApp);
    PluginsComponent.postHeteroList(this, this.getPluginMetas(), [this.subFormHetero], false, true, (result) => {
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

    let pluginMeta: PluginType[] = [{
      name: "dataxReader", require: true
      , extraParam: `targetDescriptorName_${this.dto.readerDescriptor.displayName},subFormFieldName_${meta.fieldName},dataxName_${this.dto.dataxPipeName}`
    }];
    // console.log(meta.id);
    let ip = this.subFormHetero.items[0].vals[meta.id];
    if (ip instanceof ItemPropVal) {
      throw new Error("illegal type");
    }
    let cachedVals: { [key: string]: ItemPropVal } = ip;
    if (cachedVals) {
      // console.log(cachedVals);
      let allHasFillEnums = false;
      for (let fieldKey in meta.behaviorMeta.onClickFillData) {
        // console.log(fieldKey);
        let pv: ItemPropVal = cachedVals[fieldKey];
        // console.log(pv.getEProp("enum"));
        if (!pv) {
          throw new Error(`fieldKey:${fieldKey} relevant ItemPropVal can not be null`);
        }
        // console.log(pv);
        let enums: Array<any> = pv.getEProp("enum");
        if (enums && enums.length > 0) {
          allHasFillEnums = true;
          break;
        }
        // console.log("allHasFillEnums：" + allHasFillEnums + " enums.length" + enums.length);
      }

      if (allHasFillEnums) {
        let heteroList = PluginsComponent.pluginDesc(this.subFormHetero.descriptorList[0]);
        heteroList[0].items[0].vals = cachedVals;
        this.openSubDetailForm(meta, pluginMeta, heteroList);
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
        if (!r.success) {
          return;
        }
        let subForm: { string?: ItemPropVal } = this.subFieldForms.get(meta.id);
        // console.log(meta.id);
        // console.log(this.subFieldForms);
        let result = r.bizresult;
        let desc = this.subFormHetero.descriptorList[0];
        let hlist: HeteroList[] = PluginsComponent.pluginDesc(desc, (key, propVal: ItemPropVal) => {
          if (propVal.pk) {
            propVal.primary = meta.id;
            return propVal;
          }
          let rawProp: ItemPropVal;
          let rawVal: any;
          let colItemChecked: (optVal) => boolean = (_) => false;
          if (subForm && (rawProp = subForm[key]) !== undefined && (rawVal = rawProp.primary) !== undefined) {
            if (!(typeof rawVal === 'object')) {
              propVal.primary = rawVal;
            } else {
              let fieldDesc: AttrDesc = desc.attrs.find((attr) => {
                return key === attr.key
              });
              if (!fieldDesc) {
                throw new Error(`fieldKey:${key} relevant AttrDesc can not be null`);
              }
              // MULTI_SELECTABLE: please reference to com.qlangtech.tis.plugin.annotation.FormFieldType
              if (fieldDesc.isMultiSelectableType && result[key]) {
                // console.log(rawVal);
                if (!Array.isArray(rawVal)) {
                  throw new Error(`rawProp must be a type of Array,but now is :${typeof rawVal}`);
                }
                let selectedItems: Array<any> = rawVal;
                colItemChecked = (optVal) => (selectedItems.indexOf(optVal) > -1);
              }
            }
          }

          if (result[key]) {
            // TODO:
            propVal.setPropValEnums(result[key], colItemChecked);
          }
          return propVal;
        }, true);

        this.openSubDetailForm(meta, pluginMeta, hlist);
      });
    event.stopPropagation();
  }


  private openSubDetailForm(meta: ISubDetailTransferMeta, pluginMeta: PluginType[], hlist: HeteroList[]) {
    let detailId: string = meta.id;
    const drawerRef = this.drawerService.create<PluginSubFormComponent, { hetero: HeteroList[] }, { hetero: HeteroList }>({
      nzWidth: "40%",
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

      // let ip = hetero.hetero.items[0].vals;
      // if (ip instanceof ItemPropVal) {
      //   throw new Error("illegal type");
      // }

      // @ts-ignore
      this.subFormHetero.items[0].vals[detailId] = hetero.hetero.items[0].vals;
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
        delete itemVals.vals[meta.id]
      } else if (!itemVals.vals[meta.id]) {
        let hlist: HeteroList[] = PluginsComponent.pluginDesc(this.subFormHetero.descriptorList[0], (key, propVal) => {
          if (propVal.pk) {
            propVal.primary = meta.id;
          }
          return propVal;
        }, true);
        // console.log(hlist[0].items[0].vals);
        // @ts-ignore
        itemVals.vals[meta.id] = hlist[0].items[0].vals;
        console.log(itemVals);
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


