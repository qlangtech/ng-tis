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
  Output
} from "@angular/core";
import {TISCoreService, TISService} from "./tis.service";
import {AppFormComponent, BasicFormComponent, CurrentCollection} from "../common/basic.form.component";
import {ActivatedRoute, Router} from "@angular/router";
import {
  Descriptor,
  FLAG_DELETE_PROCESS, getPluginTypeName,
  HeteroList,
  IFieldError,
  Item,
  ItemPropVal,
  PARAM_END_TYPE,
  PluginMeta,
  PluginName,
  PluginSaveResponse,
  PluginType,
  SavePluginEvent,
  TisResponseResult
} from "./tis.plugin";
import {NzModalRef, NzModalService} from "ng-zorro-antd/modal";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {Subscription} from "rxjs";
import {NzAnchorLinkComponent} from "ng-zorro-antd/anchor";
import {NzDrawerRef, NzDrawerService} from "ng-zorro-antd/drawer";
import {
  convertReducePluginType2PluginTypes,
  CreatorRouter,
  OpenPluginDialogOptions,
  reducePluginType2Map,
  TargetPlugin
} from "./plugin/type.utils";
import {ItemPropValComponent} from "./plugin/item-prop-val.component";

/**
 * 打开ParamCfg类型的对话框
 * @param targetDesc
 * @param drawerService
 * @param cpt
 */
