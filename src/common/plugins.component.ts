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

import {AfterContentInit, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, Output} from "@angular/core";
import {TISService} from "../service/tis.service";
import {AppFormComponent, BasicFormComponent, CurrentCollection} from "../common/basic.form.component";

import {ActivatedRoute} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AttrDesc, HeteroList, IFieldError, PluginType, PluginSaveResponse, ValOption, PluginName, PluginMeta, DescribleVal, Item, TisResponseResult, Descriptor, ItemPropVal} from "./tis.plugin";
import {NzAnchorLinkComponent, NzModalService, NzNotificationService} from "ng-zorro-antd";
import {Subscription} from "rxjs";


@Component({
  selector: 'tis-plugins',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
      <ng-container *ngIf="this.showSaveButton">
          <!--编辑-->
          <tis-page-header *ngIf="this.errorsPageShow" [showBreadcrumb]="false" [result]="result">
          </tis-page-header>
          <nz-anchor *ngIf="showSaveButton" (nzScroll)="startScroll($event)">
              <div style="float: right;">
                  <button nz-button nzType="primary" (click)="savePluginSetting($event,false)">保存</button>
              </div>
              <div *ngIf="shallInitializePluginItems && this.itemChangeable" class="plugins-nav">
                  <nz-link *ngFor="let h of _heteroList" [nzHref]="'#'+h.identity" [nzTitle]="h.caption"></nz-link>
              </div>
              <div style="clear: both;margin-bottom:3px;"></div>
          </nz-anchor>
      </ng-container>
      <ng-template #pluginForm let-h="h">
          <div class="extension-point" [id]="h.identity">
              <nz-tag *ngIf="showExtensionPoint.open"><i nz-icon nzType="api" nzTheme="outline"></i>{{h.extensionPoint}}</nz-tag>
          </div>
          <div *ngFor=" let item of h.items" [ngClass]="{'item-block':shallInitializePluginItems}">
              <div style="float:right">
                  <nz-tag *ngIf="showExtensionPoint.open">{{item.impl}}</nz-tag>
                  <button *ngIf="shallInitializePluginItems && itemChangeable" (click)="removeItem(h,item)" nz-button nzType="link">
                      <i nz-icon nzType="close-square" nzTheme="fill" style="color:red;"></i>
                  </button>
              </div>
              <div>
                  <button *ngIf="item.dspt.veriflable" nz-button nzSize="small" (click)="configCheck($event)"><i nz-icon nzType="check" nzTheme="outline"></i>校验</button>
              </div>
              <div style="clear: both"></div>
              <item-prop-val [disabled]="disabled" [formControlSpan]="formControlSpan" [pp]="pp" *ngFor="let pp of item.propVals"></item-prop-val>
          </div>
      </ng-template>
      <form nz-form [ngSwitch]="shallInitializePluginItems">
          <nz-collapse *ngSwitchCase="true" [nzBordered]="false">
              <nz-collapse-panel *ngFor="let h of _heteroList" [nzHeader]="h.caption" [nzActive]="true" [nzDisabled]="!shallInitializePluginItems">
                  <ng-container *ngTemplateOutlet="pluginForm;context:{h:h}"></ng-container>
                  <ng-container *ngIf="shallInitializePluginItems && itemChangeable">
                      <button nz-button nz-dropdown [nzDropdownMenu]="menu" [disabled]="h.addItemDisabled">添加<i nz-icon nzType="down"></i></button>
                      <nz-dropdown-menu #menu="nzDropdownMenu">
                          <ul nz-menu>
                              <li nz-menu-item *ngFor="let d of h.descriptorList">
                                  <a href="javascript:void(0)" (click)="addNewPluginItem(h,d)">{{d.displayName}}</a>
                              </li>
                          </ul>
                      </nz-dropdown-menu>
                  </ng-container>
              </nz-collapse-panel>
          </nz-collapse>
          <ng-container *ngSwitchCase="false">
              <ng-container *ngFor="let h of _heteroList">
                  <ng-container *ngTemplateOutlet="pluginForm;context:{h:h}"></ng-container>
              </ng-container>
          </ng-container>
      </form>

      <!--
            {{this._heteroList | json}}
      -->
  `,
  styles: [
      `
          .extension-point {
              margin-bottom: 10px;
          }

          .item-block {
              border: 1px solid #9c9c9c;
              margin-bottom: 10px;
              padding: 5px;
          }

          .plugins-nav nz-link {
              display: inline-block;
          }

          nz-select {
              width: 100%;
          }
    `
  ]
})
export class PluginsComponent extends AppFormComponent implements AfterContentInit, AfterViewInit, OnDestroy {
  // private _incrScript: string;
  // @Output() nextStep = new EventEmitter<any>();
  // @Output() preStep = new EventEmitter<any>();
  // @Input() dto: IndexIncrStatus;
  // _validateForm: FormGroup;
  // 是否显示扩展点详细
  // @Input()
  // disabled = false;
  @Input()
  showExtensionPoint: { open: boolean } = {open: false};

  @Input()
  errorsPageShow = false;

  // 如果该插件用在DbAddComponent中作为添加组件用
  @Input()
  shallInitializePluginItems = true;

  @Input()
  itemChangeable = true;

  @Input()
  _heteroList: HeteroList[] = [];

  @Output()
  afterInit: EventEmitter<HeteroList[]> = new EventEmitter<HeteroList[]>();
  @Input()
  formControlSpan = 13;

  @Input() savePlugin: EventEmitter<{ verifyConfig: boolean }>;
  // 是否显示保存按钮
  @Input() showSaveButton = false;

  // 内部控件是否为只读
  @Input() disabled = false;

  subscription: Subscription;

  @Output() ajaxOccur = new EventEmitter<PluginSaveResponse>();
  @Output() afterSave = new EventEmitter<PluginSaveResponse>();
  private _plugins: PluginType[] = [];

  /**
   * 当前选中的DS plugin 描述信息
   * @param desc
   */
  public static pluginDesc(desc: Descriptor, itemPropSetter?: (key: string, propVal: ItemPropVal) => ItemPropVal, updateModel?: boolean): HeteroList[] {
    if (!desc) {
      throw new Error("param desc can not be null");
    }
    let h = new HeteroList();
    h.extensionPoint = desc.extendPoint;
    h.descriptors.set(desc.impl, desc);
    if (!itemPropSetter) {
      itemPropSetter = (_, p) => p;
    }
    Descriptor.addNewItem(h, desc, updateModel, itemPropSetter);
    // console.log(h);
    return [h];
  }

  public static openPluginInstanceAddDialog(b: BasicFormComponent, pluginDesc: Descriptor, pluginTp: PluginType, title: string, onSuccess: (biz) => void) {
    let modalRef = b.openDialog(PluginsComponent, {nzTitle: title});
    let addDb: PluginsComponent = modalRef.getContentComponent();
    addDb.errorsPageShow = true;
    addDb.formControlSpan = 20;
    addDb.shallInitializePluginItems = false;
    addDb._heteroList = PluginsComponent.pluginDesc(pluginDesc);
    addDb.setPluginMeta([pluginTp])
    addDb.showSaveButton = true;
    addDb.afterSave.subscribe((r: PluginSaveResponse) => {
      if (r && r.saveSuccess && r.hasBiz()) {
        modalRef.close();
        let db = r.biz();

        onSuccess(db);

        // let newNode: NzTreeNodeOptions[] = [{'key': `${db.dbId}`, 'title': db.name, 'children': []}];
        // this.nodes = newNode.concat(this.nodes);
        //
        // let e = {'type': 'db', 'id': `${db.dbId}`};
        // this.treeNodeClicked = true;
        // this.onEvent(e);
        //
        // this.notify.success("成功", `数据库${db.name}添加成功`, {nzDuration: 6000});
      }
    });
  }

  // /**
  //  *
  //  * @param h
  //  * @param des
  //  * @param updateModel 是否是更新模式，在更新模式下，插件的默认值不能设置到控件上去
  //  */
  // public static addNewItem(h: HeteroList, des: Descriptor, updateModel: boolean
  //   , itemPropSetter: (key: string, propVal: ItemPropVal) => ItemPropVal): void {
  //   let nItem = new Item(des);
  //   nItem.displayName = des.displayName;
  //   des.attrs.forEach((attr) => {
  //     nItem.vals[attr.key] = itemPropSetter(attr.key, attr.addNewEmptyItemProp(updateModel));
  //   });
  //   let nitems: Item[] = [];
  //   h.items.forEach((r) => {
  //     nitems.push(r);
  //   });
  //   // console.log(nItem);
  //   nitems.push(nItem);
  //   h.items = nitems;
  // }

  public static getPluginMetaParams(pluginMeta: PluginType[]): string {
    return pluginMeta.map((p) => {
      let param: any = p;
      if (param.name) {
        let t: PluginMeta = param;
        return `${t.name}:${t.require ? 'require' : ''}${t.extraParam ? ',' + t.extraParam : ''}`
      } else {
        return p;
      }
    }).join("&plugin=");
  }

  public static wrapperHeteroList(he: HeteroList): HeteroList {
    let h: HeteroList = Object.assign(new HeteroList(), he);
    let descMap = PluginsComponent.wrapDescriptors(h.descriptors);
    // console.log(descMap);
    h.descriptors = descMap;
    // 遍历item
    let items: Item[] = [];
    let i: Item;
    h.items.forEach((item) => {

      let desc: Descriptor = h.descriptors.get(item.impl);

      if (desc.subForm) {
        i = new Item(desc); // Object.assign(, {"displayName": item.displayName}, {"vals": subFormVals});
        i.displayName = item.displayName;
        let rawVal = item.vals;
        // delete item.vals;
        let subFrom;
        let subFormVals: { [tabname: string]: { [propKey: string]: ItemPropVal } } = {};
        for (let subFieldPk in rawVal) {
          subFrom = rawVal[subFieldPk];
          let ii = new Item(desc);
          ii.vals = subFrom;
          ii.wrapItemVals();
          // console.log(i.itemVals);
          // @ts-ignore
          subFormVals[subFieldPk] = ii.vals;
          // console.log({pk: subFieldPk, subForm: subFrom});
          // console.log([typeof subFieldPk, subFieldPk, subFormVals]);
          // // @ts-ignore subFieldPk
          // i.vals["kkkk"] = new ItemPropVal(); // ii.itemVals;
          // console.log(i);
        }
        i.vals = subFormVals;


        // let a = {"aaa": new ItemPropVal()};
        //
        // let vvals: { [key: string]: ItemPropVal } | { string?: { string?: ItemPropVal } } = {};
        //
        // vvals = a;
        //
        // i.vals = a;
        // for (let key in i) {
        //   console.log({key: key, 'val': i[key]});
        // }
        // console.log(i);
      } else {
        i = Object.assign(new Item(desc), item);
        i.wrapItemVals();
      }
      items.push(i);
    });
    // console.log(items[0].itemVals);
    h.items = items;
    return h;
  }

  public static initializePluginItems(ctx: BasicFormComponent, pm: PluginType[]
    , callback: (success: boolean, _heteroList: HeteroList[], showExtensionPoint: boolean) => void) {
    let pluginMeta = PluginsComponent.getPluginMetaParams(pm);
    let url = '/coredefine/corenodemanage.ajax?event_submit_do_get_plugin_config_info=y&action=plugin_action&plugin=' + pluginMeta;

    ctx.jsonPost(url, {}).then((r) => {
      let _heteroList: HeteroList[] = [];
      if (r.success) {
        let bizArray: HeteroList[] = r.bizresult.plugins;
        bizArray.forEach((he) => {
          let h: HeteroList = PluginsComponent.wrapperHeteroList(he); // Object.assign(new HeteroList(), he);
          _heteroList.push(h);
        });
      }

      // console.log(_heteroList);
      callback(r.success, _heteroList, r.bizresult.showExtensionPoint);

      // this.ajaxOccur.emit(new PluginSaveResponse(false, false));
    }).catch((e) => {
      // console.log("================ error occur");
      // this.ajaxOccur.emit(new PluginSaveResponse(false, false));
      callback(false, null, false);
      throw new Error(e);
    });
  }

  public static wrapDescriptors(descriptors: Map<string /* impl */, Descriptor>)
    : Map<string /* impl */, Descriptor> {
    let descMap: Map<string /* impl */, Descriptor> = new Map();
    let d: Descriptor = null;
    let attrs: AttrDesc[];
    let attr: AttrDesc;
    for (let impl in descriptors) {
      d = Object.assign(new Descriptor(), descriptors[impl]);
      attrs = [];
      d.attrs.forEach((a) => {
        attr = Object.assign(new AttrDesc(), a);
        if (attr.describable) {
          attr.descriptors = this.wrapDescriptors(attr.descriptors);
        }
        if (attr.options) {
          let opts: ValOption[] = [];
          attr.options.forEach((opt) => {
            opts.push(Object.assign(new ValOption(), opt));
          });
          attr.options = opts;
        }
        attrs.push(attr);
      });
      d.attrs = attrs;
      descMap.set(impl, d);
    }
    return descMap;
  }


  public static postHeteroList(basicModule: BasicFormComponent, pluginMetas: PluginType[], heteroList: HeteroList[]
    , verifyConfig: boolean, errorsPageShow: boolean, processCallback: (r: TisResponseResult) => void, errProcessCallback?: (r: TisResponseResult) => void): void {
    let pluginMeta = PluginsComponent.getPluginMetaParams(pluginMetas);


    let url = `/coredefine/corenodemanage.ajax?event_submit_do_save_plugin_config=y&action=plugin_action&plugin=${pluginMeta}&errors_page_show=${errorsPageShow}&verify=${verifyConfig}`;

    let postData: Array<Item[]> = [];
    heteroList.forEach((h) => {
      postData.push(h.items);
    });

    basicModule.jsonPost(url, postData).then((r) => {
      processCallback(r);
    }).catch((e) => {
      if (errProcessCallback) {
        errProcessCallback(e);
      }
    });
  }


  configCheck(event: MouseEvent) {
    this.savePluginSetting(event, true);
  }

  @Input()
  set plugins(metas: PluginType[]) {
    // console.log(metas);
    this.setPluginMeta(metas);
    if (!this.shallInitializePluginItems) {
      this.initializePluginItems();
    }
  }

  @Input()
  set pluginMeta(metas: PluginType[]) {
    this.setPluginMeta(metas);
  }

  public setPluginMeta(metas: PluginType[]): void {
    if (!metas || metas.length < 1) {
      return;
    }
    this._plugins = metas;
  }

  get plugins(): PluginType[] {
    return this._plugins;
  }


  constructor(tisService: TISService, route: ActivatedRoute, modalService: NzModalService
    , notification: NzNotificationService
    , private cdr: ChangeDetectorRef) {
    super(tisService, route, modalService, notification);
    this.cdr.detach();
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }


  ngAfterContentInit(): void {
    if (this.savePlugin) {
      this.subscription = this.savePlugin.subscribe((e: { verifyConfig: boolean }) => {
        this.savePluginSetting(null, e && !!e.verifyConfig);
      });
    }
    this.ajaxOccur.emit(new PluginSaveResponse(false, true));
    // let component = 'mq';
    if (this.shallInitializePluginItems) {
      if (!this.plugins || this.plugins.length < 1) {
        throw new Error("plugin argument can not be null");
      }
      this.initializePluginItems();
    } else {
      this.cdr.reattach();
      this.cdr.detectChanges();
    }
  }


  public initializePluginItems() {
    PluginsComponent.initializePluginItems(this, this.plugins, (success: boolean, hList: HeteroList[], showExtensionPoint: boolean) => {
      if (success) {
        this.showExtensionPoint.open = showExtensionPoint;
        this._heteroList = hList;
        this.afterInit.emit(this._heteroList);
        this.cdr.reattach();
        this.cdr.detectChanges();
      }

      this.ajaxOccur.emit(new PluginSaveResponse(success, false));
    });

    // let pluginMeta = this.getPluginMetaParams();
    // let url = '/coredefine/corenodemanage.ajax?event_submit_do_get_plugin_config_info=y&action=plugin_action&plugin=' + pluginMeta;
    //
    // this.jsonPost(url, {}).then((r) => {
    //   this._heteroList = [];
    //   if (r.success) {
    //     this.showExtensionPoint.open = r.bizresult.showExtensionPoint;
    //     let bizArray: HeteroList[] = r.bizresult.plugins;
    //     bizArray.forEach((he) => {
    //       let h: HeteroList = Object.assign(new HeteroList(), he);
    //       let descMap = PluginsComponent.wrapDescriptors(h.descriptors);
    //       // console.log(descMap);
    //       h.descriptors = descMap;
    //       // 遍历item
    //       let items: Item[] = [];
    //       let i: Item;
    //       h.items.forEach((item) => {
    //
    //         let desc: Descriptor = h.descriptors.get(item.impl);
    //         i = Object.assign(new Item(desc), item);
    //
    //         i.wrapItemVals();
    //         items.push(i);
    //       });
    //
    //       h.items = items;
    //       this._heteroList.push(h);
    //     });
    //     this.afterInit.emit(this._heteroList);
    //     this.cdr.reattach();
    //     this.cdr.detectChanges();
    //   }
    //   this.ajaxOccur.emit(new PluginSaveResponse(false, false));
    // }).catch((e) => {
    //   // console.log("================ error occur");
    //   this.ajaxOccur.emit(new PluginSaveResponse(false, false));
    //   throw new Error(e);
    // });
  }


  submitForm(value: any): void {
    // for (const key in this._validateForm.controls) {
    //   this._validateForm.controls[key].markAsDirty();
    //   this._validateForm.controls[key].updateValueAndValidity();
    // }
    // console.log(value);
  }


  // get validateForm(): FormGroup {
  //   return this._validateForm;
  // }

// get incrScript(): string {
  //   return this._incrScript;
  // }
  //
  // set incrScript(value: string) {
  //   this._incrScript = value;
  // }
  protected initialize(app: CurrentCollection): void {
  }


  savePluginSetting(event: MouseEvent, verifyConfig: boolean) {
    // console.log(JSON.stringify(this._heteroList.items));
    this.ajaxOccur.emit(new PluginSaveResponse(false, true));
    // console.log(this.plugins);
    // let pluginMeta = PluginsComponent.getPluginMetaParams(this.plugins);


    PluginsComponent.postHeteroList(this, this.plugins, this._heteroList, verifyConfig, this.errorsPageShow, (r) => {
      // 成功了
      this.ajaxOccur.emit(new PluginSaveResponse(r.success, false));
      if (!verifyConfig) {
        this.afterSave.emit(new PluginSaveResponse(r.success, false, r.bizresult));
      } else {
        if (r.success) {
          this.notification.create('success', '校验成功', "表单配置无误");
        }
      }
      if (!this.errorsPageShow && r.success) {
        // 如果在其他流程中嵌入执行（showSaveButton = false） 一般不需要显示成功信息
        if (this.showSaveButton && r.msg.length > 0) {
          this.notification.create('success', '成功', r.msg[0]);
        }
        return;
      }

      this.processResult(r);
      this.cdr.detectChanges();
      let pluginErrorFields = r.errorfields;
      // console.log(pluginErrorFields);
      let index = 0;
      // let tmpHlist: HeteroList[] = [];
      this._heteroList.forEach((h) => {
        let items: Item[] = h.items;
        let errorFields = pluginErrorFields[index++];
        Item.processErrorField(errorFields, items);
      });
      this.cdr.detectChanges();
    }, (err) => {
      this.ajaxOccur.emit(new PluginSaveResponse(false, false));
    });


    // let url = `/coredefine/corenodemanage.ajax?event_submit_do_save_plugin_config=y&action=plugin_action&plugin=${pluginMeta}&errors_page_show=${this.errorsPageShow}&verify=${verifyConfig}`;
    //
    // let postData: Array<Item[]> = [];
    // this._heteroList.forEach((h) => {
    //   postData.push(h.items);
    // });
    //
    // this.jsonPost(url, postData).then((r) => {
    //   // 成功了
    //   this.ajaxOccur.emit(new PluginSaveResponse(r.success, false));
    //   if (!verifyConfig) {
    //     this.afterSave.emit(new PluginSaveResponse(r.success, false, r.bizresult));
    //   } else {
    //     if (r.success) {
    //       this.notification.create('success', '校验成功', "表单配置无误");
    //     }
    //   }
    //   if (!this.errorsPageShow && r.success) {
    //     // 如果在其他流程中嵌入执行（showSaveButton = false） 一般不需要显示成功信息
    //     if (this.showSaveButton && r.msg.length > 0) {
    //       this.notification.create('success', '成功', r.msg[0]);
    //     }
    //     return;
    //   }
    //
    //   this.processResult(r);
    //   this.cdr.detectChanges();
    //   let pluginErrorFields = r.errorfields;
    //   // console.log(pluginErrorFields);
    //   let index = 0;
    //   // let tmpHlist: HeteroList[] = [];
    //   this._heteroList.forEach((h) => {
    //     let items: Item[] = h.items;
    //     let errorFields = pluginErrorFields[index++];
    //     PluginsComponent.processErrorField(errorFields, items);
    //   });
    //   this.cdr.detectChanges();
    // }).catch((e) => {
    //   this.ajaxOccur.emit(new PluginSaveResponse(false, false));
    // });

    if (event) {
      event.stopPropagation();
    }
  }

  removeItem(hlist: HeteroList, i: Item) {
    let arr = hlist.items;
    let newArr: Item[] = [];
    arr.forEach(function (e) {
      if (e !== i) {
        newArr.push(e);
      }
    });
    hlist.items = newArr;
  }


  reload() {

  }

  startScroll(event: NzAnchorLinkComponent) {
    // console.log(event);
  }

  addNewPluginItem(h: HeteroList, d: Descriptor) {
    Descriptor.addNewItem(h, d, false, (_, propVal) => propVal);
  }


}

// 如果不加这个component的话在父组件中添加一个新的item，之前已经输入值的input控件上的值就会消失，确实很奇怪
@Component({
  selector: 'item-prop-val',
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
      <nz-form-item>
          <nz-form-label [nzSpan]="3" [nzRequired]="_pp.required">  {{_pp.label}}<i *ngIf="descContent" nz-icon nzType="question-circle" nzTheme="twotone" (click)="toggleDescContentShow()"></i></nz-form-label>
          <nz-form-control [nzSpan]="formControlSpan" [nzValidateStatus]="_pp.validateStatus" [nzHasFeedback]="_pp.hasFeedback" [nzErrorTip]="_pp.error">
              <span [ngClass]="{'has-help-url': !this.disabled && (helpUrl !== null || createRouter !== null)}" [ngSwitch]="_pp.type">
                  <ng-container *ngSwitchCase="1">
                      <input *ngIf="_pp.primaryVal" nz-input [disabled]="disabled" [(ngModel)]="_pp.primary" [name]="_pp.key" (ngModelChange)="inputValChange(_pp,$event)" [placeholder]="_pp.placeholder"/>
                  </ng-container>
                  <ng-container *ngSwitchCase="4">
                       <nz-input-number [disabled]="disabled" *ngIf="_pp.primaryVal" [(ngModel)]="_pp.primary" [name]="_pp.key" (ngModelChange)="inputValChange(_pp,$event)"></nz-input-number>
                  </ng-container>
                  <ng-container *ngSwitchCase="2">
                      <ng-container [ngSwitch]="_pp.getEProp('style')">
                          <tis-codemirror class="ant-input" *ngSwitchCase="'codemirror'" (change)="inputValChange(_pp,$event)" [(ngModel)]="_pp.primary" [config]="{ mode:_pp.getEProp('mode'), lineNumbers: false}" [size]="{width:'100%',height:_pp.getEProp('rows')*20}"></tis-codemirror>
                          <textarea *ngSwitchDefault [disabled]="disabled" [rows]="_pp.getEProp('rows')" nz-input [(ngModel)]="_pp.primary" [name]="_pp.key"
                                    (ngModelChange)="inputValChange(_pp,$event)" [placeholder]="_pp.placeholder"></textarea>
                      </ng-container>
                  </ng-container>
                  <ng-container *ngSwitchCase="3">
                      <!--date-->
                      <input [disabled]="disabled" *ngIf="_pp.primaryVal" nz-input [(ngModel)]="_pp.primary" [name]="_pp.key" (ngModelChange)="inputValChange(_pp,$event)"/>
                  </ng-container>
                  <ng-container *ngSwitchCase="5">
                      <!--ENUM-->
                      <nz-select [disabled]="disabled" [(ngModel)]="_pp.primary" [name]="_pp.key" (ngModelChange)="inputValChange(_pp,$event)" nzAllowClear>
                           <nz-option *ngFor="let e of _pp.getEProp('enum')" [nzLabel]="e.label" [nzValue]="e.val"></nz-option>
                       </nz-select>
                  </ng-container>
                  <ng-container *ngSwitchCase="6">
                      <nz-select [disabled]="disabled" [(ngModel)]="_pp.primary" [name]="_pp.key" (ngModelChange)="inputValChange(_pp,$event)" nzAllowClear>
                           <nz-option *ngFor="let e of _pp.options" [nzLabel]="e.name" [nzValue]="e.name"></nz-option>
                       </nz-select>
                  </ng-container>
                  <ng-container *ngSwitchCase="7">
                      <!--PASSWORD-->
    <nz-input-group [nzSuffix]="suffixTemplate">
      <input [disabled]="disabled" [type]="passwordVisible ? 'text' : 'password'" nz-input placeholder="input password" *ngIf="_pp.primaryVal" nz-input [(ngModel)]="_pp.primary" [name]="_pp.key" (ngModelChange)="inputValChange(_pp,$event)"/>
    </nz-input-group>
    <ng-template #suffixTemplate>
      <i nz-icon [nzType]="passwordVisible ? 'eye-invisible' : 'eye'" (click)="passwordVisible = !passwordVisible"></i>
    </ng-template>
                  </ng-container>
                 <ng-container *ngSwitchCase="8">
                     <label nz-checkbox [(ngModel)]="_pp._eprops['allChecked']" (ngModelChange)="updateAllChecked(_pp)" [nzIndeterminate]="_pp._eprops['indeterminate']">全选</label> <br/>
                      <nz-checkbox-group [ngModel]="_pp.getEProp('enum')" (ngModelChange)="updateSingleChecked(_pp)"></nz-checkbox-group>
                 </ng-container>
              </span>
              <a *ngIf="this.helpUrl" target="_blank" [href]="this.helpUrl"><i nz-icon nzType="question-circle" nzTheme="outline"></i></a>
              <ng-container *ngIf="this.createRouter && !this.disabled">
                  <button class="assist-btn" nz-button nz-dropdown nzSize="small" nzType="link" [nzDropdownMenu]="menu">{{createRouter.label}}<i nz-icon nzType="down"></i></button>
                  <nz-dropdown-menu #menu="nzDropdownMenu">
                      <ul nz-menu>
                          <li nz-menu-item>
                              <a target="_blank" [href]="createRouter.routerLink"><i nz-icon nzType="link" nzTheme="outline"></i>管理</a>
                          </li>
                          <li nz-menu-item *ngFor="let p of createRouter.plugin">
                              <a (click)="openPluginDialog(_pp , p )"><i nz-icon nzType="plus" nzTheme="outline"></i>{{createRouter.plugin.length > 1 ? p.descName : '添加'}}</a>
                          </li>
                      </ul>
                  </nz-dropdown-menu>
              </ng-container>
              <nz-alert *ngIf="descContent && descContentShow" nzType="info" [nzDescription]="descContent" nzCloseable></nz-alert>
              <nz-select *ngIf="!_pp.primaryVal" [name]="_pp.key" nzAllowClear [(ngModel)]="_pp.descVal.impl" (ngModelChange)="changePlugin(_pp,$event)">
                  <nz-option *ngFor="let e of _pp.descVal.descriptors.values()" [nzLabel]="e.displayName" [nzValue]="e.impl"></nz-option>
              </nz-select>
          </nz-form-control>
          <div *ngIf="!_pp.primaryVal" class="sub-prop">
              <!-- {{_pp.descVal.propVals|json}} -->
              <item-prop-val [pp]="pp" *ngFor="let pp of _pp.descVal.propVals"></item-prop-val>
          </div>
      </nz-form-item>  `,
  styles: [
      `
          .assist-btn i {
              margin-left: 2px;
          }

          .sub-prop {
              clear: both;
              margin-left: 50px;
              background-color: #eeeeee;
          }

          .has-help-url {
              width: calc(100% - 10em);
              display: inline-block;
          }
    `
  ]
})
export class ItemPropValComponent extends BasicFormComponent implements AfterContentInit {
  _pp: ItemPropVal;

