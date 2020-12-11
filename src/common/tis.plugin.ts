import {TisResponseResult} from "../service/tis.service";
import {PluginsComponent} from "./plugins.component";

export declare type PluginName = 'mq' | 'k8s-config' | 'fs' | 'datasource' ;
export declare type PluginMeta = { name: PluginName, require: boolean, extraParam?: string };
export declare type PluginType = PluginName | PluginMeta;


export class AttrDesc {
  key: string;
  ord: number;
  /**
   * 当describable为true时descriptors 应该有内容
   * */
  descriptors: Map<string /*impl*/, Descriptor>;
  describable: boolean;
  type: number;
  options: Array<ValOption>;
  required: boolean;
  eprops: { String: any };

  /**
   *
   * @param updateModel 是否是更新模式，在更新模式下，插件的默认值不能设置到控件上去
   */
  public addNewEmptyItemProp(updateModel: boolean): ItemPropVal {
    let desVal = new ItemPropVal(updateModel);
    desVal.key = this.key;
    desVal.eprops = this.eprops;
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


export class Descriptor {
  impl: string;
  displayName: string;
  extendPoint: string;
  attrs: AttrDesc[];
  extractProps: { string: any };
  veriflable: boolean;
  pkField: string;
}

/*Items*/
/**
 * 对应一个plugin的输入项
 */
export class Item {
  impl = '';
  //  vals: Map<string /**key*/, string | DescribleVal> = new Map();
  // vals: Map<string /**key*/, ItemPropVal> = new Map();
  vals = {};
  displayName = '';
  private _propVals: ItemPropVal[];

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

  public static processFieldsErr(result: TisResponseResult): Item {
    let errFields = result.errorfields;
    if (errFields && errFields.length > 0) {
      let pluginsErr = errFields[0];
      if (pluginsErr.length > 0) {
        let pluginErr: Array<IFieldError> = pluginsErr[0];
        let errKeys = pluginErr.map((r) => r.name);
        let item: Item = Item.create(errKeys);
        PluginsComponent.processErrorField(pluginsErr, [item]);
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
    let ovals /**map*/ = this.vals;
    let newVal: ItemPropVal;
    this.dspt.attrs.forEach((at) => {
      let v = ovals[at.key];
      if (!v) {
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
        newVal._primaryVal = v;
        newVal.pk = (at.key === this.dspt.pkField);
      }
      newVals[at.key] = (newVal);
      this.vals = newVals;
    });
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
      // throw new Error(`dspt can not find relevant descriptor`);
    }
    this._propVals = [];
    // ItemPropVal
    // let vals: ItemPropVal[] = [];
    this.dspt.attrs.forEach((attr /**AttrDesc*/) => {
      let ip: ItemPropVal = this.vals[attr.key];
      if (!ip) {
        // throw new Error(`attrKey:${attr.key} can not find relevant itemProp`);
        ip = attr.addNewEmptyItemProp(true);
        this.vals[attr.key] = ip;
      }
      // console.log(ip);
      this._propVals.push(ip);
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

// 某一插件某一属性行
export class ItemPropVal {
  key: string;
  type: number;
  options: Array<ValOption>;
  required: boolean;
  // 如果考到通用性的化这里应该是数组类型，现在考虑到简单实现，线默认用一个单独的
  descVal: DescribleVal;
  error: string;
  private _eprops: { string: any };
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


  constructor(public updateModel = false) {
  }

  get label(): string {
    let label = this._eprops['label'];
    return label ? label : this.key;
  }

  public getEProp(key: string): any {
    return this._eprops[key];
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
    if (!this.updateModel && !this.has_set_primaryVal && this.dftVal) {
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


