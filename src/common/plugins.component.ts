import {AfterContentInit, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, Output} from "@angular/core";
import {TISService} from "../service/tis.service";
import {AppFormComponent, CurrentCollection} from "../common/basic.form.component";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ActivatedRoute} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AttrDesc, DescribleVal, Descriptor, HeteroList, ItemPropVal, Item, IFieldError, PluginType, PluginSaveResponse, ValOption} from "./tis.plugin";
import {NzAnchorLinkComponent, NzModalService, NzNotificationService} from "ng-zorro-antd";
import {Subscription} from "rxjs";


@Component({
  selector: 'tis-plugins',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
      <!--
        <button (click)="ngAfterContentInit()">reload</button>
       -->

      <nz-anchor *ngIf="showSaveButton" (nzScroll)="startScroll($event)">
          <div style="float: right;">
              <button nz-button nzType="primary" (click)="savePluginSetting($event)">保存</button>
          </div>
          <div class="plugins-nav">
              <nz-link *ngFor="let h of _heteroList" [nzHref]="'#'+h.identity" [nzTitle]="h.caption"></nz-link>
          </div>
          <div style="clear: both"></div>
      </nz-anchor>
      <form nz-form>
          <nz-collapse [nzBordered]="false">
              <nz-collapse-panel *ngFor="let h of _heteroList" [nzHeader]="h.caption" [nzActive]="true">
                  <div class="extension-point" [id]="h.identity">
                      <nz-tag *ngIf="showExtensionPoint.open">{{h.extensionPoint}}</nz-tag>
                  </div>
                  <div *ngFor=" let item of h.items" class="item-block">
                      <div style="float:right">
                          <nz-tag *ngIf="showExtensionPoint.open">{{item.impl}}</nz-tag>
                          <button (click)="removeItem(h,item)" nz-button nzType="link">
                              <i nz-icon nzType="close-square" nzTheme="fill" style="color:red;"></i>
                          </button>
                      </div>
                      <div style="clear: both"></div>
                      <item-prop-val [pp]="pp" *ngFor="let pp of item.propVals"></item-prop-val>
                  </div>

                  <button nz-button nz-dropdown [nzDropdownMenu]="menu" [nzDisabled]="h.addItemDisabled">添加<i nz-icon nzType="down"></i></button>
                  <nz-dropdown-menu #menu="nzDropdownMenu">
                      <ul nz-menu>
                          <li nz-menu-item *ngFor="let d of h.descriptorList">
                              <a href="javascript:void(0)" (click)="addNewItem(h,d)">{{d.displayName}}</a>
                          </li>
                      </ul>
                  </nz-dropdown-menu>
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
  @Input()
  showExtensionPoint: { open: boolean } = {open: false};
  _heteroList: HeteroList[] = [];
  // _descriptors: Descriptor[] = [];

  @Input() savePlugin: EventEmitter<any>;

  @Output() ajaxOccur = new EventEmitter<PluginSaveResponse>();

  @Input() plugins: PluginType[];

  @Input() showSaveButton = false;

  subscription: Subscription;

  constructor(tisService: TISService, route: ActivatedRoute, modalService: NzModalService
    , private notification: NzNotificationService
    , private cdr: ChangeDetectorRef) {
    super(tisService, route, modalService);
    // console.log(tisService);
    // this._validateForm = this._fb.group({
    //   mqTopic: ['', [Validators.required]],
    //   deserialize: ['', [Validators.required]],
    //   consumeName: ['', [Validators.required]],
    //   namesrvAddr: ['', [Validators.required]]
    // });
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
    if (!this.plugins || this.plugins.length < 1) {
      throw new Error("plugin argument can not be null");
    }
    let url = '/coredefine/corenodemanage.ajax?event_submit_do_get_plugin_config_info=y&action=plugin_action&plugin=' + this.plugins.join("&plugin=");
    this.jsonPost(url, {}).then((r) => {
      this._heteroList = [];
      if (r.success) {
        this.showExtensionPoint.open = r.bizresult.showExtensionPoint;
        let bizArray: HeteroList[] = r.bizresult.plugins;
        bizArray.forEach((he) => {
          let h: HeteroList = Object.assign(new HeteroList(), he);
          let descMap = this.wrapDescriptors(h.descriptors);
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
        //   console.log(this._heteroList.items);
        // this._descriptors = Array.from(this._heteroList.descriptors.values());

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

  private wrapDescriptors(descriptors: Map<string /* impl */, Descriptor>)
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

  validateConfirmPassword(): void {
    // setTimeout(() => this._validateForm.controls.confirm.updateValueAndValidity());
  }


  createIncrSyncChannal() {
  }

  createIndexStep1Next() {
    // this.nextStep.emit({});
  }

  cancelStep() {
  }

  // resetForm(e: MouseEvent): void {
  //   e.preventDefault();
  // this._validateForm.reset();
  // for (const key in this._validateForm.controls) {
  //   this._validateForm.controls[key].markAsPristine();
  //   this._validateForm.controls[key].updateValueAndValidity();
  // }
  // }

  // getItemPropVals(item: Item): ItemPropVal[] {
  //   let dspt: Descriptor = this._heteroList.descriptors.get(item.impl);
  //   if (!dspt) {
  //     throw new Error(`impl:${item.impl} can not find relevant descriptor`);
  //   }
  //
  //   // ItemPropVal
  //   let vals: ItemPropVal[] = [];
  //   dspt.attrs.forEach((attr /**AttrDesc*/) => {
  //     let ip: ItemPropVal = item.vals[attr.key];
  //     if (!ip) {
  //       // throw new Error(`attrKey:${attr.key} can not find relevant itemProp`);
  //       ip = attr.addNewEmptyItemProp();
  //       item.vals[attr.key] = ip;
  //     }
  //     // console.log(ip);
  //     vals.push(ip);
  //   });
  //   return vals;
  // }


  // warpHeteriList(): Item[] {
  //   let items: Item[] = this._heteroList.items;
  //   if (!items) {
  //     return this._heteroList.items = [];
  //   } else {
  //     return items;
  //   }
  // }


  addNewItem(h: HeteroList, des: Descriptor): void {
    // console.log("add new item");
    let nItem = new Item(des);
    // nItem.impl = des.impl;
    nItem.displayName = des.displayName;
    des.attrs.forEach((attr) => {
      nItem.vals[attr.key] = attr.addNewEmptyItemProp();
      // nItem.vals.set(attr.key, desVal);
    });
    let nitems: Item[] = [];
    h.items.forEach((r) => {
      nitems.push(r);
    });

    nitems.push(nItem);
    // console.log(nitems);
    h.items = nitems;
  }


  savePluginSetting(event: MouseEvent) {
    // console.log(JSON.stringify(this._heteroList.items));
    this.ajaxOccur.emit(new PluginSaveResponse(false, true));
    let url = '/coredefine/corenodemanage.ajax?event_submit_do_save_plugin_config=y&action=plugin_action&plugin=' + this.plugins.join("&plugin=");

    let postData: Array<Item[]> = [];
    this._heteroList.forEach((h) => {
      postData.push(h.items);
    });

    this.jsonPost(url, postData).then((r) => {
      // 成功了
      this.ajaxOccur.emit(new PluginSaveResponse(r.success, false));
      if (r.success && r.msg.length > 0) {
        this.notification.create('success', '成功', r.msg[0]);
        return;
      }
      let pluginErrorFields = r.errorfields;
      console.log(pluginErrorFields);
      let index = 0;
      this._heteroList.forEach((h) => {
        let items: Item[] = h.items;

        let errorFields = pluginErrorFields[index++];
        this.processErrorField(errorFields, items);
      });
    }).catch((e) => {
      this.ajaxOccur.emit(new PluginSaveResponse(false, false));
    });

    if (event) {
      event.stopPropagation();
    }
  }

  private processErrorField(errorFields: Array<Array<IFieldError>>, items: Item[]) {
    let item: Item = null;
    let fieldsErrs: Array<IFieldError> = null;

    if (errorFields) {
      for (let index = 0; index < errorFields.length; index++) {
        fieldsErrs = errorFields[index];
        item = items[index];
        let ip: ItemPropVal;
        fieldsErrs.forEach((fieldErr) => {
          ip = item.vals[fieldErr.name];
          ip.error = fieldErr.content;

          if (!ip.primaryVal) {
            if (fieldErr.errorfields.length !== 1) {
              throw new Error(`errorfields length ${fieldErr.errorfields.length} shall be 1`);
            }
            this.processErrorField(fieldErr.errorfields, [ip.descVal]);
          }
        })
      }
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
    // console.log(event.active)
  }
}

// 如果不加这个component的话在父组件中添加一个新的item，之前已经输入值的input控件上的值就会消失，确实很奇怪
@Component({
  selector: 'item-prop-val',
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
      <nz-form-item>
          <nz-form-label [nzSpan]="3" [nzRequired]="_pp.required">{{_pp.key}}</nz-form-label>
          <nz-form-control [nzSpan]="14" [nzValidateStatus]="_pp.validateStatus" [nzHasFeedback]="_pp.hasFeedback" [nzErrorTip]="_pp.error">
              <span [ngSwitch]="_pp.type">
                  <span *ngSwitchCase="1">
                      <input *ngIf="_pp.primaryVal" nz-input [(ngModel)]="_pp.primary" [name]="_pp.key" (input)="inputValChange(_pp,$event)"/>
                  </span>
                  <span *ngSwitchCase="4">
                       <nz-input-number *ngIf="_pp.primaryVal" [(ngModel)]="_pp.primary"  [name]="_pp.key" (input)="inputValChange(_pp,$event)"></nz-input-number>
                  </span>
                  <span *ngSwitchCase="2">
                      <textarea rows="20" nz-input [(ngModel)]="_pp.primary" [name]="_pp.key" (input)="inputValChange(_pp,$event)"></textarea>
                  </span>
                  <span *ngSwitchCase="6">
                      <nz-select [(ngModel)]="_pp.primary" [name]="_pp.key" nzAllowClear>
                           <nz-option *ngFor="let e of _pp.options" [nzLabel]="e.name" [nzValue]="e.name"></nz-option>
                       </nz-select>
                  </span>
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
    `
  ]
})
export class ItemPropValComponent implements AfterContentInit {
  _pp: ItemPropVal;

  @Input() set pp(item: ItemPropVal) {
    // console.log(item);
    this._pp = item;
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