  passwordVisible = false;

  helpUrl: string = null;
  _disabled = false;
  createRouter: CreatorRouter = null;
  descContent: string = null;
  descContentShow = false;

  @Input()
  set disabled(val: boolean) {
    this._disabled = val;
  }

  @Input()
  formControlSpan = 13;

  constructor(tisService: TISService, modalService: NzModalService) {
    super(tisService, modalService);
  }

  get disabled(): boolean {
    return (this._pp && this._pp.pk && this._pp.updateModel) || this._disabled;
  }


  @Input() set pp(item: ItemPropVal) {
    this._pp = item;
    let hUrl = item.getEProp('helpUrl');
    if (hUrl) {
      this.helpUrl = hUrl;
    }

    let descContent = item.getEProp('help');
    if (descContent) {
      this.descContent = descContent;
    }

    let creator = item.getEProp("creator");
    if (creator) {
      this.createRouter = creator;
    }
  }

  openPluginDialog(_pp: ItemPropVal, targetPlugin: TargetPlugin) {
    // PluginsComponent.openPluginInstanceAddDialog(this,);
    let descName = targetPlugin.descName;
    //  console.log(_pp.options);
    let url = "/coredefine/corenodemanage.ajax";
    this.httpPost(url, "action=plugin_action&emethod=get_descriptor&name=" + descName + "&hetero=" + targetPlugin.hetero).then((r) => {
      let desc = PluginsComponent.wrapDescriptors(r.bizresult);
      desc.forEach((d) => {

        let pluginTp: PluginType = {name: targetPlugin.hetero, require: true};
        if (targetPlugin.extraParam) {
          pluginTp.extraParam = targetPlugin.extraParam;
        }

        PluginsComponent.openPluginInstanceAddDialog(this, d, pluginTp, "添加" + d.displayName, (biz) => {
          let ids: Array<string> = biz;
          ids.forEach((id) => {
            let n = new ValOption();
            n.name = id;
            n.impl = d.impl;
            _pp.options = [n, ..._pp.options]
          });
        });
      });
    });
  }

