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

import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild} from "@angular/core";
import {TISService} from "../common/tis.service";
import {BasicFormComponent, CurrentCollection} from "../common/basic.form.component";
import {NzModalService} from "ng-zorro-antd/modal";
import {NzDrawerRef, NzDrawerService} from "ng-zorro-antd/drawer";
import {TransferChange, TransferDirection, TransferItem} from "ng-zorro-antd/transfer";
import {
    DATAX_PREFIX_DB,
    Descriptor,
    EXTRA_PARAM_DATAX_NAME,
    HeteroList,
    IFieldError,
    Item,
    ItemPropVal,
    PluginMeta,
    PluginSaveResponse,
    PluginType,
    SavePluginEvent,
    TisResponseResult
} from "../common/tis.plugin";
import {PluginsComponent} from "../common/plugins.component";
import {DataxDTO} from "./datax.add.component";
import {BasicDataXAddComponent} from "./datax.add.base";
import {ActivatedRoute, Router} from "@angular/router";
import {ExecModel} from "./datax.add.step7.confirm.component";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {KEY_subform_DetailIdValue} from "../common/plugin/type.utils";
import {PluginSubFormComponent} from "../common/selectedtab/plugin-sub-form.component";
import {dataXReaderSubFormPluginMeta, ISubDetailTransferMeta, processSubFormHeteroList} from "../common/ds.utils";

// import {PluginSubFormComponent} from "./selectedtab/plugin-sub-form.component";


enum TableSetterStatus {
  HasSetted = ('HasSetted'),
  HaveNotSetted = ('HaveNotSetted'),
  HasError = ('HasError')
}

@Component({
  selector: "selected-tables",
  template: `
    <nz-table #t [nzData]="convertItems(items)" [nzFrontPagination]="showPagination" nzSize="small">
      <thead>
      <tr>
        <th
          nzShowCheckbox
          [nzDisabled]="disabled"
          [nzChecked]="stat.checkAll"
          [nzIndeterminate]="stat.checkHalf"
          (nzCheckedChange)="_onItemSelectAll($event)"
        ></th>
        <th>表名
          <button *ngIf="direction === 'right'" [disabled]="batchSettableTabs.length < 1 " nz-button
                  nzType="primary"
                  (click)="batchSet()" nzSize="small">批量设置
          </button>

          <button *ngIf="direction === 'left'" nzSize="small" nz-button (click)="reload()"
                  style=" margin: 5px;">
            <i nz-icon nzType="reload" nzTheme="outline"></i>Reload
          </button>
        </th>
        <th *ngIf="direction === 'right'">操作</th>
      </tr>
      </thead>
      <tbody>
      <tr *ngFor="let data of t.data" (click)="_onItemSelect(data)">
        <td
          nzShowCheckbox
          [nzChecked]="data.checked"
          [nzDisabled]="disabled || data.disabled"
          (nzCheckedChange)="_onItemSelect(data)"
        ></td>
        <td>{{ data.title }}</td>
        <td *ngIf="direction === 'right'">
          <ng-container [ngSwitch]="subFormSetted( data.meta)">
            <nz-tag *ngSwitchCase="'HasError'" [nzColor]="'pink'"><i nz-icon nzType="check"
                                                                     nzTheme="outline"></i>设置有误
            </nz-tag>
            <nz-tag *ngSwitchCase="'HasSetted'" [nzColor]="'#87d068'"><i nz-icon nzType="check"
                                                                         nzTheme="outline"></i>已设置
            </nz-tag>
            <nz-tag *ngSwitchCase="'HaveNotSetted'" [nzColor]="'#999999'"><i nz-icon nzType="warning"
                                                                             nzTheme="outline"></i>未设置
            </nz-tag>
          </ng-container>
          <button nz-button (click)="tableColsSelect($event,data.meta)" [nzSize]="'small'">设置</button>
        </td>
      </tr>
      </tbody>
    </nz-table>
  `
})
export class SelectedTabsComponent extends BasicFormComponent {

  @Input()
  showPagination = true;

  @Input()
  items: TransferItem[];
  @Input()
  disabled: boolean;
  @Input()
  direction: string;
  // @Input()
  // public dto: DataxDTO;
  @Input()
  descriptor: Descriptor;
  @Input()
  batchSettableTabs: Array<ISubDetailTransferMeta> = [];
  @Input()
  pluginMetas: PluginType[];

  @Input()
  subFormHetero: HeteroList;
  @Input()
  skipSubformDescNullError = false;
  @Output()
  onItemSelectAll = new EventEmitter<any>();

