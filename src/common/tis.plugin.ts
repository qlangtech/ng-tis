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

export declare type PluginName = 'mq' | 'k8s-config' | 'fs' | 'datasource' | 'dataxReader' | 'params-cfg' ;
export declare type PluginMeta = { name: PluginName, require: boolean, extraParam?: string };
export declare type PluginType = PluginName | PluginMeta;


// 某一插件某一属性行
export class ItemPropVal {
  key: string;
  type: number;
  options: Array<ValOption>;
  required: boolean;
  // 如果考到通用性的化这里应该是数组类型，现在考虑到简单实现，线默认用一个单独的
  descVal: DescribleVal;
  error: string;
  public _eprops: { string: any };
  private dftVal: any;
  placeholder: string;
  _primaryVal = '';
  // 是否是主键
  pk: boolean;
  has_set_primaryVal = false;

  set eprops(vals: { String: any }) {
    // @ts-ignore
    this._eprops = vals || {};
    this.dftVal = this._eprops['dftVal'];
    this.placeholder = this._eprops['placeholder'] || '';
  }


  public setPropValEnums(cols: Array<{ name: string, value: string }>, colItemChecked?: (optVal) => boolean) {
    if (!colItemChecked) {
      colItemChecked = (_) => true;
    }
    let enums = [];
    cols.forEach((s) => {
      enums.push({label: s.name, val: s.value, checked: colItemChecked(s.value)})
    });
    this.setEProp("enum", enums);
  }

  constructor(public updateModel = false) {
  }

  get label(): string {
    let label = this._eprops['label'];
    return label ? label : this.key;
  }

  public getEProp(key: string): any {
    return this._eprops[key];
  }

  public setEProp(key: string, val: any): void {
    this._eprops[key] = val;
  }

  get hasFeedback(): boolean {
    return !(!this.error);
  }

  get validateStatus(): string {
    return this.hasFeedback ? 'error' : '';
  }

  set primary(val: string) {
    this._primaryVal = val;
  }

  get primary(): string {
    // console.log(this);
    if (!this.updateModel && !this.has_set_primaryVal && this.dftVal !== undefined) {
      this._primaryVal = this.dftVal;
      this.has_set_primaryVal = true;
    }
    return this._primaryVal;
    // return this.updateModel ? this._primaryVal : this.dftVal;
  }

  get primaryVal(): boolean {
    return !(this.descVal);
  }
}

export class Descriptor {


  impl: string;
  displayName: string;
  extendPoint: string;
  attrs: AttrDesc[];
  extractProps: { string: any };
  veriflable: boolean;
  pkField: string;
  // subform relevant

  subFormMeta: {
    behaviorMeta: any,
    fieldName: string,
    idList: Array<string>
    id?: string,
  }
  subForm: boolean;

  /**
   *
   * @param h
   * @param des
   * @param updateModel 是否是更新模式，在更新模式下，插件的默认值不能设置到控件上去
   */
  public static addNewItem(h: HeteroList, des: Descriptor, updateModel: boolean
    , itemPropSetter: (key: string, propVal: ItemPropVal) => ItemPropVal): void {
    let nItem = new Item(des);
    nItem.displayName = des.displayName;
    des.attrs.forEach((attr) => {
      nItem.vals[attr.key] = itemPropSetter(attr.key, attr.addNewEmptyItemProp(updateModel));
    });
    let nitems: Item[] = [];
    h.items.forEach((r) => {
      nitems.push(r);
    });
    // console.log(nItem);
    nitems.push(nItem);
    h.items = nitems;
  }
}

export interface TisResponseResult {
  bizresult?: any;
  success: boolean;
  errormsg?: string[];
  action_error_page_show?: boolean;
  msg?: Array<any>;
  errorfields?: Array<Array<Array<IFieldError>>>;
}

/**
 * 对应一个plugin的输入项
 */
export class Item {
  impl = '';
  //  vals: Map<string /**key*/, string | DescribleVal> = new Map();
  // vals: Map<string /**key*/, ItemPropVal> = new Map();
  // 后一种类型支持subform的类型
  public vals: { [key: string]: ItemPropVal } | { [key: string]: { [key: string]: ItemPropVal } } = {};
  displayName = '';
  private _propVals: ItemPropVal[];

  // public get itemVals(): { string?: ItemPropVal } | { string?: { string?: ItemPropVal } } {
  //   return this.vals;
  // }
  //
  // public set itemVals(v: { string?: ItemPropVal } | { string?: { string?: ItemPropVal } }) {
  //   this.vals = v;
  // }

