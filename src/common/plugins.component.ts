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

import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild
} from "@angular/core";
import {TISService} from "./tis.service";
import {AppFormComponent, BasicFormComponent, CurrentCollection} from "../common/basic.form.component";

import {ActivatedRoute, Router} from "@angular/router";
import {
  AttrDesc,
  CONST_FORM_LAYOUT_VERTICAL,
  Descriptor,
  HeteroList,
  IFieldError,
  Item,
  ItemPropVal,
  OptionEnum,
  PARAM_END_TYPE,
  PluginMeta,
  PluginName,
  PluginSaveResponse,
  PluginType,
  SavePluginEvent,
  TisResponseResult,
  TYPE_ENUM,
  TYPE_PLUGIN_SELECTION,
  ValOption
} from "./tis.plugin";
import {NzModalRef, NzModalService} from "ng-zorro-antd/modal";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {Subscription} from "rxjs";
import {NzAnchorLinkComponent} from "ng-zorro-antd/anchor";
import {NzDrawerRef, NzDrawerService} from "ng-zorro-antd/drawer";
import {PluginManageComponent} from "../base/plugin.manage.component";
import {NzUploadChangeParam} from "ng-zorro-antd/upload";
import {NzSafeAny} from "ng-zorro-antd/core/types";


@Component({
  selector: 'tis-plugins',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-spin [nzSpinning]="this.formDisabled" [nzDelay]="1000" nzSize="large">
      <ng-template #headerController>
      </ng-template>
      <ng-container *ngIf="this.showSaveButton">
        <!--编辑-->
        <tis-page-header *ngIf="this.errorsPageShow" [showBreadcrumb]="false" [result]="result">
        </tis-page-header>
        <ng-container [ngSwitch]="shallInitializePluginItems">
          <ng-container *ngSwitchCase="true">
            <nz-anchor *ngIf="showSaveButton" (nzScroll)="startScroll($event)">
              <div style="float: right;">
                <button nz-button nzType="primary" [disabled]="this.formDisabled"
                        (click)="_savePlugin($event)">保存
                </button>
              </div>
              <div *ngIf=" this.itemChangeable && _heteroList.length>1 " class="plugins-nav">
                <nz-link *ngFor="let h of _heteroList" [nzHref]="'#'+h.identity"
                         [nzTitle]="h.caption"></nz-link>
              </div>
            </nz-anchor>
          </ng-container>
          <ng-container *ngSwitchCase="false">
            <div style="float: right;">
              <button nz-button nzType="primary" [disabled]="this.formDisabled"
                      (click)="_savePlugin($event)">保存
              </button>
            </div>
          </ng-container>
        </ng-container>
        <div style="clear: both;margin-bottom:3px;"></div>

      </ng-container>
      <ng-template #pluginForm let-h="h" let-index="index">
        <div class="extension-point" [id]="h.identity">
          <nz-tag *ngIf="showExtensionPoint.open"><i nz-icon nzType="api" nzTheme="outline"></i>
            <a class="plugin-link" target="_blank" [href]="h.extensionPointUrl">{{h.extensionPoint}}</a>
          </nz-tag>
        </div>
        <div *ngFor=" let item of h.items " style="position: relative"
             [ngClass]="{'item-block':shallInitializePluginItems}">
          <div *ngIf="item.dspt.supportIcon" style="position: absolute;bottom:0px ;left:0px;opacity:0.9">
            <i style="font-size: 120px" nz-icon [nzType]="item.dspt.endtype"
               nzTheme="fill"></i>
          </div>
          <div style="float:right">

            <nz-tag *ngIf="true || showExtensionPoint.open">
              <a [href]="item.implUrl" class="plugin-link"
                 target="_blank"><i nz-icon nzType="link"
                                    nzTheme="outline"></i>
                {{item.impl}}
              </a></nz-tag>
            <button *ngIf="shallInitializePluginItems && itemChangeable" (click)="removeItem(h,item)"
                    nz-button
                    nzType="link">
              <i nz-icon nzType="close-square" nzTheme="fill" style="color:red;"></i>
            </button>
          </div>
          <div>
            <button *ngIf="!disableVerify && item.dspt.veriflable" nz-button nzSize="small"
                    (click)="configCheck(h , item,$event)"><i
              nz-icon nzType="check" nzTheme="outline"></i>校验
            </button> &nbsp;
            <button *ngIf="!this.disableNotebook && item.dspt.notebook.ability" nz-button
                    nzSize="small"
                    (click)="openNotebook(h , item,$event)"><i nz-icon nzType="book"
                                                               nzTheme="outline"></i>Notebook
            </button>
          </div>
          <div style="clear: both"></div>
          <div *ngIf="item.containAdvanceField" style="padding-left: 20px">
            <nz-switch nzSize="small" nzCheckedChildren="高级" nzUnCheckedChildren="精简"
                       [(ngModel)]="item.showAllField"
                       [ngModelOptions]="{standalone: true}"></nz-switch>
          </div>
          <item-prop-val [hide]=" pp.advance && !item.showAllField " [formLevel]="1"
                         [pluginMeta]="plugins[index]"
                         [pluginImpl]="item.impl" [disabled]="disabled || pp.disabled"
                         [formControlSpan]="formControlSpan" [pp]="pp"
                         *ngFor="let pp of item.propVals | itemPropFilter : true"></item-prop-val>
        </div>
      </ng-template>
      <form nz-form [ngSwitch]="shallInitializePluginItems">
        <nz-collapse *ngSwitchCase="true" [nzBordered]="false">
          <nz-collapse-panel *ngFor="let h of _heteroList;let i = index" [nzHeader]="h.caption"
                             [nzActive]="true"
                             [nzDisabled]="!shallInitializePluginItems">
            <ng-container *ngTemplateOutlet="pluginForm;context:{h:h,index:i}"></ng-container>
            <ng-container *ngIf="shallInitializePluginItems && itemChangeable">
              <tis-plugin-add-btn [extendPoint]="h.extensionPoint"
                                  [endType]="h.endType"
                                  [descriptors]="h.descriptorList | pluginDescCallback: h: this.plugins : filterDescriptor"
                                  (afterPluginAddClose)="updateHeteroListDesc(h)"
                                  (addPlugin)="addNewPluginItem(h,$event)">添加<i nz-icon
                                                                                  nzType="down"></i>
              </tis-plugin-add-btn>

            </ng-container>
          </nz-collapse-panel>
        </nz-collapse>
        <ng-container *ngSwitchCase="false">
          <ng-container *ngFor="let h of _heteroList;let i = index">
            <ng-container *ngTemplateOutlet="pluginForm;context:{h:h,index:i}"></ng-container>
          </ng-container>
        </ng-container>
      </form>
    </nz-spin>
    <ng-template #notebookNotActivate>Notbook功能还未激活，如何在TIS中启用Zeppelin Notebook功能，详细请查看 <a
      target="_blank" [href]="'https://tis.pub/docs/install/zeppelin/'">文档</a>
    </ng-template>
    <!--
          {{this._heteroList | json}}
    -->
  `,
  styles: [
    `
      .plugin-link {
        text-decoration: underline;
      }

      .plugin-link:hover {
        background-color: #b7d6ff;
      }

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
  disableVerify: boolean;

  @Input()
  showExtensionPoint: { open: boolean } = {open: false};

  @Input()
  errorsPageShow = false;

  // 如果该插件用在DbAddComponent中作为添加组件用
  @Input() shallInitializePluginItems = true;

  @Input() itemChangeable = true;

  @Input() _heteroList: HeteroList[] = [];
  private _plugins: PluginType[] = [];

  @Output() afterInit: EventEmitter<HeteroList[]> = new EventEmitter<HeteroList[]>();
  @Input() formControlSpan = 13;

  // notShowBizMsg: 不需要在客户端显示成功信息
  @Input() savePlugin: EventEmitter<SavePluginEvent>;
  // 是否显示保存按钮
  @Input() showSaveButton = false;

  // 内部控件是否为只读
  @Input() disabled = false;

  subscription: Subscription;

  @Output() ajaxOccur = new EventEmitter<PluginSaveResponse>();
  @Output() afterSave = new EventEmitter<PluginSaveResponse>();

  @Output() startNotebook = new EventEmitter<PluginSaveResponse>();

  @ViewChild('notebookNotActivate', {read: TemplateRef, static: true}) notebookNotActivate: TemplateRef<NzSafeAny>;
  @Input() disableNotebook = false;


  /**
   * 当前选中的DS plugin 描述信息
   * @param desc
   */
  public static pluginDesc(desc: Descriptor, pluginCategory: PluginType
    , itemPropSetter?: (key: string, propVal: ItemPropVal) => ItemPropVal, updateModel?: boolean): HeteroList[] {
    if (!desc) {
      throw new Error("param desc can not be null");
    }
    let h = new HeteroList();
    h.pluginCategory = pluginCategory;
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
    PluginsComponent.openPluginDialog({shallLoadSavedItems: false}, b, pluginDesc, pluginTp, title, onSuccess);
  }

  public static openPluginDialog(opts: OpenPluginDialogOptions, b: BasicFormComponent
    , pluginDesc: Descriptor, pluginTp: PluginType, title: string, onSuccess: (biz) => void): NzModalRef<any> {
    //console.log("openPluginDialog  ");
    let modalRef = b.openDialog(PluginsComponent, {nzTitle: title});
    let addDb: PluginsComponent = modalRef.getContentComponent();

    addDb.errorsPageShow = true;
    addDb.getCurrentAppCache = true;
    addDb.formControlSpan = 19;
    addDb.shallInitializePluginItems = false;
    addDb.disableNotebook = true;

    if (opts.shallLoadSavedItems) {
      //console.log("shallLoadSavedItems  ");
      addDb.setPlugins([pluginTp], opts.opt);
    } else {
      //console.log("not shallLoadSavedItems");
      addDb._heteroList = PluginsComponent.pluginDesc(pluginDesc, pluginTp);
      addDb.setPluginMeta([pluginTp])
    }
    if (opts.savePluginEventCreator) {
      addDb.savePluginEventCreator = opts.savePluginEventCreator;
    }

    addDb.showSaveButton = true;
    addDb.afterSave.subscribe((r: PluginSaveResponse) => {
      // console.log(r);
      if (r && r.saveSuccess && r.hasBiz()) {
        modalRef.close();
        let db = r.biz();

        onSuccess(db);
      }
    });
    return modalRef;
  }


  public static getPluginMetaParams(pluginMeta: PluginType[]): string {
    return pluginMeta.map((p) => {
      let param: any = p;
      // console.log(param);
      if (param.name) {
        let t: PluginMeta = param;
        let metaParam = `${t.name}:${t.require ? 'require' : ''}${t.extraParam ? (',' + t.extraParam) : ''}`
        if (Array.isArray(t.appendParams) && t.appendParams.length > 0) {
          metaParam += ("&" + t.appendParams.map((p) => p.key + "=" + p.val).join("&"));
        }
        return metaParam;
      } else {
        return p;
      }
    }).join("&plugin=");
  }

  public static wrapperHeteroList(he: HeteroList, pm: PluginType): HeteroList {
    let h: HeteroList = Object.assign(new HeteroList(), he, {"pluginCategory": pm});
    let descMap = PluginsComponent.wrapDescriptors(h.descriptors);
    // console.log(descMap);
    h.descriptors = descMap;
    // 遍历item
    let items: Item[] = [];
    let i: Item;
    h.items.forEach((item) => {

      let desc: Descriptor = h.descriptors.get(item.impl);
      if (!desc) {
        if ((<PluginMeta>pm).skipSubformDescNullError) {
          return;
        }
        // console.log([he, pm]);
        throw new Error("desc impl:" + item.impl + " relevant desc can not be null");
      }
      // console.log([item.impl, desc]);
      if (desc.subForm) {
        i = new Item(desc);
        i.displayName = item.displayName;
        //  i.containAdvance = item.containAdvance;
        let rawVal = item.vals;
        // delete item.vals;
        let subFrom: Array<Item>;
        let subFromItems: Array<Item>;
        let subFormVals: { [tabname: string]: { [propKey: string]: ItemPropVal } } = {};

        for (let subFieldPk in rawVal) {
          subFrom = <Array<Item>>rawVal[subFieldPk];
          // console.log([subFrom, subFieldPk]);
          subFromItems = new Array<Item>();
          subFrom.forEach((form) => {
            let subformDesc: Descriptor = h.descriptors.get(form.impl);
            // console.log([h.descriptors, form.impl]);
            if (!subformDesc) {
              if ((<PluginMeta>pm).skipSubformDescNullError) {
                return;
              }

              throw new Error("desc impl:" + form.impl + " relevant desc can not be null");
            }
            let ii = Object.assign(new Item(subformDesc), form);
            // ii.vals = subFrom;
            ii.wrapItemVals();
            subFromItems.push(ii);
          });
          // console.log([subFrom, desc]);
          // console.log(i.itemVals);
          // console.log([subFrom, ii.vals]);
          // @ts-ignore
          subFormVals[subFieldPk] = subFromItems;
        }
        i.vals = subFormVals;
        // console.log(i);
        // i.subFormRawVals = rawVal;
      } else {
        i = Object.assign(new Item(desc), item);
        i.wrapItemVals();
        //  console.log(i);
      }
      // console.log(i);
      items.push(i);
    });
    h.items = items;
    // console.log(h);
    return h;
  }

  public static initializePluginItems(ctx: BasicFormComponent, pm: PluginType[]
    , useCache: boolean, callback: (success: boolean, _heteroList: HeteroList[], showExtensionPoint: boolean) => void
    , e?: SavePluginEvent): Promise<TisResponseResult> {
    let pluginMeta = PluginsComponent.getPluginMetaParams(pm);
    let url = '/coredefine/corenodemanage.ajax?event_submit_do_get_plugin_config_info=y&action=plugin_action&plugin=' + pluginMeta + '&use_cache=' + useCache;

    return ctx.jsonPost(url, {}, e).then((r) => {
      let _heteroList: HeteroList[] = [];
      if (r.success) {
        let bizArray: HeteroList[] = r.bizresult.plugins;
        // console.log([pm, bizArray]);
        for (let i = 0; i < pm.length; i++) {
          //
          let h: HeteroList = PluginsComponent.wrapperHeteroList(bizArray[i], pm[i]);
          //   console.log([bizArray[i], pm[i], h]);
          _heteroList.push(h);
        }
      }
      callback(r.success, _heteroList, r.success ? r.bizresult.showExtensionPoint : false);
      return r;
    })
  }

  public static wrapDescriptors(descriptors: Map<string /* impl */, Descriptor>)
    : Map<string /* impl */, Descriptor> {
    let descMap: Map<string /* impl */, Descriptor> = new Map();
    let d: Descriptor = null;
    let attrs: AttrDesc[];
    let attr: AttrDesc;
    // console.log(descriptors);
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
    // console.log(descMap);
    return descMap;
  }


  public static postHeteroList(basicModule: BasicFormComponent, pluginMetas: PluginType[], heteroList: HeteroList[]
    , savePluginEvent: SavePluginEvent, errorsPageShow: boolean, processCallback: (r: TisResponseResult) => void, errProcessCallback?: (r: TisResponseResult) => void): void {

    let pluginMeta = PluginsComponent.getPluginMetaParams(pluginMetas);

    let url = `/coredefine/corenodemanage.ajax?event_submit_do_save_plugin_config=y&action=plugin_action&plugin=${pluginMeta}&errors_page_show=${errorsPageShow}&verify=${savePluginEvent.verifyConfig}&getNotebook=${savePluginEvent.createOrGetNotebook}`;

    let items: Array<Item[]> = [];
    heteroList.forEach((h) => {
      items.push(h.items);
    });
    let postData: any = {"items": items};

    if (savePluginEvent.serverForward) {
      postData.serverForward = savePluginEvent.serverForward;
      if (savePluginEvent.postPayload) {
        postData = Object.assign(postData, savePluginEvent.postPayload);
      }
    }
    // console.log([postData,savePluginEvent.postPayload]);
    // console.log([savePluginEvent]);

    basicModule.jsonPost(url, postData, savePluginEvent).then((r) => {
      processCallback(r);
    }).catch((e) => {
      if (errProcessCallback) {
        errProcessCallback(e);
      }
    });
  }

  @Input()
  public set getCurrentAppCache(val: boolean) {
    super.getCurrentAppCache = val;
  }

  filterDescriptor(h: HeteroList, pluginMetas: PluginType[], desc: Descriptor) {
    let pt: PluginType;
    let o: any;
    let meta: PluginMeta;
    for (let i = 0; i < pluginMetas.length; i++) {
      pt = pluginMetas[i];
      o = pt;
      if (o.name && o.descFilter && h.identityId === o.name) {
        meta = o;
        return meta.descFilter.localDescFilter(desc);
      }
    }
    return true;
  }


  configCheck(h: HeteroList, item: Item, event: MouseEvent) {
    let savePlugin = new SavePluginEvent();
    savePlugin.verifyConfig = true;
    savePlugin.notShowBizMsg = false;
    //  this.savePluginSetting(event, savePlugin);
    if (!h.pluginCategory) {
      throw new Error("pluginCategory can not be null");
    }
    //  console.log([this.plugins, h.pluginCategory]);
    let nh = Object.assign(new HeteroList(), h);
    nh.items = [item];
    this._savePluginInfo(event, savePlugin, [h.pluginCategory], [nh]);
  }

  openNotebook(h: HeteroList, item: Item, event: MouseEvent) {

    if (!item.dspt.notebook.activate) {
      this.modalService.warning({
        nzTitle: "错误",
        nzContent: this.notebookNotActivate,
        nzOkText: "知道啦"
      });
      return;
    }

    let savePlugin = new SavePluginEvent();
    savePlugin.createOrGetNotebook = true;
    if (!h.pluginCategory) {
      throw new Error("pluginCategory can not be null");
    }
    let nh = Object.assign(new HeteroList(), h);
    nh.items = [item];
    this._savePluginInfo(event, savePlugin, [h.pluginCategory], [nh]);
  }

  @Input()
  set plugins(metas: PluginType[]) {
    // console.log(metas);
    // this.setPluginMeta(metas);
    // if (!this.shallInitializePluginItems) {
    //   this.initializePluginItems();
    // }
    this.setPlugins(metas);
  }

  setPlugins(metas: PluginType[], opt?: SavePluginEvent) {
    // console.log(metas);
    this.setPluginMeta(metas);
    if (!this.shallInitializePluginItems) {
      this.initializePluginItems(opt);
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


  constructor(tisService: TISService, private router: Router, route: ActivatedRoute, modalService: NzModalService
    , notification: NzNotificationService
    , private cdr: ChangeDetectorRef, private drawerService: NzDrawerService) {
    super(tisService, route, modalService, notification);
    this.cdr.detach();
  }

  ngAfterViewInit(): void {
    // console.log("ngAfterViewInit");
  }

  ngOnInit() {
    // super.ngOnInit();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }


  ngAfterContentInit(): void {
    if (this.savePlugin) {
      this.subscription = this.savePlugin.subscribe((e: SavePluginEvent) => {
        this.savePluginSetting(null, e || new SavePluginEvent());
      });
    }
    this.ajaxOccur.emit(new PluginSaveResponse(false, true, null));
    // console.log("shallInitializePluginItems:"+ this.shallInitializePluginItems);
    if (this.shallInitializePluginItems) {
      if (!this.plugins || this.plugins.length < 1) {
        throw new Error("plugin argument can not be null");
      }
      this.initializePluginItems();
    } else {
      this.cdr.reattach();
      this.cdr.detectChanges();
      this.ajaxOccur.emit(new PluginSaveResponse(true, false, null));
    }
  }


  public initializePluginItems(e?: SavePluginEvent) {
    //  console.log(this.plugins);
    PluginsComponent.initializePluginItems(this, this.plugins, true //
      , (success: boolean, hList: HeteroList[], showExtensionPoint: boolean) => {
        if (success) {
          this.showExtensionPoint.open = showExtensionPoint;
          this._heteroList = hList;
          this.afterInit.emit(this._heteroList);
          this.cdr.reattach();
          this.cdr.detectChanges();
        }

        this.ajaxOccur.emit(new PluginSaveResponse(success, false, null));
      }, e);
  }

  submitForm(value: any): void {
  }

  protected initialize(app: CurrentCollection): void {
  }

  _savePlugin(event: MouseEvent) {
    let e = this.savePluginEventCreator();// new SavePluginEvent();
    e.verifyConfig = false;
    this.savePluginSetting(event, e);
  }

  @Input()
  private savePluginEventCreator = () => new SavePluginEvent();

  savePluginSetting(event: MouseEvent, savePluginEvent: SavePluginEvent) {
    this._savePluginInfo(event, savePluginEvent, this.plugins, this._heteroList);
  }

  _savePluginInfo(event: MouseEvent, savePluginEvent: SavePluginEvent, pluginTypes: PluginType[], _heteroList: HeteroList[]) {
    // console.log(JSON.stringify(this._heteroList.items));
    this.ajaxOccur.emit(new PluginSaveResponse(false, true, savePluginEvent));
    // console.log(this.plugins);
    // let pluginMeta = PluginsComponent.getPluginMetaParams(this.plugins);
    // 如果 传入的tisService 中设置了appname的header那可以通过plugin的表单提交一并提交到服务端
    let formContext = this;
    // console.log(_heteroList);
    PluginsComponent.postHeteroList(formContext, pluginTypes, _heteroList, savePluginEvent, this.errorsPageShow
      , (r) => {
        // 成功了
        this.ajaxOccur.emit(new PluginSaveResponse(r.success, false, savePluginEvent));
        if (!savePluginEvent.verifyConfig && !savePluginEvent.createOrGetNotebook) {
          this.afterSave.emit(new PluginSaveResponse(r.success, false, savePluginEvent, r.bizresult));
        } else {
          if (savePluginEvent.verifyConfig && r.success) {
            if (!r.msg || r.msg.length < 1) {
              this.notification.create('success', '校验成功', "表单配置无误");
            }
          }

          if (savePluginEvent.createOrGetNotebook && r.success) {
            if (this.startNotebook.observers.length > 0) {
              this.startNotebook.emit(new PluginSaveResponse(r.success, false, r.bizresult));
            } else {
              const drawerRef = this.drawerService.create<NotebookwrapperComponent, {}, {}>({
                nzWidth: "80%",
                nzPlacement: "right",
                nzContent: NotebookwrapperComponent,
                nzContentParams: {},
                nzClosable: false
              });
              // this.router.navigate()

              this.router.navigate(["/", {outlets: {"zeppelin": `z/zeppelin/notebook/${r.bizresult}`}}], {relativeTo: this.route})
            }
          }
        }

        if (!this.errorsPageShow && r.success) {
          // 如果在其他流程中嵌入执行（showSaveButton = false） 一般不需要显示成功信息
          if (this.showSaveButton && r.msg.length > 0) {
            // this.notification.create('success', '成功dd', r.msg[0]);
          }
          return;
        }

        this.processResult(r);
        this.cdr.detectChanges();
        let pluginErrorFields = r.errorfields;

        let index = 0;
        // let tmpHlist: HeteroList[] = [];
        _heteroList.forEach((h) => {
          let items: Item[] = h.items;
          let errorFields = pluginErrorFields[index++];
          console.log(errorFields);
          Item.processErrorField(<Array<Array<IFieldError>>>errorFields, items);
        });
        this.cdr.detectChanges();
      }, (err) => {
        this.ajaxOccur.emit(new PluginSaveResponse(false, false, savePluginEvent));
      });

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

  startScroll(event: NzAnchorLinkComponent) {
    // console.log(event);
  }

  addNewPluginItem(h: HeteroList, d: Descriptor) {
    Descriptor.addNewItem(h, d, false, (_, propVal) => propVal);
  }


  updateHeteroListDesc(h: HeteroList) {

    PluginsComponent.getAllDesc(this, h.extensionPoint, h.endType)
      .then((descMap) => {
        if (h.descriptors.size !== descMap.size) {
          h.updateDescriptor(descMap);
          this.cdr.detectChanges();
        }
      });
  }


  static getAllDesc(form: BasicFormComponent, extensionPoint: string, entype: string): Promise<Map<string /* impl */, Descriptor>> {
    let params = "action=plugin_action&emethod=get_descs_by_extendpoint&extendpoint=" + extensionPoint;

    if (entype) {
      params += `${PARAM_END_TYPE}${entype}`
    }

    let url = "/coredefine/corenodemanage.ajax";
    return form.httpPost(url, params)
      .then((r) => {
        if (r.success) {
          let descMap = PluginsComponent.wrapDescriptors(r.bizresult)
          return descMap;
        }
      });
  }

}

@Component({
  selector: "notebook-cpt",
  template: `
    <router-outlet (activate)="active($event)" name="zeppelin"></router-outlet>
  `
  , styles: [
    `
    `
  ]
})
export class NotebookwrapperComponent implements OnInit {

  constructor(private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
  }

  active(event: any) {
  }
}

// 如果不加这个component的话在父组件中添加一个新的item，之前已经输入值的input控件上的值就会消失，确实很奇怪
@Component({
  selector: 'item-prop-val',
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <nz-form-item [hidden]="hide">
      <nz-form-label [ngClass]="{'form-label-verical':!horizontal}" [nzSpan]="horizontal? 5: null"
                     [nzRequired]="_pp.required">{{_pp.label}}<i class="field-help"
                                                                 *ngIf="descContent || asyncHelp"
                                                                 nz-icon nzType="question-circle"
                                                                 nzTheme="twotone"
                                                                 (click)="toggleDescContentShow()"></i>
      </nz-form-label>
      <nz-form-control [nzSpan]="horizontal ? valSpan: null" [nzValidateStatus]="_pp.validateStatus"
                       [nzHasFeedback]="_pp.hasFeedback" [nzErrorTip]="_pp.error">
        <ng-container [ngSwitch]="_pp.primaryVal">
          <ng-container *ngSwitchCase="true">
              <span [ngClass]="{'has-help-url': !this.disabled && (helpUrl !== null || createRouter !== null)}"
                    [ngSwitch]="_pp.type">
                  <ng-container *ngSwitchCase="1">
                      <input *ngIf="_pp.primaryVal" nz-input [disabled]="disabled" [(ngModel)]="_pp.primary"
                             [name]="_pp.key" (ngModelChange)="inputValChange(_pp,$event)"
                             [placeholder]="_pp.placeholder"/>
                  </ng-container>
                 <ng-container *ngSwitchCase="10">
                      <nz-date-picker
                        nzShowTime [disabled]="disabled"
                        [nzFormat]="_pp.dateTimeFormat"
                        [(ngModel)]="_pp.primary"
                        [nzPlaceHolder]="_pp.placeholder"
                        (nzOnOpenChange)="inputValChange(_pp,null)"
                      ></nz-date-picker>
                  </ng-container>
                  <ng-container *ngSwitchCase="4">

                      <nz-input-number style="width: 50%;" [disabled]="disabled" *ngIf="_pp.primaryVal"
                                       [(ngModel)]="_pp.primary"
                                       [name]="_pp.key" (ngModelChange)="inputValChange(_pp,$event)"></nz-input-number>


                  </ng-container>
                  <ng-container *ngSwitchCase="2">
                      <ng-container [ngSwitch]="disabled ? '' : _pp.getEProp('style') ">
                          <tis-codemirror class="ant-input" *ngSwitchCase="'codemirror'"
                                          (change)="inputValChange(_pp,$event)" [(ngModel)]="_pp.primary"
                                          [config]="{ mode:_pp.getEProp('mode'), lineNumbers: false}"
                                          [size]="{width:'100%',height:_pp.getEProp('rows')*20}"></tis-codemirror>
                          <textarea *ngSwitchDefault [disabled]="disabled" [rows]="_pp.getEProp('rows')" nz-input
                                    [(ngModel)]="_pp.primary" [name]="_pp.key"
                                    (ngModelChange)="inputValChange(_pp,$event)"
                                    [placeholder]="_pp.placeholder"></textarea>
                      </ng-container>
                  </ng-container>
                  <ng-container *ngSwitchCase="3">
                      <!--date-->
                      <input [disabled]="disabled" *ngIf="_pp.primaryVal" nz-input [(ngModel)]="_pp.primary"
                             [name]="_pp.key" (ngModelChange)="inputValChange(_pp,$event)"/>
                  </ng-container>
                  <ng-container *ngSwitchCase="fieldTypeEnums">
                    <!--ENUM-->
                      <nz-select nzShowSearch [nzMode]="_pp.enumMode" [disabled]="disabled"
                                 [(ngModel)]="_pp.primary" [name]="_pp.key" (ngModelChange)="inputValChange(_pp,$event)"
                                 nzAllowClear>
                           <nz-option *ngFor="let e of _pp.getEProp('enum')" [nzLabel]="e.label"
                                      [nzValue]="e.val"></nz-option>
                       </nz-select>
                  </ng-container>
                  <ng-container *ngSwitchCase="6">
                    <!--select-->
                      <nz-select [disabled]="disabled" [(ngModel)]="_pp.primary" [name]="_pp.key"
                                 (ngModelChange)="inputValChange(_pp,$event)" nzAllowClear>
                           <nz-option nzCustomContent *ngFor="let e of _pp.options"  [nzLabel]="e.name" [nzValue]="e.name">
                             <span *ngIf="e.endType" nzTheme="fill" nz-icon nz [nzType]="e.endType"></span> {{e.name}}
                           </nz-option>
                       </nz-select>
                  </ng-container>
                  <ng-container *ngSwitchCase="7">
                      <!--PASSWORD-->
                      <nz-input-group [nzSuffix]="suffixTemplate">
                        <input [disabled]="disabled" [type]="passwordVisible ? 'text' : 'password'" nz-input
                               placeholder="input password" *ngIf="_pp.primaryVal" nz-input
                               [(ngModel)]="_pp.primary" [name]="_pp.key" (ngModelChange)="inputValChange(_pp,$event)"/>
                      </nz-input-group>
                      <ng-template #suffixTemplate>
                        <i nz-icon [nzType]="passwordVisible ? 'eye-invisible' : 'eye'"
                           (click)="passwordVisible = !passwordVisible"></i>
                      </ng-template>
                  </ng-container>
                 <ng-container *ngSwitchCase="8">
                   <ng-container [ngSwitch]="_pp.isMcolsEnums">
                       <ng-container *ngSwitchCase="true">
                          <db-schema-editor [nameEditDisable]="true" [pkSetDisable]="true" [error]="_pp.error"
                                            [tabletView]="_pp.mcolsEnums"></db-schema-editor>
                       </ng-container>
                      <ng-container *ngSwitchCase="false">
                         <label nz-checkbox [(ngModel)]="_pp._eprops['allChecked']"
                                (ngModelChange)="updateAllChecked(_pp)"
                                [nzIndeterminate]="_pp._eprops['indeterminate']">全选</label> <br/>
                         <nz-checkbox-group [ngModel]="_pp.getEProp('enum')"
                                            (ngModelChange)="updateSingleChecked(_pp)"></nz-checkbox-group>
                      </ng-container>
                   </ng-container>

                 </ng-container>
                   <ng-container *ngSwitchCase="9">
                       <nz-upload #fileupload
                                  nzAction="tjs/coredefine/corenodemanage.ajax?action=plugin_action&emethod=upload_file"
                                  (nzChange)="handleFileUploadChange(_pp,$event)"
                                  [nzHeaders]="{}"
                                  [nzFileList]="_pp.updateModel?[{'name':_pp.primary,'status':'done' } ]:[]"
                                  [nzLimit]="1"
                       ><button [disabled]="fileupload.nzFileList.length > 0" nz-button><i nz-icon nzType="upload"></i>上传</button></nz-upload>
                 </ng-container>
              </span>
            <a *ngIf="this.helpUrl" target="_blank" [href]="this.helpUrl"><i nz-icon
                                                                             nzType="question-circle"
                                                                             nzTheme="outline"></i></a>
            <ng-container *ngIf="this.createRouter && !this.disabled">
              <button class="assist-btn" nz-button nz-dropdown nzSize="small" nzType="link"
                      [nzDropdownMenu]="menu">{{createRouter.label}}<i nz-icon nzType="down"></i></button>
              <nz-dropdown-menu #menu="nzDropdownMenu">
                <ul nz-menu>
                  <li nz-menu-item *ngFor="let p of createRouter.plugin">
                    <a (click)="openPluginDialog(_pp , p )">
                      <i nz-icon nzType="plus"
                         nzTheme="outline"></i>{{createRouter.plugin.length > 1 ? p.descName : '添加'}}
                    </a>
                  </li>
                  <li nz-menu-item [ngSwitch]="!!createRouter.routerLink">
                    <a *ngSwitchCase="true" target="_blank" [href]="createRouter.routerLink">
                      <i nz-icon nzType="link"
                         nzTheme="outline"></i>管理</a>
                    <a *ngSwitchCase="false" (click)="openSelectableInputManager(createRouter)">
                      <i nz-icon nzType="link"
                         nzTheme="outline"></i>管理</a>
                  </li>
                  <li nz-menu-item>
                    <a (click)="reloadSelectableItems()"><i nz-icon nzType="reload"
                                                            nzTheme="outline"></i>刷新</a>
                  </li>
                </ul>
              </nz-dropdown-menu>
            </ng-container>
          </ng-container>
          <ng-container *ngSwitchCase="false">

            <nz-select [ngClass]="{'desc-prop-descs' : _pp.descVal.extensible}" [disabled]="disabled"
                       [name]="_pp.key"
                       nzAllowClear [ngModel]="_pp.descVal.impl"
                       (ngModelChange)="changePlugin(_pp,$event)"
                       [nzDropdownRender]="_pp.descVal.extensible?renderExtraPluginTemplate:null">
              <nz-option *ngFor="let e of _pp.descVal.descriptors.values()"
                         [nzLabel]="e.displayName"
                         [nzValue]="e.impl"></nz-option>
            </nz-select>

            <button *ngIf="_pp.descVal.extensible" nz-button nzType="link"
                    (click)="freshDescPropDescriptors(_pluginImpl,_pp)"><i nz-icon nzType="reload"
                                                                           nzTheme="outline"></i></button>

            <ng-template #renderExtraPluginTemplate>
              <nz-divider></nz-divider>
              <div class="container">
                <button style="width: 100%" nz-button nzType="dashed" nzSize="small"
                        (click)="addNewPlugin(_pluginImpl,_pp)"><i nz-icon nzType="plus"
                                                                   nzTheme="outline"></i>添加
                </button>
              </div>
            </ng-template>

            <form [ngClass]="{'desc-prop-descs' : _pp.descVal.extensible,'sub-prop' :true}" nz-form
                  [nzLayout]=" childHorizontal ? 'horizontal':'vertical' "
                  *ngIf=" _pp.descVal.propVals.length >0">
              <div *ngIf="_pp.descVal.containAdvanceField" style="padding-left: 20px">
                <nz-switch nzSize="small" nzCheckedChildren="高级" nzUnCheckedChildren="精简"
                           [(ngModel)]="_pp.descVal.showAllField"
                           [ngModelOptions]="{standalone: true}"></nz-switch>
              </div>
              <item-prop-val [hide]=" pp.advance && !_pp.descVal.showAllField " [formLevel]="formLevel+1"
                             [disabled]="disabled" [pluginImpl]="_pp.descVal.dspt.impl" [pp]="pp"
                             *ngFor="let pp of _pp.descVal.propVals | itemPropFilter : true"></item-prop-val>
            </form>
          </ng-container>
        </ng-container>
        <nz-alert *ngIf="descContent && descContentShow" (nzOnClose)="descContentShow= false" nzType="info"
                  [nzDescription]="helpTpl" nzCloseable></nz-alert>
        <ng-template #helpTpl>
          <markdown class="tis-markdown" [data]="descContent"></markdown>
        </ng-template>
      </nz-form-control>
    </nz-form-item>  `,
  styles: [
    `
      .form-label-verical {
        margin-top: 8px;
      }

      .field-help {
        cursor: pointer;
        display: inline-block;
        width: 20px;
        height: 16px;
      }

      .assist-btn i {
        margin-left: 2px;
      }

      .sub-prop {
        clear: both;
        margin-left: 0px;
        background-color: #f6f6f6;
        padding: 3px;
        border-left: 1px solid #cccccc;
        border-bottom: 1px solid #cccccc;
        border-right: 1px solid #cccccc;
      }

      .has-help-url {
        width: calc(100% - 10em);
        display: inline-block;
      }

      .desc-prop-descs {
        width: calc(100% - 4em);
        display: inline-block;
      }
    `
  ]
})
export class ItemPropValComponent extends BasicFormComponent implements AfterContentInit {
  _pp: ItemPropVal;

  _pluginImpl: string;

  passwordVisible = false;

  helpUrl: string = null;
  _disabled = false;
  createRouter: CreatorRouter = null;
  descContent: string = null;
  descContentShow = false;
  asyncHelp = false;
  @Input()
  formLevel: number;

  @Input()
  hide = false;

  fieldTypeEnums = TYPE_ENUM;

  @Input()
  pluginMeta: PluginType;
  @Input()
  formControlSpan = 13;

  @Input()
  set disabled(val: boolean) {
    this._disabled = val;
  }

  @Input()
  set pluginImpl(val: string) {
    this._pluginImpl = val;
  }


  get valSpan(): number {
    if (this.formLevel > 1) {
      return 18;
    }
    return this.formControlSpan;
  }

  constructor(tisService: TISService, modalService: NzModalService
    , private cdr: ChangeDetectorRef, private drawerService: NzDrawerService, notification: NzNotificationService) {
    super(tisService, modalService, notification);
  }

  freshDescPropDescriptors(pluginImpl: string, ip: ItemPropVal) {
    let descVal = ip.descVal;
    this.getAllDesc(pluginImpl, ip.key)
      .then((descMap) => {
        if (descVal.descriptors.size !== descMap.size) {
          descVal.descriptors = descMap;
          // h.updateDescriptor(descMap);
          this.cdr.detectChanges();
          // this.notification
          this.notification.create('success', '成功', "已经成功更新\"" + ip.label + "\"的可选项");
        } else {
          this.notification.create('warning', '通知', "\"" + ip.label + "\"的可选项并没有变化");
        }
      });
  }

  addNewPlugin(pluginImpl: string, ip: ItemPropVal) {
    let descVal = ip.descVal;
    const drawerRef = PluginManageComponent.openPluginManage(this.drawerService, descVal.extendPoint, null, []);

    drawerRef.afterClose.subscribe((result) => {
      this.freshDescPropDescriptors(pluginImpl, ip);
    })
  }

  private getAllDesc(extImpl: string, field: string): Promise<Map<string /* impl */, Descriptor>> {
    let params = "action=plugin_action&emethod=get_descs_by_field_of_desc&extImpl=" + extImpl + "&field=" + field;


    let url = "/coredefine/corenodemanage.ajax";
    return this.httpPost(url, params)
      .then((r) => {
        if (r.success) {
          let descMap = PluginsComponent.wrapDescriptors(r.bizresult)
          return descMap;
        }
      });
  }

  get horizontal(): boolean {
    return this.formLevel < CONST_FORM_LAYOUT_VERTICAL;
  }

  get childHorizontal(): boolean {
    return (this.formLevel + 1) < CONST_FORM_LAYOUT_VERTICAL;
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

    this.asyncHelp = item.getEProp('asyncHelp');

    let descContent = item.getEProp('help');
    if (descContent) {
      this.descContent = descContent;
    }

    let creator = item.getEProp("creator");
    if (creator) {
      this.createRouter = creator;
    }
  }


  static openPluginInstall(drawerService: NzDrawerService, cpt: BasicFormComponent
    , descName: string, notFoundExtension: string | Array<string>, pluginMeta: PluginType, checkedAllAvailable: boolean, afterClosePluginInstall?: (value: any) => void) {
    cpt.modalService.confirm({
      nzTitle: '确认',
      nzContent: `系统还没有安装名称为'${descName}'的插件，是否需要安装？`,
      nzOkText: '开始安装',
      nzCancelText: '取消',
      nzOnOk: () => {
        let endType = null;

        if (HeteroList.isDescFilterDefined(pluginMeta)) {
          endType = pluginMeta.descFilter.endType();
        }
        const drawerRef = PluginManageComponent.openPluginManage(drawerService, notFoundExtension, endType, [], checkedAllAvailable);
        if (afterClosePluginInstall) {
          drawerRef.afterClose.subscribe(afterClosePluginInstall);
        }
        // drawerRef.afterClose.subscribe(() => {
        // this.afterPluginAddClose.emit();
        //})
      }
    });
  }

  static checkAndInstallPlugin(drawerService: NzDrawerService, cpt: BasicFormComponent, pluginMeta: PluginType, targetPlugin: TargetPlugin): Promise<Map<string /* impl */, Descriptor>> {
    let descName = targetPlugin.descName;
    let url = "/coredefine/corenodemanage.ajax";
    return cpt.httpPost(url, "action=plugin_action&emethod=get_descriptor&name=" + descName + "&hetero=" + targetPlugin.hetero)
      .then((r) => {
        if (!r.success) {
          if (r.bizresult.notFoundExtension) {

            ItemPropValComponent.openPluginInstall(drawerService, cpt, descName, r.bizresult.notFoundExtension, pluginMeta, false);

            // cpt.modalService.confirm({
            //   nzTitle: '确认',
            //   nzContent: `系统还没有安装名称为'${descName}'的插件，是否需要安装？`,
            //   nzOkText: '开始安装',
            //   nzCancelText: '取消',
            //   nzOnOk: () => {
            //     let endType = null;
            //
            //     if (HeteroList.isDescFilterDefined(pluginMeta)) {
            //       endType = pluginMeta.descFilter.endType();
            //     }
            //     const drawerRef = PluginManageComponent.openPluginManage(drawerService, r.bizresult.notFoundExtension, endType, []);
            //     drawerRef.afterClose.subscribe(() => {
            //       // this.afterPluginAddClose.emit();
            //     })
            //   }
            // });
          }
          return;
        } else {
          return PluginsComponent.wrapDescriptors(r.bizresult);
        }
      });
  }

  openPluginDialog(_pp: ItemPropVal, targetPlugin: TargetPlugin) {

    ItemPropValComponent.checkAndInstallPlugin(this.drawerService, this, this.pluginMeta, targetPlugin)
      .then((desc) => {
        // let desc = PluginsComponent.wrapDescriptors(r.bizresult);
        desc.forEach((d) => {
          // console.log(targetPlugin);
          let pluginTp: PluginType = {
            name: targetPlugin.hetero,
            require: true,
            extraParam: "append_true,targetItemDesc_" + d.displayName
          };
          if (targetPlugin.extraParam) {
            pluginTp.extraParam += (',' + targetPlugin.extraParam);
          }

          PluginsComponent.openPluginInstanceAddDialog(this, d, pluginTp, "添加" + d.displayName, (biz) => {
            //  console.log(_pp);
            switch (_pp.type) {
              case TYPE_ENUM: // enum
                              // enum
                              // db detail
                              // let item: Item = Object.assign(new Item(d), );
                              // let nn = new ValOption();
                              // n.name = biz.detailed.identityName;
                              // n.impl = d.impl;

                if (biz.detailed) {
                  let db = biz.detailed;
                  let enums = _pp.getEProp('enum');
                  // console.log(enums);
                  _pp.setEProp('enum', [{val: db.identityName, label: db.identityName}, ...enums]);
                } else {
                  // console.log(biz);
                  throw new Error('invalid biz:' + d.displayName);
                }
                break;
              case TYPE_PLUGIN_SELECTION: // select
                if (Array.isArray(biz)) {
                  // select
                  let ids: Array<string> = biz;
                  ids.forEach((id) => {
                    let n = new ValOption();
                    n.name = id;
                    n.impl = d.impl;
                    _pp.options = [n, ..._pp.options]
                  });
                }
                break;
              default:
                throw new Error(`error type:${_pp.type}`);
            }
          });
        });
      });


    // let descName = targetPlugin.descName;
    // let url = "/coredefine/corenodemanage.ajax";
    // //console.log(this.pluginMeta);
    // this.httpPost(url, "action=plugin_action&emethod=get_descriptor&name=" + descName + "&hetero=" + targetPlugin.hetero)
    //   .then((r) => {
    //     if (!r.success) {
    //       if (r.bizresult.notFoundExtension) {
    //         this.modalService.confirm({
    //           nzTitle: '确认',
    //           nzContent: `系统还没有安装名称为'${descName}'的插件，是否需要安装？`,
    //           nzOkText: '开始安装',
    //           nzCancelText: '取消',
    //           nzOnOk: () => {
    //             let endType = null;
    //
    //             if (HeteroList.isDescFilterDefined(this.pluginMeta)) {
    //               endType = this.pluginMeta.descFilter.endType();
    //             }
    //             const drawerRef = PluginManageComponent.openPluginManage(this.drawerService, r.bizresult.notFoundExtension, endType, []);
    //             drawerRef.afterClose.subscribe(() => {
    //               // this.afterPluginAddClose.emit();
    //             })
    //           }
    //         });
    //       }
    //       return;
    //     }
    //     // 需要的plugin已经安装上了
    //     let desc = PluginsComponent.wrapDescriptors(r.bizresult);
    //     desc.forEach((d) => {
    //       // console.log(targetPlugin);
    //       let pluginTp: PluginType = {
    //         name: targetPlugin.hetero,
    //         require: true,
    //         extraParam: "append_true,targetItemDesc_" + d.displayName
    //       };
    //       if (targetPlugin.extraParam) {
    //         pluginTp.extraParam += (',' + targetPlugin.extraParam);
    //       }
    //
    //       PluginsComponent.openPluginInstanceAddDialog(this, d, pluginTp, "添加" + d.displayName, (biz) => {
    //         //  console.log(_pp);
    //         switch (_pp.type) {
    //           case TYPE_ENUM: // enum
    //             // enum
    //             // db detail
    //             // let item: Item = Object.assign(new Item(d), );
    //             // let nn = new ValOption();
    //             // n.name = biz.detailed.identityName;
    //             // n.impl = d.impl;
    //
    //             if (biz.detailed) {
    //               let db = biz.detailed;
    //               let enums = _pp.getEProp('enum');
    //               // console.log(enums);
    //               _pp.setEProp('enum', [{val: db.identityName, label: db.identityName}, ...enums]);
    //             } else {
    //               // console.log(biz);
    //               throw new Error('invalid biz:' + d.displayName);
    //             }
    //             break;
    //           case TYPE_PLUGIN_SELECTION: // select
    //             if (Array.isArray(biz)) {
    //               // select
    //               let ids: Array<string> = biz;
    //               ids.forEach((id) => {
    //                 let n = new ValOption();
    //                 n.name = id;
    //                 n.impl = d.impl;
    //                 _pp.options = [n, ..._pp.options]
    //               });
    //             }
    //             break;
    //           default:
    //             throw new Error(`error type:${_pp.type}`);
    //         }
    //       });
    //     });
    //   });
  }

  toggleDescContentShow() {
    if (this.asyncHelp) {

      if (!this.descContent && !this.descContentShow) {
        let url = "/coredefine/corenodemanage.ajax";

        let metas: PluginType[] = [];
        if (this.pluginMeta) {
          metas = [this.pluginMeta];
        }

        this.httpPost(url, `action=plugin_action&emethod=get_plugin_field_help&impl=${this._pluginImpl}&field=${this._pp.key}&plugin=${PluginsComponent.getPluginMetaParams(metas)}`).then((r) => {
          this.descContent = r.bizresult;
          this.descContentShow = true;
          this.cdr.detectChanges();
        });
        return;
      }
    }
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
    _pp.descVal.newDesc = dspt;
    // console.log([_pp.descVal.impl,_pp.descVal.dspt]);
  }

  inputValChange(_pp: ItemPropVal, $event: Event) {
    // console.log($event);
    delete _pp._error;
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


  openSelectableInputManager(createRouter: CreatorRouter) {
    // console.log(createRouter);
    const drawerRef = this.drawerService.create<SelectionInputAssistComponent, {}, {}>({
      nzWidth: "60%",
      nzPlacement: "right",
      nzTitle: `基础配置录入`,
      nzContent: SelectionInputAssistComponent,
      // nzWrapClassName: 'get-gen-cfg-file',
      nzContentParams: {'createCfg': createRouter}
    });
    drawerRef.afterClose.subscribe(() => {
      let cpt = drawerRef.getContentComponent();
      if (cpt.hasSaved) {
        this.reloadSelectableItems();
      }
    });
  }

  reloadSelectableItems() {
    let url = "/coredefine/corenodemanage.ajax";
    this.httpPost(url, `action=plugin_action&emethod=get_fresh_enum_field&impl=${this._pluginImpl}&field=${this._pp.key}`)
      .then((r) => {
        if (!r.success) {
          return;
        }
        switch (this._pp.type) {
          case TYPE_ENUM:
            if (!Array.isArray(r.bizresult)) {
              throw new Error('bizresult must be a Array');
            }
            let cols: Array<{ name: string, value: string }> = [];
            (<Array<OptionEnum>>r.bizresult).forEach((e) => {
              cols.push({name: e.label, value: e.val})
            })
            this._pp.setPropValEnums(cols, (optVal) => this._pp.primary === optVal);

            break;
          case TYPE_PLUGIN_SELECTION:
            let opts: ValOption[] = [];
            if (!Array.isArray(r.bizresult)) {
              throw new Error(r.bizresult);
            }
            r.bizresult.forEach((opt) => {
              opts.push(Object.assign(new ValOption(), opt));
            });
            this._pp.options = opts;
            break;
          default:
            throw new Error(`illegal field type:${this._pp.type}`);
        }
        this.successNotify(`'${this._pp.label}'可选内容已经刷新`, 2000);
        this.cdr.detectChanges();
      });
  }

  handleFileUploadChange(_pp: ItemPropVal, event: NzUploadChangeParam) {
    if (event.file.status === 'done') {
      _pp.primary = event.file.response.bizresult.file + ";" + event.file.name;
      // console.log([event, _pp.primary]);
    }

  }
}

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <tis-plugins [getCurrentAppCache]="true" [showSaveButton]="true" [formControlSpan]="19" [plugins]="pluginTyps"
                 (ajaxOccur)="whenAjaxOccur($event)" (afterSave)="afterSave($event)"></tis-plugins>`
})
export class SelectionInputAssistComponent extends BasicFormComponent implements OnInit {

  @Input()
  createCfg: CreatorRouter;
  pluginTyps: PluginType[] = [];
  hasSaved: boolean;

  constructor(tisService: TISService, modalService: NzModalService, notification: NzNotificationService, private drawerRef: NzDrawerRef<any>) {
    super(tisService, modalService, notification);
  }

  private reducePluginType(): Map<PluginName, Array<TargetPlugin>> {
    let tp: TargetPlugin;
    let reducePluginType: Map<PluginName, Array<TargetPlugin>> = new Map<PluginName, Array<TargetPlugin>>();
    let tplugins: Array<TargetPlugin>;
    for (let i = 0; i < this.createCfg.plugin.length; i++) {
      tp = this.createCfg.plugin[i];
      tplugins = reducePluginType.get(tp.hetero);
      if (!tplugins) {
        tplugins = new Array<TargetPlugin>();
        reducePluginType.set(tp.hetero, tplugins);
      }
      tplugins.push(tp);
    }
    return reducePluginType;
  }

  ngOnInit(): void {
    // let tp: TargetPlugin;
    this.pluginTyps = [];

    let reducePluginType: Map<PluginName, Array<TargetPlugin>> = this.reducePluginType();

    for (const [key, val] of reducePluginType.entries()) {
      // console.log(key);
      // console.log(val);
      let extraParam = null;
      let descFilter = {
        localDescFilter: (desc) => true
      };
      let tp: TargetPlugin = {hetero: key};
      if (val.length === 1) {
        tp = val[0];
        extraParam = "targetItemDesc_" + tp.descName;
        if (tp.extraParam) {
          extraParam += (',' + tp.extraParam);
        }
        descFilter = {
          localDescFilter: (desc) => {
            return desc.displayName === tp.descName;
          }
        };
      }

      this.pluginTyps.push({
        name: tp.hetero
        , require: true
        , extraParam: extraParam
        , descFilter: descFilter
      });
    }


    // for (let i = 0; i < this.createCfg.plugin.length; i++) {
    //   tp = this.createCfg.plugin[i];
    //   let extraParam = "targetItemDesc_" + tp.descName;
    //   if (tp.extraParam) {
    //     extraParam += (',' + tp.extraParam);
    //   }
    //   this.pluginTyps.push({
    //     name: tp.hetero
    //     , require: true
    //     , extraParam: extraParam
    //     , descFilter: {
    //       localDescFilter: (desc) => {
    //         return desc.displayName === tp.descName;
    //       }
    //     }
    //   });
    // }
  }

  whenAjaxOccur(e: PluginSaveResponse) {

  }

  afterSave(e: PluginSaveResponse) {
    this.hasSaved = e.saveSuccess;
    if (e.saveSuccess) {
      this.drawerRef.close();
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
  extraParam?: string;
  descName?: string;
}

export interface OpenPluginDialogOptions {
  opt?: SavePluginEvent;
  shallLoadSavedItems: boolean;
  /**
   * 是否要覆写创建SavePluginEvent的行为
   */
  savePluginEventCreator?: () => SavePluginEvent;
}