  @Output()
  onReload = new EventEmitter<any>();

  @Output()
  onItemSelect = new EventEmitter<any>();

  @Input()
  stat: { checkAll: boolean, checkHalf: boolean } = {checkAll: false, checkHalf: false};

  @Input()
  subFieldForms: Map<string /*tableName*/, Array<Item>> = new Map();
  @Input()
  dataXReaderTargetName: string;

  /**
   * table 表单的错误信息
   */
  @Input()
  tabFormErrors: Map<string, Array<IFieldError>>;

  subFormItemSetterFlag: Map<string, boolean> = new Map();

  constructor(tisService: TISService, modalService: NzModalService, private drawerService: NzDrawerService, notification: NzNotificationService) {
    super(tisService, modalService, notification);
  }

  convertItems(items: TransferItem[]): TransferItem[] {
    return items.filter(i => !i.hide);
  }

  subFormSetted(meta: ISubDetailTransferMeta): TableSetterStatus {
    let errs: Array<IFieldError> = null;
    if (this.tabFormErrors && (errs = this.tabFormErrors.get(meta.id)) && Array.isArray(errs) && errs.length > 0) {
      return TableSetterStatus.HasError;
    }

    if (this.subFieldForms.get(meta.id) !== undefined) {
      return TableSetterStatus.HasSetted;
    }
    if (!!meta.setted) {
      return TableSetterStatus.HasSetted
    } else {
      return TableSetterStatus.HaveNotSetted;
    }
  }