export function openParamsCfg(targetDesc: string, appendExtraParam = '' ,drawerService: NzDrawerService, cpt: TISCoreService, dialogTitle?: string): Promise<PluginSaveResponse> {

  let pluginMeta: PluginType = {
    "name": 'params-cfg',
    "require": true,
    "extraParam": "targetItemDesc_" + targetDesc +"," + appendExtraParam,
    "descFilter": {
      "localDescFilter": (desc: Descriptor) => {
        //  console.log(desc);
        return targetDesc === desc.displayName;
      }
    }
  };
  let targetPlugin: TargetPlugin = {
    hetero: 'params-cfg',
    descName: targetDesc
  };
  return new Promise<PluginSaveResponse>((resolve, reject) => {
    ItemPropValComponent.checkAndInstallPlugin(drawerService, cpt, pluginMeta, targetPlugin)
      .then((desc) => {
        if (!desc) {
          throw new Error("desc can not be null");
        }
        desc.forEach((d) => {


          PluginsComponent.openPluginDialog({shallLoadSavedItems: true}
            , cpt, d, pluginMeta, dialogTitle ? dialogTitle : targetDesc, (biz) => {
              resolve(biz);
            });
        });
      }, (rejectReason) => {
        // console.log(rejectReason);
        reject(rejectReason);
      });
  });

}

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
                        (click)="_savePlugin($event)">{{saveBtnLabel}}
                </button>
              </div>
              <div *ngIf=" this.itemChangeable && _heteroList.length>1 " class="plugins-nav">
                <nz-link *ngFor="let h of _heteroList" [nzHref]="'#'+h.identity"
                         [nzTitle]="h.caption"></nz-link>
              </div>
            </nz-anchor>
          </ng-container>
          <ng-container *ngSwitchCase="false">
            <nz-space style="float: right;">
              <ng-container *ngIf="enableDeleteProcess">
                <button *nzSpaceItem nz-button nzDanger [disabled]="this.formDisabled"
                        (click)="_deletePlugin($event)">
                  <span nz-icon nzType="delete" nzTheme="outline"></span>删除
                </button>
              </ng-container>
              <button *nzSpaceItem nz-button nzType="primary" [disabled]="this.formDisabled"
                      (click)="_savePlugin($event)">{{saveBtnLabel}}
              </button>
            </nz-space>
          </ng-container>
        </ng-container>
        <div style="clear: both;margin-bottom:3px;"></div>

      </ng-container>
      <ng-template #pluginForm let-h="h" let-index="index" let-pluginMeta="pluginMeta">
        <div class="extension-point" [id]="h.identity">
          <nz-tag *ngIf="showExtensionPoint.open"><i nz-icon nzType="api" nzTheme="outline"></i>
            <a class="plugin-link" target="_blank" [href]="h.extensionPointUrl">{{h.extensionPoint}}</a>
          </nz-tag>
        </div>
        <div *ngFor=" let item of h.items " style="position: relative"
             [ngClass]="{'item-block':shallInitializePluginItems || useCollapsePanel}">
          <div *ngIf="item.dspt.supportIcon" style="position: absolute;bottom:0px ;left:0px;opacity:0.9">
            <i style="font-size: 120px" nz-icon [nzType]="item.dspt.endtype"
               nzTheme="fill"></i>
          </div>
          <div style="float:right">
            <nz-space>
              <ng-container *ngIf="item.dspt.helpPath">
                <a *nzSpaceItem target="_blank" [href]="'https://www.tis.pub/'+item.dspt.helpPath"> <i
                  nz-icon nzType="book"
                  nzTheme="outline"></i> 使用说明</a>
              </ng-container>
              <ng-container *ngIf="true || showExtensionPoint.open">
                <nz-tag *nzSpaceItem>
                  <a [href]="item.implUrl" class="plugin-link"
                     target="_blank"><i nz-icon nzType="link"
                                        nzTheme="outline"></i>
                    {{item.impl}}
                  </a></nz-tag>
              </ng-container>
              <ng-container *ngIf="shallInitializePluginItems && itemChangeable">
                <button *nzSpaceItem (click)="removeItem(h,item)"
                        nz-button
                        nzType="link">
                  <i nz-icon nzType="close-square" nzTheme="fill" style="color:red;"></i>
                </button>
              </ng-container>
            </nz-space>
          </div>
          <div>
            <nz-space nzSize="middle">


              <ng-container *ngIf="!disableVerify && item.dspt.veriflable">
                <button *nzSpaceItem nz-button nzSize="small"
                        (click)="configCheck(h , item,$event)"><i nz-icon nzType="check"
                                                                  nzTheme="outline"></i>校验
                </button>&nbsp;
              </ng-container>

              <ng-container *ngIf="!disableManipulate && item.dspt.manipulate">
                <tis-plugin-add-btn *nzSpaceItem [btnSize]="'small'"
                                    [extendPoint]="item.dspt.manipulate.extendPoint"
                                    [descriptors]="[]" [initDescriptors]="true"
                                    (addPlugin)="pluginManipulate(pluginMeta,item,$event)"
                                    [lazyInitDescriptors]="true">
                  <span nz-icon nzType="setting" nzTheme="outline"></span>
                </tis-plugin-add-btn>
                &nbsp;
                <!--PluginManipulate { descMeta: Descriptor, identityName: string }-->
                <ng-container *ngFor="let m of item.dspt.manipulate.stored let i = index">
                  <button style="background-color: #fae8ae" *nzSpaceItem nz-tooltip
                          [nzTooltipTitle]="m.identityName" nzTooltipPlacement="top" nz-button
                          nzSize="small"
                          nzShape="round" (click)="openManipulateStore(pluginMeta,item,item.dspt,m)">
                    <ng-container [ngSwitch]="m.descMeta.supportIcon">
                      <span *ngSwitchCase="true" nz-icon [nzType]="m.descMeta.endtype"></span>
                      <span *ngSwitchDefault nz-icon nzType="tags"></span>
                    </ng-container>
                    {{m.identityName | maxLength:15}}</button>
                </ng-container>

              </ng-container>


            </nz-space>
          </div>
          <div style="clear: both"></div>
          <div *ngIf="item.containAdvanceField" style="padding-left: 20px">
            <nz-switch class="advance-opts" nzSize="small" nzCheckedChildren="高级" nzUnCheckedChildren="精简"
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
      <form nz-form [ngSwitch]="shallInitializePluginItems || useCollapsePanel">
        <nz-collapse *ngSwitchCase="true" [nzBordered]="false">
          <nz-collapse-panel [id]="h.captionId" *ngFor="let h of _heteroList;let i = index"
                             [nzHeader]="h.caption"
                             [nzActive]="true"
                             [nzDisabled]="!shallInitializePluginItems && !useCollapsePanel">

            <ng-container
              *ngTemplateOutlet="pluginForm;context:{h:h,index:i,pluginMeta:this.plugins[i]}"></ng-container>
            <ng-container *ngIf="shallInitializePluginItems && itemChangeable">
              <tis-plugin-add-btn [extendPoint]="h.extensionPoint"
                                  [endType]="h.endType"
                                  [descriptors]="h.descriptorList | pluginDescCallback: h: this.plugins : filterDescriptor"
                                  (afterPluginAddClose)="updateHeteroListDesc(h)"
                                  (addPlugin)="addNewPluginItem(h,$event)">添加
              </tis-plugin-add-btn>

            </ng-container>

          </nz-collapse-panel>
        </nz-collapse>
        <ng-container *ngSwitchCase="false">
          <ng-container *ngFor="let h of _heteroList;let i = index">
            <ng-container
              *ngTemplateOutlet="pluginForm;context:{h:h,index:i,pluginMeta:this.plugins[i]}"></ng-container>
          </ng-container>
        </ng-container>
      </form>
    </nz-spin>
    <!--    <ng-template #notebookNotActivate>Notbook功能还未激活，如何在TIS中启用Zeppelin Notebook功能，详细请查看 <a-->
    <!--      target="_blank" [href]="'https://tis.pub/docs/install/zeppelin/'">文档</a>-->
    <!--    </ng-template>-->
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


  @Input()
  disableManipulate = false;
  @Input()
  disableVerify: boolean;

  @Input()
  showExtensionPoint: { open: boolean } = {open: false};

  @Input()
  errorsPageShow = false;

  // 如果该插件用在DbAddComponent中作为添加组件用
  @Input() shallInitializePluginItems = true;

  @Input() useCollapsePanel = false;
  /**
   * 强制初始化
   */
  @Input() forceInitializePluginItems = false;

  @Input() itemChangeable = true;

  @Input() _heteroList: HeteroList[] = [];
  private _plugins: PluginType[] = [];

  @Output() afterInit: EventEmitter<HeteroList[]> = new EventEmitter<HeteroList[]>();
  @Input() formControlSpan = 13;


  @Input() saveBtnLabel = '保存';
  /**
   * 支持删除操作
   */
  @Input() enableDeleteProcess = false;
  // notShowBizMsg: 不需要在客户端显示成功信息
  @Input() savePlugin: EventEmitter<SavePluginEvent>;
  // 是否显示保存按钮
  @Input() showSaveButton = false;

  // 内部控件是否为只读
  @Input() disabled = false;

  subscription: Subscription;

  @Output() ajaxOccur = new EventEmitter<PluginSaveResponse>();
  @Output() afterSave = new EventEmitter<PluginSaveResponse>();
  @Output() afterVerifyConfig = new EventEmitter<PluginSaveResponse>();

  @Output() startNotebook = new EventEmitter<PluginSaveResponse>();

  @Output()
  afterPluginManipulate = new EventEmitter<PluginSaveResponse>();
  // @ViewChild('notebookNotActivate', {read: TemplateRef, static: true}) notebookNotActivate: TemplateRef<NzSafeAny>;
  //@Input() disableNotebook = false;


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

  public static openPluginInstanceAddDialog(b: BasicFormComponent, pluginDesc: Descriptor
    , pluginTp: PluginType, title: string, onSuccess: (r: PluginSaveResponse, biz) => void) {
    PluginsComponent.openPluginDialog({shallLoadSavedItems: false}, b, pluginDesc, pluginTp, title, onSuccess);
  }

  public static openPluginDialog(opts: OpenPluginDialogOptions, b: TISCoreService
    , pluginDesc: Descriptor, pluginTp: PluginType, title: string, onSuccess: (r: PluginSaveResponse, biz) => void): NzModalRef<any> {
    //console.log("openPluginDialog  ");
    let modalRef = b.openDialog(PluginsComponent, {nzTitle: title});
    let addDb: PluginsComponent = modalRef.getContentComponent();
    if (opts.saveBtnLabel) {
      addDb.saveBtnLabel = opts.saveBtnLabel;
    }
    addDb.enableDeleteProcess = opts.enableDeleteProcess
    addDb.errorsPageShow = true;
    addDb.getCurrentAppCache = true;
    addDb.formControlSpan = 19;
    addDb.disableManipulate = true;
    addDb.shallInitializePluginItems = false;
    // addDb.disableNotebook = true;
    // console.log("shallLoadSavedItems  " + opts.shallLoadSavedItems);
    if (opts.shallLoadSavedItems) {
      //console.log("shallLoadSavedItems  ");
      if (opts.item) {
        throw new Error("contain item property,'shallLoadSavedItems' shall be false");
      }
      addDb.setPlugins([pluginTp], opts.opt);
    } else {

      try {
        let hlist: HeteroList[] = PluginsComponent.pluginDesc(pluginDesc, pluginTp);
        if (opts.item) {
          for (let i = 0; i < hlist.length; i++) {
            hlist[i].items = [opts.item];
          }
        }

        addDb._heteroList = hlist;
      } catch (e) {
        console.log(e);
      }
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
        onSuccess(r, db);
      }
    });
    return modalRef;
  }


  public static getPluginMetaParams(pluginMeta: PluginType[]): string {
    return pluginMeta.map((p) => {
      return PluginsComponent.getPluginMetaParam(p);
    }).join("&plugin=");
  }


  public static getPluginMetaParam(p: PluginType): string {
    let param: any = p;
    // console.log(param);
    if (param.name) {
      let t: PluginMeta = <PluginMeta>param;
      let metaParam = `${t.name}:${t.require ? 'require' : ''}${t.extraParam ? (',' + t.extraParam) : ''}`
      if (Array.isArray(t.appendParams) && t.appendParams.length > 0) {
        metaParam += ("&" + t.appendParams.map((p) => p.key + "=" + p.val).join("&"));
      }
      return metaParam;
    } else {
      return `${p}`;
    }
  }

  public static wrapperHeteroList(he: HeteroList, pm: PluginType): HeteroList {
    let h: HeteroList = Object.assign(new HeteroList(), he, {"pluginCategory": pm});
    let descMap = Descriptor.wrapDescriptors(h.descriptors);
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

  public static addDefaultItem(m: PluginMeta, h: HeteroList) {
    if (m.require && (h.items.length < 1)) {
      // 增加一个默认值
      h.descriptors.forEach((desc, key) => {
        //  console.log([m.descFilter,m.descFilter.localDescFilter(desc)]);
        if (m.descFilter && m.descFilter.localDescFilter(desc)) {
          Descriptor.addNewItem(h, desc, false, (_, propVal) => {
            return propVal;
          });
        }
      })
    }
  }

  public static initializePluginItems(ctx: BasicFormComponent, pm: PluginType[]
    , useCache: boolean, callback: (success: boolean, _heteroList: HeteroList[], showExtensionPoint: boolean) => void
    , e?: SavePluginEvent): Promise<TisResponseResult> {
    let pluginMeta = PluginsComponent.getPluginMetaParams(pm);
    let url = '/coredefine/corenodemanage.ajax?event_submit_do_get_plugin_config_info=y&action=plugin_action&plugin=' + pluginMeta + '&use_cache=' + useCache;
    // console.log([pm,url]);
    return this.process_response_of_get_plugin_config_info(ctx, url, e, pm, callback);
  }


  public static process_response_of_get_plugin_config_info(
    ctx: BasicFormComponent, url: string, e: SavePluginEvent, pm: PluginType[]
    , callback: (success: boolean, _heteroList: HeteroList[], showExtensionPoint: boolean) => void) {
    return ctx.jsonPost(url, {}, e).then((r) => {
      // console.log([r,pm,url]);
      let _heteroList: HeteroList[] = [];
      if (r.success) {
        let bizArray: HeteroList[] = r.bizresult.plugins;
        // console.log([pm, bizArray]);
        let pt: PluginType;
        let m: PluginMeta;
        for (let i = 0; i < pm.length; i++) {
          //
          pt = pm[i];
          let h: HeteroList = PluginsComponent.wrapperHeteroList(bizArray[i], pt);
          m = (pt as PluginMeta);
          PluginsComponent.addDefaultItem(m, h);
          // console.log([bizArray[i], pm[i], h]);
          _heteroList.push(h);
        }
      }
      // console.log(_heteroList);
      callback(r.success, _heteroList, r.success ? r.bizresult.showExtensionPoint : false);
      return r;
    });
  }

  public static postHeteroList(basicModule: BasicFormComponent, pluginMetas: PluginType[], heteroList: HeteroList[]
    , savePluginEvent: SavePluginEvent, errorsPageShow: boolean //
    , processCallback: (r: TisResponseResult) => void //
    , errProcessCallback?: (r: TisResponseResult) => void): void {

    let pluginMeta = PluginsComponent.getPluginMetaParams(pluginMetas);

    let url = `/coredefine/corenodemanage.ajax?event_submit_do_save_plugin_config=y&action=plugin_action&plugin=${pluginMeta}&errors_page_show=${errorsPageShow}&verify=${savePluginEvent.verifyConfig}`;

    let items: Array<Item[]> = [];
    heteroList.forEach((h) => {
      //
      let its: Item[] = [];
      // console.log(h.items);
      for (let item of h.items) {
        its.push(item.project());
      }
      items.push(its);
    });
    let postData: any = {"items": items};

    if (savePluginEvent.serverForward) {
      postData.serverForward = savePluginEvent.serverForward;
      // if (savePluginEvent.postPayload) {
      //   postData = Object.assign(postData, savePluginEvent.postPayload);
      // }
    }

    if (savePluginEvent.postPayload) {
      postData = Object.assign(postData, savePluginEvent.postPayload);
    }


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
    // let savePlugin = new SavePluginEvent();
    let savePlugin = this.savePluginEventCreator();
    savePlugin.verifyConfig = true;
    savePlugin.notShowBizMsg = false;
    //  this.savePluginSetting(event, savePlugin);
    if (!h.pluginCategory) {
      throw new Error("pluginCategory can not be null");
    }
    //  console.log([this.plugins, h.pluginCategory]);
    let nh = Object.assign(new HeteroList(), h);
    nh.items = [item];
    //console.log([h.pluginCategory,this.plugins]);
    let hpluginName = getPluginTypeName(h.pluginCategory);
    let pname: PluginName = null;
    for (let p of this.plugins) {
      pname = getPluginTypeName(p);
      if (pname === hpluginName) {
        this._savePluginInfo(event, savePlugin, [p], [nh]);
        return;
      }
    }
    console.log([h.pluginCategory, this.plugins]);
    throw new Error("can not find pluginCategory pluginName:" + hpluginName);
    // this._savePluginInfo(event, savePlugin, this.plugins, [nh]);
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
    if (this.forceInitializePluginItems || this.shallInitializePluginItems) {
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
    // console.log(this.plugins);
    PluginsComponent.initializePluginItems(this, this.plugins, true //
      , (success: boolean, hList: HeteroList[], showExtensionPoint: boolean) => {
        if (success) {
          // console.log(hList);
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

  _deletePlugin(event: MouseEvent) {
    this.modalService.confirm({
      nzTitle: '<i>请确认是否要删除该实例?</i>',
      nzContent: '<b>删除之后不可恢复</b>',
      nzOnOk: () => {
        let e = this.savePluginEventCreator();// new SavePluginEvent();
        e.verifyConfig = false;
        if (!e.postPayload) {
          e.postPayload = {};
        }
        e.postPayload[FLAG_DELETE_PROCESS] = true;
        this.savePluginSetting(event, e);
      }
    });


  }

  _savePlugin(event: MouseEvent) {
    let e = this.savePluginEventCreator();
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
    // console.log(savePluginEvent);
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
        if (!savePluginEvent.verifyConfig
          //  && !savePluginEvent.createOrGetNotebook
        ) {
          this.afterSave.emit(new PluginSaveResponse(r.success, false, savePluginEvent, r.bizresult));
        } else {
          if (savePluginEvent.verifyConfig && r.success) {
            if (!r.msg || r.msg.length < 1) {
              this.notification.create('success', '校验成功', "表单配置无误");
            }
          }
          this.afterVerifyConfig.emit(new PluginSaveResponse(r.success, false, savePluginEvent, r.bizresult))
          // if (savePluginEvent.createOrGetNotebook && r.success) {
          //   if (this.startNotebook.observers.length > 0) {
          //     this.startNotebook.emit(new PluginSaveResponse(r.success, false, r.bizresult));
          //   } else {
          //     const drawerRef = this.drawerService.create<NotebookwrapperComponent, {}, {}>({
          //       nzWidth: "80%",
          //       nzPlacement: "right",
          //       nzContent: NotebookwrapperComponent,
          //       nzContentParams: {},
          //       nzClosable: false
          //     });
          //     // this.router.navigate()
          //
          //     this.router.navigate(["/", {outlets: {"zeppelin": `z/zeppelin/notebook/${r.bizresult}`}}], {relativeTo: this.route})
          //   }
          // }
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
          if (pluginErrorFields) {
            let errorFields = pluginErrorFields[index++];
            //  console.log(errorFields);
            Item.processErrorField(<Array<Array<IFieldError>>>errorFields, items);
          }
        });
        this.cdr.detectChanges();
      }, (err) => {
        console.log(err);
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


  static getAllDesc(form: BasicFormComponent, extensionPoint: string, entype: string, e?: SavePluginEvent): Promise<Map<string /* impl */, Descriptor>> {
    let params = "action=plugin_action&emethod=get_descs_by_extendpoint&extendpoint=" + extensionPoint;

    if (entype) {
      params += `${PARAM_END_TYPE}${entype}`
    }

    let url = "/coredefine/corenodemanage.ajax";
    return form.httpPost(url, params, e)
      .then((r) => {
        if (r.success) {
          let descMap = Descriptor.wrapDescriptors(r.bizresult)
          return descMap;
        }
      });
  }


  /**
   *
   * @param hostDspt 宿主Descriptpr
   * @param manipuldateMeta
   */
  openManipulateStore(pluginMeta: PluginType, hostItem: Item, hostDspt: Descriptor, manipuldateMeta: { identityName: string }) {
    //console.log([hostDspt, manipuldateMeta.descMeta]);
    let opt = this.createPostPayload(hostItem, pluginMeta, true);

    this.httpPost('/coredefine/corenodemanage.ajax'
      , "event_submit_do_get_manipuldate_plugin=y&action=plugin_action&impl=" + hostDspt.impl + "&identityName=" + manipuldateMeta.identityName)
      .then((result) => {

        let descMap = Descriptor.wrapDescriptors(result.bizresult.desc);

        for (let [_, desc] of descMap) {
          let i: Item = Object.assign(new Item(desc), result.bizresult.item);
          i.wrapItemVals();

          PluginsComponent.openPluginDialog({
              saveBtnLabel: '更新',
              enableDeleteProcess: true,
              shallLoadSavedItems: false
              , item: i
              , savePluginEventCreator: () => {
                return opt;
              }
            }
            , this, desc // manipuldateMeta.descMeta
            , {name: 'noStore', require: true}
            , `${desc.displayName}`
            , (event, biz) => {
              if (event.deleteProcess) {
                let stored = hostDspt.manipulate.stored;
                let idx = stored.findIndex((s) => s.identityName === manipuldateMeta.identityName);
                // console.log([idx, stored,manipuldateMeta]);
                if (idx > -1) {
                  stored.splice(idx, 1);
                  hostDspt.manipulate.stored = [...stored];
                }
                this.cdr.detectChanges();
                // console.log(["deleteProcess", hostDspt.manipulate.stored]);
              } else {
                // console.log("updateProcess");
              }
            });
          break;
        }

        //  console.log(result.bizresult)
      });


  }

  /**
   * 插件操作
   * @param pluginDesc
   */
  public pluginManipulate(pluginMeta: PluginType, item: Item, pluginDesc: Descriptor): void {
    //console.log(item.dspt.manipulate);
    let opt = this.createPostPayload(item, pluginMeta, false /**添加操作*/);
    // opt.serverForward = "coredefine:datax_action:trigger_fullbuild_task";


    PluginsComponent.openPluginDialog({
        saveBtnLabel: '执行',
        shallLoadSavedItems: false //
        , savePluginEventCreator: () => {
          return opt;
        }
      }
      , this, pluginDesc
      , {name: 'noStore', require: true}
      , `${pluginDesc.displayName}`
      , (_, biz) => {
        // console.log(biz);
        // let rr: TisResponseResult = {
        //   success: true,
        //   bizresult: biz
        // }
        // console.log([biz, pluginDesc.manipulateStorable]);
        if (pluginDesc.manipulateStorable) {
          item.dspt.manipulate.stored = [...item.dspt.manipulate.stored, {descMeta: pluginDesc, identityName: biz}]
          this.cdr.detectChanges();
        }
        this.afterPluginManipulate.emit(new PluginSaveResponse(true, false, null, biz));
        // this.processTriggerResult(this.getProcessStrategy(true), Promise.resolve(rr));

      });
  }


  /**
   *
   * @param hostItem 宿主item
   * @param pluginMeta
   * @private
   */
  private createPostPayload(hostItem: Item, pluginMeta: PluginType, updateProcess: boolean) {
    let opt = new SavePluginEvent();
    opt.postPayload = {
      'manipulateTarget': hostItem
      , 'manipulatePluginMeta': PluginsComponent.getPluginMetaParam(pluginMeta)
      , 'updateProcess': updateProcess
    };
    return opt;
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
    return reducePluginType2Map(this.createCfg);
  }

  ngOnInit(): void {
    let reducePluginType: Map<PluginName, Array<TargetPlugin>> = this.reducePluginType();
    this.pluginTyps = convertReducePluginType2PluginTypes(reducePluginType);
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