  /**
   * 创建一个新的Item
   *
   * @param fieldNames
   */
  public static create(fieldNames: string[]): Item {
    let item = new Item(null);
    fieldNames.forEach((fname) => {
      item.vals[fname] = new ItemPropVal();
    });
    return item;
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
          let ip = item.vals[fieldErr.name];
          if (ip instanceof ItemPropVal) {
            itemProp = ip;
            itemProp.error = fieldErr.content;

            if (!itemProp.primaryVal) {
              if (fieldErr.errorfields.length !== 1) {
                throw new Error(`errorfields length ${fieldErr.errorfields.length} shall be 1`);
              }
              Item.processErrorField(fieldErr.errorfields, [itemProp.descVal]);
            }
          } else {
            throw new Error("illegal type");
          }
        });
      }
    }
  }

  public static processFieldsErr(result: TisResponseResult): Item {
    let errFields = result.errorfields;
    if (errFields && errFields.length > 0) {
      let pluginsErr = errFields[0];
      if (pluginsErr.length > 0) {
        let pluginErr: Array<IFieldError> = pluginsErr[0];
        let errKeys = pluginErr.map((r) => r.name);
        let item: Item = Item.create(errKeys);
        Item.processErrorField(pluginsErr, [item]);
        return item;
      }
    }
    return Item.create([]);
  }

  constructor(public dspt: Descriptor) {
    if (dspt) {
      this.impl = dspt.impl;
    }
  }


  public wrapItemVals(): void {
    let newVals = {};
    let ovals: any /**map*/ = this.vals;
    let newVal: ItemPropVal;
    this.dspt.attrs.forEach((at) => {
      let v = ovals[at.key];
      // console.log(at.key + ":" + v);
      if (v === undefined || v === null) {
        return;
      }
      newVal = at.addNewEmptyItemProp(true);
      if (at.describable) {
        let d = at.descriptors.get(v.impl);
        if (!d) {
          throw new Error(`impl:${v.impl} can not find relevant descriptor`);
        }
        let ii: Item = Object.assign(new Item(d), v);
        ii.wrapItemVals();
        // console.log(ii);
        newVal.descVal = at.createDescribleVal(ii);
      } else {
        if (at.isMultiSelectableType) {
          if (!Array.isArray(v)) {
            // console.log(v);
            throw new Error("expect val type is array but is not");
          }
          let cols: Array<{ name: string, value: string }> = v.map((r) => {
            return {name: r, value: r}
          });
          newVal.setPropValEnums(cols);
        } else {
          newVal._primaryVal = v;
        }


        // newVal.pk = (at.key === this.dspt.pkField);
      }
      newVals[at.key] = (newVal);
    });
    this.vals = newVals;
    // console.log(this.vals);
  }

  public clearPropVals(dspClear = true): void {
    delete this._propVals;
    if (dspClear) {
      this.dspt = null;
    }
  }

  public get propVals(): ItemPropVal[] {
    if (this._propVals) {
      return this._propVals;
    }
    if (!this.dspt) {
      this._propVals = [];
      return this._propVals;
    }
    this._propVals = [];
    this.dspt.attrs.forEach((attr /**AttrDesc*/) => {
      let ip: ItemPropVal | { [key: string]: ItemPropVal } = this.vals[attr.key];
      if (!ip) {
        // throw new Error(`attrKey:${attr.key} can not find relevant itemProp`);
        ip = attr.addNewEmptyItemProp(true);
        this.vals[attr.key] = ip;
      }
      // console.log(ip);
      if (ip instanceof ItemPropVal) {
        this._propVals.push(ip);
      } else {
        throw new Error("illegal ip type");
      }
    });
    return this._propVals;
  }
}

export class DescribleVal
  extends Item {
  // impl: string;
  // displayName: string;
  // vals: string[] | DescribleVal[];
  descriptors: Map<string /* impl */, Descriptor> = new Map();
}

export class AttrDesc {
  key: string;
  ord: number;
  // 是否是主键
  pk: boolean;
  /**
   * 当describable为true时descriptors 应该有内容
   * */
  descriptors: Map<string /*impl*/, Descriptor>;
  describable: boolean;
  type: number;
  options: Array<ValOption>;
  required: boolean;
  eprops: { String: any };

  // MULTI_SELECTABLE
  public get isMultiSelectableType(): boolean {
    return this.type === 8;
  }

  /**
   *
   * @param updateModel 是否是更新模式，在更新模式下，插件的默认值不能设置到控件上去
   */
  public addNewEmptyItemProp(updateModel: boolean): ItemPropVal {
    let desVal = new ItemPropVal(updateModel);
    desVal.key = this.key;
    desVal.pk = this.pk;
    desVal.eprops = Object.assign({}, this.eprops);
    desVal.required = this.required;
    desVal.type = this.type;
    // 当type为6时，options应该有内容
    desVal.options = this.options;
    if (this.describable) {
      desVal.descVal = this.createDescribleVal(new Item(null));
    }
    return desVal;
  }

  public createDescribleVal(v: Item): DescribleVal {
    let descVal = new DescribleVal(v.dspt);
    descVal.displayName = v.displayName;
    // descVal.impl = v.impl;
    descVal.vals = v.vals;
    this.descriptors.forEach((entry) => {
      descVal.descriptors.set(entry.impl, entry);
    });
    // for (let impl in this.descriptors.) {
    //
    // }
    return descVal;
  }
}


/*HeteroList*/
export class HeteroList {
  descriptors: Map<string /* impl */, Descriptor> = new Map();
  private _descriptorList: Array<Descriptor>;

  public get descriptorList(): Array<Descriptor> {
    if (!this._descriptorList) {
      this._descriptorList = Array.from(this.descriptors.values());
    }
    return this._descriptorList;
  }

  // item 可选数量
  cardinality: string;
  caption: string;
  extensionPoint: string;
  items: Item[] = [];

  public get identity(): string {
    return this.extensionPoint.replace(/\./g, '-');
  }


  public get addItemDisabled(): boolean {
    return (this.cardinality === '1' && this.items.length > 0);
  }
}

export class PluginSaveResponse {
  constructor(public  saveSuccess: boolean, public formDisabled: boolean, private bizResult?: any) {

  }

  public hasBiz(): boolean {
    return !!this.bizResult;
  }

  public biz(): any {
    return this.bizResult;
  }
}

export interface IFieldError {
  name: string;
  content?: string;
  errorfields?: Array<Array<IFieldError>>
}

export class ValOption {
  public impl: string;
  public name: string;
}