  /**
   * 打开表列选择表单
   * @param event
   * @param data
   */
  tableColsSelect(event: MouseEvent, meta: ISubDetailTransferMeta) {
    if (!this.descriptor) {
      throw new Error("descriptor can not be null");
    }
    // ,targetItemDesc_batch_source_process_extend
      console.log([meta, this.dataXReaderTargetName,this.descriptor]);
    let detailId = meta.id;
    let pluginMeta: PluginType[]
      = [dataXReaderSubFormPluginMeta(
      this.descriptor.displayName, this.descriptor.impl, meta.fieldName
      , this.dataXReaderTargetName + "," + KEY_subform_DetailIdValue + "_" + detailId, this.skipSubformDescNullError)];
    // console.log(pluginMeta);
    let ip = this.subFormHetero.items[0].vals[meta.id];
    if (ip instanceof ItemPropVal) {
      throw new Error("illegal type");
    }

    // console.log(ip);
    let cachedVals: Array<Item> = <Array<Item>>ip;
    // console.log([this.subFormHetero.items[0],cachedVals,this.subFormItemSetterFlag.get(meta.id),Array.isArray(null)]);
    if (Array.isArray(cachedVals)) {
      if (this.subFormItemSetterFlag.get(meta.id)) {
        let heteroList = PluginsComponent.pluginDesc(this.subFormHetero.descriptorList[0], pluginMeta[0]);
        // heteroList[0].items[0].vals = cachedVals;
        heteroList[0].items = cachedVals;
        // console.log(heteroList);
        this.openSubDetailForm(meta, pluginMeta, heteroList);
        // console.log(cachedVals);
        event.stopPropagation();
        return;
      }
    }
    processSubFormHeteroList(this, pluginMeta[0], meta, this.subFieldForms.get(meta.id))
      .then((hlist: HeteroList[]) => {
        let h = hlist[0];

        let oitems = h.items;
        let items: Array<Item> = [];
        //  h.items = items;
        // console.log([oitems]);
        h.descriptorList.forEach((desc) => {

          for (let itemIdx = 0; itemIdx < oitems.length; itemIdx++) {
            if (oitems[itemIdx].impl === desc.impl) {
              items.push(oitems[itemIdx]);
              return;
            }
          }

          Descriptor.addNewItemByDescs(h, [desc], false, (_, propVal) => {
            if (propVal.pk) {
              propVal.primary = meta.id;
              propVal.updateModel = true;
            }
            return propVal;
          });
          //  console.log(h.items);
        });

        // if (h.items.length < 1) {
        //   // 当给增量流程流程扩展selectTab使用还没有item使用
        //   Descriptor.addNewItemByDescs(h, h.descriptorList, false, (_, propVal) => {
        //     if (propVal.pk) {
        //       propVal.primary = meta.id;
        //       propVal.updateModel = true;
        //     }
        //     return propVal;
        //   });
        // }
        //  console.log(hlist);
        this.openSubDetailForm(meta, pluginMeta, hlist);
      });
    event.stopPropagation();
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
    let pluginMetas = this.pluginMetas; // this.getPluginMetas();
    this.jsonPost('/offline/datasource.ajax?emethod=get_ds_tabs_vals&action=offline_datasource_action'
      , Object.assign({"tabs": selected.map((m) => m.id)}, pluginMetas[0]))
      .then((r: TisResponseResult) => {
        if (!r.success) {
          return;
        }

        let tabDesc = r.bizresult.subformDescriptor;
        let subTabs: { [Key: string]: Array<Item> } = r.bizresult.tabVals;
        // console.log(subTabs);
        for (let tabName in subTabs) {
          if (!tabDesc[tabName]) {
            throw new Error("table:" + tabName + " relevant descriptor can not be null")
          }
          // console.log(subTabs[tabName]);
          if (!Array.isArray(subTabs[tabName])) {
            throw new Error("subTabs[tabName] must be array,but now is:" + (typeof subTabs[tabName]));
          }
          let rawItems = new Map<string, Item>();
          let rawItem: Item;
          subTabs[tabName].forEach((item) => {
            rawItems.set(item.impl, item);
          })

          let descMap = Descriptor.wrapDescriptors(tabDesc[tabName]);
          let tabItems: Array<Item> = [];
          descMap.forEach((val, _) => {

            let ii = new Item(val);
            // if (Array.isArray(subTabs[tabName])) {
            //   ii.vals = subTabs[tabName][0].vals;
            // } else {
            //   throw new Error("subTabs[tabName] must be array,but now is:" + (typeof subTabs[tabName]));
            // }
            rawItem = rawItems.get(ii.impl);
            if (!rawItem) {
              throw new Error("impl:" + ii.impl + " relevant rawItem can not be null");
            }
            ii.vals = rawItem.vals;

            ii.wrapItemVals();
            // console.log([tabName, ii, ii.vals, subTabs[tabName], val, this.subFormHetero.items[0].vals]);
            // console.log([tabName, ii]);
            tabItems.push(ii);

            // }
          });
          // console.log(tabItems);
          this.subFormHetero.items[0].vals[tabName] = tabItems;
          this.subFormItemSetterFlag.set(tabName, true);
          //
        }


        // let descMap = PluginsComponent.wrapDescriptors(r.bizresult.subformDescriptor);
        // descMap.forEach((val, key) => {
        //   let subTabs: { string: any } = r.bizresult.tabVals;
        //   for (let tabName in subTabs) {
        //     let ii = new Item(val);
        //     ii.vals = subTabs[tabName];
        //     ii.wrapItemVals();
        //     // console.log([tabName, ii.vals, subTabs[tabName] , val]);
        //     this.subFormHetero.items[0].vals[tabName] = <{ [key: string]: ItemPropVal }>ii.vals;
        //     this.subFormItemSetterFlag.set(tabName, true);
        //   }
        // });
        selected.forEach((meta) => meta.setted = true);
        this.successNotify("已经批量设置了" + selected.length + "张新表，接下来请保存");
      });


  }

  private openSubDetailForm(meta: ISubDetailTransferMeta, pluginMeta: PluginType[], hlist: HeteroList[]) {
    let detailId: string = meta.id;
    // console.log(pluginMeta);
    pluginMeta = pluginMeta.map((pm) => {
      let m: PluginMeta = <any>pm;
      // 主要目的是将subFormPlugin的desc信息去除掉
      return {name: m.name, require: m.require, extraParam: m.extraParam};
    });
    // console.log([hlist,pluginMeta]);


    if (!this.tisService.currentApp) {

    }
 //this.dto;
    const drawerRef = this.drawerService.create<
      PluginSubFormComponent
      , { hetero: HeteroList[] }
      , { hetero: HeteroList }>({
      nzWidth: "80%",
      nzTitle: `设置 ${detailId}`,
      nzContent: PluginSubFormComponent,
      nzContentParams: {
        pluginMeta: pluginMeta,
        hetero: hlist,
        meta: meta,
        dataXReaderTargetName: this.dataXReaderTargetName
      }
    });
    drawerRef.afterClose.subscribe(hetero => {
      if (!hetero) {
        return;
      }
      meta.setted = true;
      this.subFormHetero.items[0].vals[detailId] = hetero.hetero.items;
      this.subFormItemSetterFlag.set(detailId, true);
    });
  }

  _onItemSelectAll(e: boolean) {
    this.onItemSelectAll.emit(e);
  }

