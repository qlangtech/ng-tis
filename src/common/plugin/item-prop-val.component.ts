// 如果不加这个component的话在父组件中添加一个新的item，之前已经输入值的input控件上的值就会消失，确实很奇怪
import {AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from "@angular/core";
import {BasicFormComponent} from "../basic.form.component";
import {
  CONST_FORM_LAYOUT_VERTICAL,
  Descriptor,
  HeteroList,
  ItemPropVal,
  OptionEnum, PluginMeta,
  PluginType,
  TYPE_ENUM,
  TYPE_PLUGIN_SELECTION,
  ValOption
} from "../tis.plugin";
import {TISCoreService, TISService} from "../tis.service";
import {NzModalService} from "ng-zorro-antd/modal";
import {NzDrawerService} from "ng-zorro-antd/drawer";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {PluginManageComponent} from "../../base/plugin.manage.component";
import {NzUploadChangeParam} from "ng-zorro-antd/upload";
import {PluginsComponent, SelectionInputAssistComponent} from "../plugins.component";
import {CreatorRouter, RouterAssistType, TargetPlugin} from "./type.utils";
import {createDrawer} from "../ds.quick.manager.component";

@Component({
  selector: 'item-prop-val',
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <!-- [formControlName]="_pp.key" 需要添加到 nz-form-item 元素上用于playweright截图-->
    <nz-form-item [attr.data-testid]="_pp.key+'_item'" [hidden]="hide">
      <nz-form-label [ngClass]="{'form-label-verical':!horizontal,'tis-form-item-label':true}"
                     [nzSpan]="horizontal? 5: null"
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
                      <input [attr.data-testid]="_pp.key" *ngIf="_pp.primaryVal" nz-input [disabled]="disabled"
                             [(ngModel)]="_pp.primary"
                             [name]="_pp.key" (ngModelChange)="inputValChange(_pp,$event)"
                             [placeholder]="_pp.placeholder"/>
                  </ng-container>
                 <ng-container *ngSwitchCase="10">
                      <nz-date-picker [attr.data-testid]="_pp.key"
                                      nzShowTime [disabled]="disabled"
                                      [nzFormat]="_pp.dateTimeFormat"
                                      [(ngModel)]="_pp.primary"
                                      [nzPlaceHolder]="_pp.placeholder"
                                      (nzOnOpenChange)="inputValChange(_pp,null)"
                      ></nz-date-picker>
                  </ng-container>
                  <ng-container *ngSwitchCase="4">

                      <nz-input-number [attr.data-testid]="_pp.key" style="width: 50%;" [disabled]="disabled"
                                       *ngIf="_pp.primaryVal"
                                       [(ngModel)]="_pp.primary"
                                       [name]="_pp.key" (ngModelChange)="inputValChange(_pp,$event)"></nz-input-number>


                  </ng-container>
                  <ng-container *ngSwitchCase="2">
                      <ng-container [ngSwitch]="disabled ? '' : _pp.getEProp('style') ">
                          <tis-codemirror [attr.data-testid]="_pp.key" class="ant-input" *ngSwitchCase="'codemirror'"
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
                      <input [attr.data-testid]="_pp.key" [disabled]="disabled" *ngIf="_pp.primaryVal" nz-input
                             [(ngModel)]="_pp.primary"
                             [name]="_pp.key" (ngModelChange)="inputValChange(_pp,$event)"/>
                  </ng-container>
                  <ng-container *ngSwitchCase="fieldTypeEnums">
                    <!--ENUM-->
                      <nz-select [attr.data-testid]="_pp.key" nzShowSearch [nzMode]="_pp.enumMode" [disabled]="disabled"
                                 [(ngModel)]="_pp.primary" [name]="_pp.key" (ngModelChange)="inputValChange(_pp,$event)"
                                 nzAllowClear>
                           <nz-option *ngFor="let e of _pp.getEProp('enum')" [nzLabel]="e.label"
                                      [nzValue]="e.val"></nz-option>
                       </nz-select>
                  </ng-container>
                  <ng-container *ngSwitchCase="6">
                    <!--select-->
                      <nz-select [attr.data-testid]="_pp.key" [disabled]="disabled" [(ngModel)]="_pp.primary"
                                 [name]="_pp.key"
                                 (ngModelChange)="inputValChange(_pp,$event)" nzAllowClear>
                           <nz-option nzCustomContent *ngFor="let e of _pp.options" [nzLabel]="e.name"
                                      [nzValue]="e.name">
                             <span *ngIf="e.endType" nzTheme="fill" nz-icon nz [nzType]="e.endType"></span> {{e.name}}
                           </nz-option>
                       </nz-select>
                  </ng-container>
                  <ng-container *ngSwitchCase="7">
                      <!--PASSWORD-->
                      <nz-input-group [nzSuffix]="suffixTemplate">
                        <input [attr.data-testid]="_pp.key" [disabled]="disabled"
                               [type]="passwordVisible ? 'text' : 'password'" nz-input
                               placeholder="input password" *ngIf="_pp.primaryVal" nz-input
                               [(ngModel)]="_pp.primary" [name]="_pp.key" (ngModelChange)="inputValChange(_pp,$event)"/>
                      </nz-input-group>
                      <ng-template #suffixTemplate>
                        <i nz-icon [nzType]="passwordVisible ? 'eye-invisible' : 'eye'"
                           (click)="passwordVisible = !passwordVisible"></i>
                      </ng-template>
                  </ng-container>
                 <ng-container *ngSwitchCase="8">
                    <ng-container [ngSwitch]="_pp.tuplesViewType">
                       <ng-container *ngSwitchCase="'mongoCols'">
                          <db-schema-editor [attr.data-testid]="_pp.key" [nameEditDisable]="true" [pkSetDisable]="true"
                                            [error]="_pp.error"
                                            [tabletView]="_pp.mcolsEnums"></db-schema-editor>
                       </ng-container>
                      <ng-container *ngSwitchCase="'transformerRules'">
                         <transformer-rules [attr.data-testid]="_pp.key" [readonly]="this.disabled"
                                            [(tabletView)]="_pp.mcolsEnums"
                                            [error]="_pp.error"></transformer-rules>
                      </ng-container>
                     <ng-container *ngSwitchCase="'jdbcTypeProps'">
                         <jdbc-type-props [attr.data-testid]="_pp.key" [tabletView]="_pp.mcolsEnums"
                                          [error]="_pp.error"></jdbc-type-props>
                      </ng-container>
                      <ng-container *ngSwitchDefault>
                         <label nz-checkbox [(ngModel)]="_pp._eprops['allChecked']"
                                (ngModelChange)="updateAllChecked(_pp)"
                                [nzIndeterminate]="_pp._eprops['indeterminate']">全选</label> <br/>
                         <nz-checkbox-group [attr.data-testid]="_pp.key" [ngModel]="_pp.getEProp('enum')"
                                            (ngModelChange)="updateSingleChecked(_pp)"></nz-checkbox-group>
                      </ng-container>
                   </ng-container>


                 </ng-container>
                   <ng-container *ngSwitchCase="9">
                       <nz-upload [attr.data-testid]="_pp.key" #fileupload
                                  nzAction="tjs/coredefine/corenodemanage.ajax?action=plugin_action&emethod=upload_file"
                                  (nzChange)="handleFileUploadChange(_pp,$event)"
                                  [nzHeaders]="{}"
                                  [nzFileList]="_pp.updateModel?[{'name':_pp.primary,'status':'done' } ]:[]"
                                  [nzLimit]="1"
                       ><button [attr.data-testid]="_pp.key+'_click'" [disabled]="fileupload.nzFileList.length > 0"
                                nz-button><i nz-icon nzType="upload"></i>上传</button></nz-upload>
                 </ng-container>
              </span>
            <a *ngIf="this.helpUrl" target="_blank" [href]="this.helpUrl"><i nz-icon
                                                                             nzType="question-circle"
                                                                             nzTheme="outline"></i></a>
            <ng-container *ngIf="this.createRouter && !this.disabled">
              <button [attr.data-testid]="_pp.key+'_create_router'" class="assist-btn" nz-button nz-dropdown
                      nzSize="small" nzType="link"
                      [nzDropdownMenu]="menu">{{createRouter.label}}<i nz-icon nzType="down"></i></button>
              <nz-dropdown-menu #menu="nzDropdownMenu">
                <ul nz-menu>
                  <li nz-menu-item *ngFor="let p of createRouter.plugin">
                    <a [attr.data-testid]="_pp.key+'_create_router_add'"
                       (click)="openPluginDialog(_pp , p )">
                      <i nz-icon nzType="plus"
                         nzTheme="outline"></i>{{createRouter.plugin.length > 1 ? p.descName : '添加'}}
                    </a>
                  </li>
                  <li nz-menu-item [ngSwitch]="createRouter.assistType">
                    <a [attr.data-testid]="_pp.key+'_create_router_manage'"
                       *ngSwitchCase="'hyperlink'"
                       target="_blank" [href]="createRouter.routerLink">
                      <i nz-icon nzType="link"
                         nzTheme="outline"></i>管理</a>
                    <a [attr.data-testid]="_pp.key+'_create_router_manage'" *ngSwitchDefault
                       (click)="openSelectableInputManager(createRouter)">
                      <i nz-icon nzType="link"
                         nzTheme="outline"></i>管理</a>
                  </li>
                  <li nz-menu-item>
                    <a [attr.data-testid]="_pp.key+'_create_router_refresh'"
                       (click)="reloadSelectableItems()">
                      <i nz-icon nzType="reload"
                         nzTheme="outline"></i>刷新</a>
                  </li>
                </ul>
              </nz-dropdown-menu>
            </ng-container>
          </ng-container>
          <ng-container *ngSwitchCase="false">
            <nz-select [attr.data-testid]="_pp.key+'_plugin_impl_select'"
                       [ngClass]="{'desc-prop-descs' : _pp.descVal.extensible}" [disabled]="disabled"
                       [name]="_pp.key"
                       nzAllowClear [ngModel]="_pp.descVal.impl"
                       (ngModelChange)="changePlugin(_pp,$event)"
                       [nzDropdownRender]="_pp.descVal.extensible?renderExtraPluginTemplate:null">
              <nz-option *ngFor="let e of _pp.descVal.descriptors.values()"
                         [nzLabel]="e.displayName"
                         [nzValue]="e.impl"></nz-option>
            </nz-select>

            <button [attr.data-testid]="_pp.key+'_fresh_descs'" *ngIf="_pp.descVal.extensible" nz-button
                    nzType="link"
                    (click)="freshDescPropDescriptors(_pluginImpl,_pp)">
              <i nz-icon nzType="reload" nzTheme="outline"></i></button>

            <ng-template #renderExtraPluginTemplate>
              <nz-divider></nz-divider>
              <div class="container">
                <button [attr.data-testid]="_pp.key+'_add_new_plugin'"
                        style="width: 100%;background-color: #f8f5d1" nz-button nzType="dashed"
                        nzSize="small"
                        (click)="addNewPlugin(_pluginImpl,_pp)">
                  <i nz-icon nzType="plus" nzTheme="outline"></i>添加
                </button>
              </div>
            </ng-template>

            <form [ngClass]="{'desc-prop-descs' : _pp.descVal.extensible,'sub-prop' :true}" nz-form
                  [nzLayout]=" childHorizontal ? 'horizontal':'vertical' "
                  *ngIf=" _pp.descVal.propVals.length >0">
              <div *ngIf="_pp.descVal.containAdvanceField" style="padding-left: 20px">
                <nz-switch [attr.data-testid]="_pp.key+'_advance_switch'" class="advance-opts"
                           nzSize="small" nzCheckedChildren="高级"
                           nzUnCheckedChildren="精简"
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
      .tis-form-item-label {
        font-weight: bold;
      }

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
          let descMap = Descriptor.wrapDescriptors(r.bizresult)
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
    return (this._pp && this._pp.pk && this._pp.updateModel) || this._disabled || this._pp.readonly;
  }


  @Input() set pp(item: ItemPropVal) {
    // console.log(item);
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


  static openPluginInstall(drawerService: NzDrawerService, cpt: TISCoreService
    , descName: string, notFoundExtension: string | Array<string>, pluginMeta: PluginType, checkedAllAvailable: boolean, afterClosePluginInstall?: (value: any) => void) {
    cpt.openConfirmDialog({
      nzTitle: '确认',
      nzContent: `系统还没有安装名称为'${descName}'的插件，是否需要安装？`,
      nzOkText: '开始安装',
      nzCancelText: '取消',
      nzOnOk: () => {
        let endType = null;
        //console.log(pluginMeta);
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

  public static checkAndInstallPlugin(drawerService: NzDrawerService
    , cpt: TISCoreService
    , pluginMeta: PluginType
    , targetPlugin: TargetPlugin): Promise<Map<string /* impl */, Descriptor>> {
    let descName = targetPlugin.descName;
    let url = "/coredefine/corenodemanage.ajax";
    return cpt.httpPost(url, "action=plugin_action&emethod=get_descriptor&name=" + descName + "&hetero=" + targetPlugin.hetero)
      .then((r) => {
        if (!r.success) {
          if (r.bizresult.notFoundExtension) {
            //console.log(pluginMeta);
            if (!pluginMeta) {
              //  throw new Error("pluginMeta can not be null");
            }
            if (targetPlugin.endType) {
              pluginMeta =
                Object.assign(pluginMeta || {}, {
                  descFilter: {
                    endType: () => targetPlugin.endType,
                    localDescFilter: () => true
                  }
                }) as unknown as PluginMeta;
            }
          //  console.log(pluginMeta);
            ItemPropValComponent.openPluginInstall(drawerService, cpt, descName, r.bizresult.notFoundExtension, pluginMeta, false);

          }
          return Promise.reject("notFoundExtension install plugin first");
        } else {
          return Descriptor.wrapDescriptors(r.bizresult);
        }
      });
  }

  openPluginDialog(_pp: ItemPropVal, targetPlugin: TargetPlugin) {
    console.log([this.pluginMeta, targetPlugin]);
    ItemPropValComponent.checkAndInstallPlugin(this.drawerService, this, this.pluginMeta, targetPlugin)
      .then((desc) => {
        if (!desc) {
          throw new Error("desc can not be null");
        }
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

          PluginsComponent.openPluginInstanceAddDialog(this, d, pluginTp, "添加" + d.displayName, (_, biz) => {
            switch (_pp.type) {
              case TYPE_ENUM:
                if (biz.detailed) {
                  let db = biz.detailed;
                  let enums = _pp.getEProp('enum');
                  _pp.setEProp('enum', [{val: db.identityName, label: db.identityName}, ...enums]);
                } else {
                  throw new Error('invalid biz:' + d.displayName);
                }
                break;
              case TYPE_PLUGIN_SELECTION: // select
                if (Array.isArray(biz)) {
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
      }, (rejectReason) => {
        console.log(rejectReason);
      });
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
    //  console.log(this.pluginMeta);
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
    if (!Array.isArray(checkOptionsOne)) {
      console.log(['checkOptionsOne', checkOptionsOne]);
      throw new Error("checkOptionsOne must be a type of Array");
    }
    //console.log(checkOptionsOne);
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
    let drawerRef = null;
    const currApp = this.tisService.currentApp;
    switch (createRouter.assistType) {
      case RouterAssistType.dbQuickManager: {
        drawerRef = createDrawer(this.drawerService, createRouter, false);
        break;
      }
      case RouterAssistType.paramCfg: {
        drawerRef = this.drawerService.create<SelectionInputAssistComponent, {}, {}>({
          nzWidth: "60%",
          nzPlacement: "right",
          nzTitle: `基础配置录入`,
          nzContent: SelectionInputAssistComponent,
          // nzWrapClassName: 'get-gen-cfg-file',
          nzContentParams: {'createCfg': createRouter}
        });
        break;
      }
      default:
        throw new Error("illega assistType:" + createRouter.assistType);

    }

    drawerRef.afterClose.subscribe(() => {
      this.tisService.currentApp = currApp;
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
