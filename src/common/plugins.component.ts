import {AfterContentInit, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, Output} from "@angular/core";
import {TISService} from "../service/tis.service";
import {AppFormComponent, CurrentCollection} from "../common/basic.form.component";

import {ActivatedRoute} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AttrDesc, DescribleVal, Descriptor, HeteroList, ItemPropVal, Item, IFieldError, PluginType, PluginSaveResponse, ValOption, PluginName, PluginMeta} from "./tis.plugin";
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
                  <button nz-button nzType="primary" (click)="savePluginSetting($event)">保存</button>
              </div>
              <div *ngIf="shallInitializePluginItems && this.itemChangeable" class="plugins-nav">
                  <nz-link *ngFor="let h of _heteroList" [nzHref]="'#'+h.identity" [nzTitle]="h.caption"></nz-link>
              </div>
              <div style="clear: both;margin-bottom:3px;"></div>
          </nz-anchor>
      </ng-container>
      <form nz-form>
          <nz-collapse [nzBordered]="false">
              <nz-collapse-panel *ngFor="let h of _heteroList" [nzHeader]="h.caption" [nzActive]="true" [nzDisabled]="!shallInitializePluginItems">
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
                          <button *ngIf="item.dspt.veriflable" nz-button nzSize="small"><i nz-icon nzType="check" nzTheme="outline"></i>校验</button>
                      </div>
                      <div style="clear: both"></div>
                      <item-prop-val [disabled]="!showSaveButton" [formControlSpan]="formControlSpan" [pp]="pp" *ngFor="let pp of item.propVals"></item-prop-val>
                  </div>
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

  @Input() savePlugin: EventEmitter<any>;
  @Input() showSaveButton = false;

  subscription: Subscription;

  @Output() ajaxOccur = new EventEmitter<PluginSaveResponse>();
  private _plugins: PluginType[] = [];


  /**
   *
   * @param h
   * @param des
   * @param updateModel 是否是更新模式，在更新模式下，插件的默认值不能设置到控件上去
   */
  public static addNewItem(h: HeteroList, des: Descriptor, updateModel: boolean): void {
    // console.log("add new item");
    let nItem = new Item(des);
    // nItem.impl = des.impl;
    nItem.displayName = des.displayName;
    des.attrs.forEach((attr) => {
      nItem.vals[attr.key] = attr.addNewEmptyItemProp(updateModel);
    });
    let nitems: Item[] = [];
    h.items.forEach((r) => {
      nitems.push(r);
    });

    nitems.push(nItem);
    // console.log(nitems);
    h.items = nitems;
  }

  public static processErrorField(errorFields: Array<Array<IFieldError>>, items: Item[]) {
    let item: Item = null;
    let fieldsErrs: Array<IFieldError> = null;

    if (errorFields) {
      for (let index = 0; index < errorFields.length; index++) {
        fieldsErrs = errorFields[index];
        item = items[index];
        let itemProp: ItemPropVal;
        fieldsErrs.forEach((fieldErr) => {
          itemProp = item.vals[fieldErr.name];
          itemProp.error = fieldErr.content;

          if (!itemProp.primaryVal) {
            if (fieldErr.errorfields.length !== 1) {
              throw new Error(`errorfields length ${fieldErr.errorfields.length} shall be 1`);
            }
            PluginsComponent.processErrorField(fieldErr.errorfields, [itemProp.descVal]);
          }
        });
      }
    }
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
        // console.log(attr);
        attrs.push(attr);
      });
      d.attrs = attrs;
      descMap.set(impl, d);
    }
    return descMap;
  }

  @Input()
  set plugins(metas: PluginType[]) {
    // console.log(metas);
    this.setPluginMeta(metas);
    if (!this.shallInitializePluginItems) {
      this.initializePluginItems();
    }
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
      this.subscription = this.savePlugin.subscribe((e: any) => {
        this.savePluginSetting(null);
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
    let pluginMeta = this.getPluginMetaParams();
    let url = '/coredefine/corenodemanage.ajax?event_submit_do_get_plugin_config_info=y&action=plugin_action&plugin=' + pluginMeta;

    this.jsonPost(url, {}).then((r) => {
      this._heteroList = [];
      if (r.success) {
        this.showExtensionPoint.open = r.bizresult.showExtensionPoint;
        let bizArray: HeteroList[] = r.bizresult.plugins;
        bizArray.forEach((he) => {
          let h: HeteroList = Object.assign(new HeteroList(), he);
          let descMap = PluginsComponent.wrapDescriptors(h.descriptors);
          // console.log(descMap);
          h.descriptors = descMap;
          // 遍历item
          let items: Item[] = [];
          let i: Item;
          h.items.forEach((item) => {

            let desc: Descriptor = h.descriptors.get(item.impl);
            i = Object.assign(new Item(desc), item);

            i.wrapItemVals();
            items.push(i);
          });

          h.items = items;
          this._heteroList.push(h);
        });
        this.afterInit.emit(this._heteroList);
        this.cdr.reattach();
        this.cdr.detectChanges();
      }
      this.ajaxOccur.emit(new PluginSaveResponse(false, false));
    }).catch((e) => {
      // console.log("================ error occur");
      this.ajaxOccur.emit(new PluginSaveResponse(false, false));
      throw new Error(e);
    });
  }

  private getPluginMetaParams() {
    return this.plugins.map((p) => {
      let param: any = p;
      if (param.name) {
        let t: PluginMeta = param;
        return `${t.name}:${t.require ? 'require' : ''}${t.extraParam ? ',' + t.extraParam : ''}`
      } else {
        return p;
      }
    }).join("&plugin=");
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


  savePluginSetting(event: MouseEvent) {
    // console.log(JSON.stringify(this._heteroList.items));
    this.ajaxOccur.emit(new PluginSaveResponse(false, true));
    // console.log(this.plugins);
    let pluginMeta = this.getPluginMetaParams();

    //   this.plugins.map((p) => {
    //   let param: any = p;
    //   if (param.name) {
    //     return param.name + (!!param.require ? ':require' : '');
    //   } else {
    //     return p;
    //   }
    // }).join("&plugin=");
    let url = `/coredefine/corenodemanage.ajax?event_submit_do_save_plugin_config=y&action=plugin_action&plugin=${pluginMeta}&errors_page_show=${this.errorsPageShow}`;

    let postData: Array<Item[]> = [];
    this._heteroList.forEach((h) => {
      postData.push(h.items);
    });

    this.jsonPost(url, postData).then((r) => {
      // 成功了
      this.ajaxOccur.emit(new PluginSaveResponse(r.success, false));


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
        PluginsComponent.processErrorField(errorFields, items);
        // tmpHlist.push(h);
      });
      this.cdr.detectChanges();
      // this._heteroList = tmpHlist;
    }).catch((e) => {
      this.ajaxOccur.emit(new PluginSaveResponse(false, false));
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


  reload() {

  }

  startScroll(event: NzAnchorLinkComponent) {
    // console.log(event);
  }

  addNewPluginItem(h: HeteroList, d: Descriptor) {
    PluginsComponent.addNewItem(h, d, false);
  }
}

// 如果不加这个component的话在父组件中添加一个新的item，之前已经输入值的input控件上的值就会消失，确实很奇怪
@Component({
  selector: 'item-prop-val',
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
      <nz-form-item>
          <nz-form-label [nzSpan]="3" [nzRequired]="_pp.required">{{_pp.label}}  </nz-form-label>
          <nz-form-control [nzSpan]="formControlSpan" [nzValidateStatus]="_pp.validateStatus" [nzHasFeedback]="_pp.hasFeedback" [nzErrorTip]="_pp.error">
              <span [ngClass]="{'has-help-url':helpUrl !== null}" [ngSwitch]="_pp.type">
                  <ng-container *ngSwitchCase="1">
                      <input *ngIf="_pp.primaryVal" nz-input [disabled]="disabled" [(ngModel)]="_pp.primary" [name]="_pp.key" (input)="inputValChange(_pp,$event)" [placeholder]="_pp.placeholder"/>
                  </ng-container>
                  <ng-container *ngSwitchCase="4">
                       <nz-input-number [disabled]="disabled" *ngIf="_pp.primaryVal" [(ngModel)]="_pp.primary" [name]="_pp.key" (input)="inputValChange(_pp,$event)"></nz-input-number>
                  </ng-container>
                  <ng-container *ngSwitchCase="2">
                      <textarea [disabled]="disabled" [rows]="_pp.getEProp('rows')" nz-input [(ngModel)]="_pp.primary" [name]="_pp.key"
                                (input)="inputValChange(_pp,$event)" [placeholder]="_pp.placeholder"></textarea>
                  </ng-container>
                  <ng-container *ngSwitchCase="3">
                      <!--date-->
                      <input [disabled]="disabled" *ngIf="_pp.primaryVal" nz-input [(ngModel)]="_pp.primary" [name]="_pp.key" (input)="inputValChange(_pp,$event)"/>
                  </ng-container>
                  <ng-container *ngSwitchCase="5">
                      <!--ENUM-->
                       <nz-select [disabled]="disabled" [(ngModel)]="_pp.primary" [name]="_pp.key" nzAllowClear>
                           <nz-option *ngFor="let e of _pp.getEProp('enum')" [nzLabel]="e.label" [nzValue]="e.val"></nz-option>
                       </nz-select>
                  </ng-container>
                  <ng-container *ngSwitchCase="6">
                      <nz-select [disabled]="disabled" [(ngModel)]="_pp.primary" [name]="_pp.key" nzAllowClear>
                           <nz-option *ngFor="let e of _pp.options" [nzLabel]="e.name" [nzValue]="e.name"></nz-option>
                       </nz-select>
                  </ng-container>
                  <ng-container *ngSwitchCase="7">
                      <!--PASSWORD-->
    <nz-input-group [nzSuffix]="suffixTemplate">
      <input [disabled]="disabled" [type]="passwordVisible ? 'text' : 'password'" nz-input placeholder="input password" *ngIf="_pp.primaryVal" nz-input [(ngModel)]="_pp.primary" [name]="_pp.key" (input)="inputValChange(_pp,$event)"/>
    </nz-input-group>
    <ng-template #suffixTemplate>
      <i nz-icon [nzType]="passwordVisible ? 'eye-invisible' : 'eye'" (click)="passwordVisible = !passwordVisible"></i>
    </ng-template>
                  </ng-container>
                  <a *ngIf="this.helpUrl" target="_blank" [href]="this.helpUrl"><i nz-icon nzType="question-circle" nzTheme="outline"></i></a>
              </span>
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
          .sub-prop {
              clear: both;
              margin-left: 50px;
              background-color: #eeeeee;
          }

          .has-help-url {
              width: calc(100% - 1em)
          }
    `
  ]
})
export class ItemPropValComponent implements AfterContentInit {
  _pp: ItemPropVal;

  passwordVisible = false;

  helpUrl: string = null;
  @Input()
  disabled: false;
  @Input()
  formControlSpan = 13;

  @Input() set pp(item: ItemPropVal) {
    this._pp = item;
    this.helpUrl = item.getEProp('helpUrl');
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
    delete _pp.error;
    // console.log("inputValChange");
  }
}