  _onItemSelect(data: any) {
    this.onItemSelect.emit(data);
  }

  reload() {
    this.onReload.emit();
  }
}


// 设置所选table的表以及 表的列
// 文档：https://angular.io/docs/ts/latest/guide/forms.html
@Component({
  // templateUrl: '/runtime/addapp.htm'
  selector: "datax-reader-table-select",
  template: `
    <tis-steps *ngIf="createModel && this.dto.headerStepShow" [type]="stepType" [step]="0"></tis-steps>

    <nz-spin [nzSpinning]="this.formDisabled">
      <ng-container [ngSwitch]="createModel">
        <tis-steps-tools-bar [result]="this.result" *ngSwitchCase="true" [title]="'Reader 选择导入表'"
                             (cancel)="cancel()" [goBackBtnShow]="true" (goBack)="goback()"
                             (goOn)="createStepNext()"></tis-steps-tools-bar>
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
          <selected-tables (onReload)="this.reload()" [direction]="direction" [items]="items" [disabled]="disabled"
                           [descriptor]="this.dto.readerDescriptor" [batchSettableTabs]="batchSettableTabs"
                           [pluginMetas]="getPluginMetas()" [subFormHetero]="this.subFormHetero" [stat]="stat"
                           [subFieldForms]="subFieldForms"
                           [dataXReaderTargetName]="getDataXReaderTargetName" (onItemSelect)="onItemSelect($event)"
                           [tabFormErrors]="tabFormErrors"
                           (onItemSelectAll)="onItemSelectAll($event)"></selected-tables>
        </ng-template>
      </nz-transfer>
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
  subFieldForms: Map<string /*tableName*/, Array<Item>> = new Map();

  subFormHetero: HeteroList = new HeteroList();

  formLayout = "vertical";

  @ViewChild('drawerTemplate', {static: false}) drawerTemplate?: TemplateRef<{
    $implicit: { value: string };
    drawerRef: NzDrawerRef<string>;
  }>;

  transferList: TransferItem[] = [];

  // 可选的数据源
  readerDesc: Array<Descriptor> = [];
  writerDesc: Array<Descriptor> = [];
  tabFormErrors: Map<string, Array<IFieldError>>;

  // savePlugin = new EventEmitter<any>();






  /**
   *
   * @param baseCpt
   * @param pm
   * @param readerDescriptorImpl
   * @param useCache
   * @param subFieldFormsCallback
   */
  static initializeSubFieldForms(baseCpt: BasicFormComponent, pm: PluginType, readerDescriptorImpl: string
    , useCache: boolean
    , subFieldFormsCallback: (subFieldForms: Map<string /*tableName*/, Array<Item>>, subFormHetero: HeteroList, readDesc: Descriptor) => void): Promise<TisResponseResult> {
    // console.log(pm);
    return PluginsComponent.initializePluginItems(baseCpt, [pm],
      useCache, (success: boolean, hList: HeteroList[], _) => {
        if (!success) {
          return;
        }
        let subFieldForms: Map<string /*tableName*/, Array<Item>> = new Map();
        let subFormHetero: HeteroList = hList[0];
        // console.log(subFormHetero);
        let item: Item = null;
        let subForm: Array<Item> = null;
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
        //console.log([subFormHetero.descriptors,readerDescriptorImpl]);
        let desc: Descriptor = subFormHetero.descriptors.get(readerDescriptorImpl);
        if (!desc) {
          // console.log(subFormHetero.descriptors.keys());
          throw new Error("readerDescriptorImpl:" + readerDescriptorImpl);
        }

        for (let itemIdx = 0; itemIdx < subFormHetero.items.length; itemIdx++) {
          item = subFormHetero.items[itemIdx];
         // console.log([subFormHetero.items, itemIdx ,item]);
          for (let tabKey in item.vals) {
            /**==========================
             *START: 删除历史脏数据保护措施
             ==========================*/
            if (desc.subForm) {
              if (desc.subFormMeta.idList.findIndex((existKey) => tabKey === existKey) < 0) {
                delete item.vals[tabKey];
               //  console.log("continue");
                continue;
              }
            }
            /**==========================
             * END : 删除历史脏数据保护措施
             ==========================*/
            //  item.wrapItemVals();
            // @ts-ignore
            subForm = item.vals[tabKey];
            // console.log([tabKey, subForm]);
            // Item.wrapItemPropVal(v, at);
             console.log([tabKey,subForm]);
            subFieldForms.set(tabKey, subForm);
          }
          break;
        }

        if (!desc.subForm) {
          throw new Error("readerDescriptorImpl:" + readerDescriptorImpl + ",desc:" + desc.impl + " must has subForm");
        }

        // console.log(subFieldForms);
        subFieldFormsCallback(subFieldForms, subFormHetero, desc);
      }
    );
  }

  constructor(tisService: TISService, modalService: NzModalService, private drawerService: NzDrawerService, r: Router, route: ActivatedRoute, notification: NzNotificationService) {
    super(tisService, modalService, r, route, notification);
  }

  get createModel(): boolean {
    return this.execModel === ExecModel.Create;
  }

  @Input()
  set dtoooo(dto: DataxDTO) {
    this.dto = dto;
  }

  ngOnInit(): void {
    this.formLayout = this.createModel ? "vertical" : "horizontal";
    super.ngOnInit();
  }

  protected initialize(_: CurrentCollection): void {
    if (!_) {
      // 在新增模式下 currentApp 是为空的
      this.tisService.currentApp = new CurrentCollection(0, this.dto.dataxPipeName);
    }
  //  console.log(this.tisService.currentApp);
    // console.log(this.dto.readerDescriptor);
    this.initializeSubFieldForms(true)
      .catch((e)=>{
      console.log(e);
    });
  }

  private initializeSubFieldForms(useCache: boolean): Promise<TisResponseResult> {
   //console.log(useCache);
    return DataxAddStep4Component.initializeSubFieldForms(this, this.getPluginMetas()[0], undefined // this.dto.readerDescriptor.impl
      , useCache, (subFieldForms: Map<string /*tableName*/, Array<Item>>, subFormHetero: HeteroList, readerDesc: Descriptor) => {
        //  console.log([subFieldForms, subFormHetero]);
        this.subFieldForms = subFieldForms;
        this.subFormHetero = subFormHetero;
        this.transferList.splice(0);
       // console.log([this.subFieldForms,readerDesc.subFormMeta.idList,useCache]);
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
  }

  getPluginMetas(): PluginType[] {
    return [{
      name: "dataxReader",
      require: true
      ,
      extraParam: `targetDescriptorImpl_${this.dto.readerDescriptor.impl},targetDescriptorName_${this.dto.readerDescriptor.displayName},subFormFieldName_selectedTabs,${this.getDataXReaderTargetName},maxReaderTableCount_${!this.dto.writerDescriptor || (this.dto.writerDescriptor && this.dto.writerDescriptor.extractProps['supportMultiTable']) ? 9999 : 1}`
    }];
  }

  get getDataXReaderTargetName() {
    return this.dto.tablePojo ? (DATAX_PREFIX_DB + this.dto.tablePojo.dbName) : (EXTRA_PARAM_DATAX_NAME + this.dto.dataxPipeName);
  }

  ngAfterViewInit(): void {

  }


  // 执行下一步
  public createStepNext(): void {
    this.tabFormErrors = null;
    let savePluginEvent = new SavePluginEvent();
    savePluginEvent.notShowBizMsg = true;
    // console.log(this.subFormHetero.items[0].vals);
    PluginsComponent.postHeteroList(this, this.getPluginMetas(), [this.subFormHetero], savePluginEvent, true, (result) => {
      if (result.success) {
        this.nextStep.emit(this.dto);
      } else {
        // console.log(result);
        this.result = result;
        for (let i = 0; result.errorfields && i < result.errorfields.length; i++) {
          let tabs = [];
          for (let j = 0; j < result.errorfields[i].length; j++) {
            let errors = new Map<string, Array<IFieldError>>();
            for (let tabKey in result.errorfields[i][j]) {
              errors.set(tabKey, result.errorfields[i][j][tabKey])
              tabs.push(tabKey);
            }
            this.tabFormErrors = errors;
          }
          if (tabs.length > 0) {
            this.errNotify("表单:" + tabs.join(",") + "设置有误（可能表没有物理主键），请手动设置");
          }
//          console.log(this.tabFormErrors);
          break;
        }
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

  subFormSetted(meta: ISubDetailTransferMeta): boolean {
    if (this.subFieldForms.get(meta.id) !== undefined) {
      return true;
    }
    return !!meta.setted;
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


  reload() {
    this.initializeSubFieldForms(false).then((r) => {
      if (r.success) {
        this.notification.success("成功", "已经成功刷新列表");
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

interface GetDateMethodMeta {
  method: string;
  params: Array<string>;
}