  toggleDescContentShow() {
    this.descContentShow = !this.descContentShow;
  }

  ngAfterContentInit(): void {
  }

  changePlugin(_pp: ItemPropVal, impl: string) {
    // console.log(impl);
    delete _pp.error;
    _pp.descVal.clearPropVals();
    if (!impl) {
      return;
    }
    let dspt = _pp.descVal.descriptors.get(impl);
    _pp.descVal.dspt = dspt;
  }

  inputValChange(_pp: ItemPropVal, $event: Event) {
    // console.log($event);
    delete _pp.error;
    // console.log("inputValChange");
    // $event.stopPropagation();
  }

  updateAllChecked(itemVal: ItemPropVal) {
    itemVal.error = undefined;
    let _eprops: { string: any } = itemVal._eprops;
    let checkOptionsOne = _eprops["enum"];
    _eprops['indeterminate'] = false;
    if (_eprops['allChecked']) {
      checkOptionsOne = checkOptionsOne.map(item => {
        return {
          ...item,
          checked: true
        };
      });
    } else {
      checkOptionsOne = checkOptionsOne.map(item => {
        return {
          ...item,
          checked: false
        };
      });
    }
    _eprops["enum"] = checkOptionsOne;
  }

  updateSingleChecked(itemVal: ItemPropVal) {
    itemVal.error = undefined;
    let _eprops: { string: any } = itemVal._eprops;
    if (_eprops["enum"].every((item) => !item.checked)) {
      // 全部都没有选中
      _eprops['allChecked'] = false;
      _eprops['indeterminate'] = false;
    } else if (_eprops["enum"].every((item) => item.checked)) {
      // 全部都选中了
      _eprops['allChecked'] = true;
      _eprops['indeterminate'] = false;
    } else {
      // 部分选中
      _eprops['indeterminate'] = true;
    }
  }


}

interface CreatorRouter {
  routerLink: string;
  label: string;
  plugin: Array<TargetPlugin>;
}

interface TargetPlugin {
  hetero: PluginName;
  extraParam: string;
  descName: string;
}



