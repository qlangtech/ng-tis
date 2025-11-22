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

// import {EventEmitter} from "@angular/core";
import {NzSelectModeType} from "ng-zorro-antd/select";
import {TablePojo} from "../offline/table.add.component";
import {PluginExtraProps} from "../runtime/misc/RCDeployment";
import {KEY_APPNAME} from "./tis.service";
import {PowerjobCptType} from "../base/base.manage-routing.module";
import {RecordTransformer, TransformerRuleTabletView} from "./multi-selected/transformer.rules.component";
import {KEY_subform_DetailIdValue, TuplesProperty} from "./plugin/type.utils";
import {MongoColsTabletView} from "./multi-selected/schema.edit.component";
import {JdbcTypeProp, JdbcTypePropsProperty} from "./multi-selected/jdbc.type.props.component";
import * as ls from 'lodash';

export const CONST_FORM_LAYOUT_VERTICAL = 3;

export const PARAM_END_TYPE = "&endType=";

export const EXTRA_PARAM_TARGET_PIPELINE_NAME_AWARE = "targetPipelineNameAware_true";
export const EXTRA_PARAM_DATAX_NAME = "dataxName_";
export const DATAX_PREFIX_DB = "dataxDB_";
export const KEY_OPTIONS_ENUM = "enum";


export function createExtraDataXParam(pipeline: string): string {
    return EXTRA_PARAM_DATAX_NAME + pipeline;
}

export declare type PluginName =
    'mq'
    | 'transformer'
    | 'noStore'
    | 'uploadCustomizedTPI'
    | 'target-column'
    | 'transformerUDF'
    // | 'jobTrigger'
    | 'incr-config'
    | 'sinkFactory'
    | 'k8s-config'
    | 'fs'
    | 'datasource'
    | 'dataxReader'
    | 'params-cfg'
    | 'params-cfg-user-isolation'
    | 'appSource'
    | 'dataxWriter'
    | 'datax-worker'
    // @ts-ignore
    | PowerjobCptType.JobTplAppOverwrite
    // @ts-ignore
    | PowerjobCptType.FlinkCluster
    // @ts-ignore
    | PowerjobCptType.FlinkKubernetesApplicationCfg// 'powerjob-job-tpl-app-overwrite'
export declare type PluginMeta = {
    skipSubformDescNullError?: boolean;
    name: PluginName, require: boolean
    // key1_val1,key2_val2
    , extraParam?: string
    // &key=val&key=val
    , appendParams?: Array<{ key: string, val: string }>
    // 服务端对目标Item的desc进行过滤
    , descFilter?:
        { // 插件安装panel需要过滤的端类型
            endType?: () => string,
            localDescFilter: (desc: Descriptor) => boolean
        }
};
export declare type PluginType = PluginName | PluginMeta;


export function getPluginMetaParam(p: PluginType): string {
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

export function getPluginTypeName(pt: PluginType): PluginName {
    if ((pt as any).name) {
        return (pt as PluginMeta).name
    } else {
        return pt as PluginName;
    }
}

export const TYPE_ENUM = 5;
export const TYPE_PLUGIN_SELECTION = 6;
export const TYPE_PLUGIN_MULTI_SELECTION = 8;
export const KEY_DEFAULT_VALUE = 'dftVal';
export const KEY_LABEL = 'label';

export class ErrorFeedback {
    _error: string | any;

    constructor(error?: string) {
        this._error = error;
    }


    public get error(): string | any {
        return this._error;
    }

    public set error(content: string | any) {
        this._error = content;
    }

    get hasFeedback(): boolean {
        let err = this.error;
        return !(!err) && typeof err === "string";
    }

    get validateStatus(): string {
        return this.hasFeedback ? 'error' : '';
    }
}

// 某一插件某一属性行
export class ItemPropVal extends ErrorFeedback {
    key: string;
    type: number;
    options: Array<ValOption>;
    required: boolean;
    // 如果考到通用性的化这里应该是数组类型，现在考虑到简单实现，线默认用一个单独的
    descVal: DescribleVal;
    advance: boolean;
    // _error: string | any;
    public _eprops: { string: any };
    private dftVal: any;
    placeholder: string;
    dateTimeFormat: string;
    _primaryVal: any = undefined;
    // 是否是主键
    pk: boolean;
    has_set_primaryVal = false;
    disabled = false;


    constructor(public updateModel = false) {
        //  console.log("create");
        super();
    }


    /**
     * 当页面提交的时候作投影，只投影需要提交的内容
     */
    public project(): ItemPropVal {
        let pickProps: string[] = [];
        let containEprops = false;
        let descValProject: DescribleVal = null;
        if (this.descVal) {
            descValProject = this.descVal.project() as DescribleVal;
        } else if (typeof this._primaryVal === 'undefined') {
            pickProps.push('_eprops');
            containEprops = true;
        } else {
            pickProps.push('_primaryVal');
        }

        let ip: ItemPropVal = ls.pick(this, pickProps);
        if (descValProject) {
            ip.descVal = descValProject;
        }
        //let cols = ip.mcolsEnums;
        if (containEprops) {
            let ep: { string?: any } = {};
            ep[KEY_OPTIONS_ENUM] = this.getEProp(KEY_OPTIONS_ENUM);
            ip._eprops = ep as { string: any };
        }
        // ip.mcolsEnums
        //console.log(ip);
        return ip;
    }


    set eprops(vals: { String: any }) {
        // @ts-ignore
        this._eprops = vals || {};
        this.dftVal = this._eprops[KEY_DEFAULT_VALUE];
        this.placeholder = this._eprops['placeholder'] || '';
        this.dateTimeFormat = this._eprops['dateTimeFormat'] || 'yyyy-MM-dd HH:mm:ss';
    }

    public setMcolsEnums(elementKeys: Array<string>, dbLatestMcols: Array<ReaderColMeta>, mcols: Array<ReaderColMeta>, typeMetas: Array<DataTypeMeta>) {
        let tabView = new MongoColsTabletView(elementKeys, dbLatestMcols, mcols, typeMetas);
        this.setEProp(KEY_OPTIONS_ENUM, tabView);
        this._tupleViewType = tabView.viewType();
    }

    public setTransformerRules(elementKeys: Array<string>
        , transformerRule: Array<RecordTransformer>
        , typeMetas: Array<DataTypeMeta>, selectedTab: string
    ) {
        // console.log(dbLatestMcols);
        let tabView = new TransformerRuleTabletView(selectedTab, transformerRule, typeMetas);
        this.setEProp(KEY_OPTIONS_ENUM, tabView);
        this._tupleViewType = tabView.viewType();
    }

    public setTableView(tabView: TuplesProperty) {
        // console.log(dbLatestMcols);
        // let tabView = new TransformerRuleTabletView(transformerRule, typeMetas);
        this.setEProp(KEY_OPTIONS_ENUM, tabView);
        this._tupleViewType = tabView.viewType();
    }


    private _tupleViewType: TuplesPropertyType;

    /**
     * in class ItemPropVal
     */
    public get tuplesViewType(): TuplesPropertyType {
        return this._tupleViewType;
    }

    public get mcolsEnums(): TuplesProperty {
        let enumVal: TuplesProperty = this.getEProp(KEY_OPTIONS_ENUM)
        return enumVal;
    }

    public set mcolsEnums(tuplesProp: TuplesProperty) {
        this.setEProp(KEY_OPTIONS_ENUM, tuplesProp);
    }

    public setPropValEnums(cols: Array<{ name: string, value: string }>, colItemChecked?: (optVal) => boolean) {
        // console.log([cols, colItemChecked]);
        if (!colItemChecked) {
            colItemChecked = (_) => true;
        }
        let enums: Array<OptionEnum> = [];
        cols.forEach((s) => {
            enums.push({label: s.name, val: s.value, checked: colItemChecked(s.value)})
        });
        this.setEProp(KEY_OPTIONS_ENUM, enums);
    }


    get label(): string {
        let label = this._eprops['label'];
        return label ? label : this.key;
    }

    get readonly(): boolean {
        return !!this._eprops['readonly'];
    }

    /**
     * 当
     */
    get enumMode(): NzSelectModeType {
        return this.getEProp('enumMode') || 'default';
    }

    public getEProp(key: string): any {
        return this._eprops[key];
    }

    public setEProp(key: string, val: any): void {
        this._eprops[key] = val;
    }


    set primary(val: any) {
        this._primaryVal = val;
    }

    get primary(): any {

        if (!this.updateModel && !this.has_set_primaryVal && this.dftVal !== undefined) {
            // 新增模式下
            this._primaryVal = this.dftVal;
            this.has_set_primaryVal = true;
        }
        if (this._primaryVal === undefined) {
            this._primaryVal
                = ((this.type === TYPE_ENUM || this.type === TYPE_PLUGIN_SELECTION) && this.enumMode === 'multiple')
                ? [] : '';
        }
        return this._primaryVal;
        // return this.updateModel ? this._primaryVal : this.dftVal;
    }

    get primaryVal(): boolean {
        return !(this.descVal);
    }
}

export class Descriptor {
    // 表单内嵌深度，深度到达一定深度，表单的布局需要调整一下
    formLevel: number;
    impl: string;
    implUrl: string;
    containAdvance: boolean;
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

    private static wrapDescriptor(d: Descriptor): Descriptor {


        if (d.manipulate) {
            let pluginManipulate = d.manipulate;
            let storeMeta: { descMeta: Descriptor, identityName: string };
            if (pluginManipulate.stored) {
                for (let i = 0; i < pluginManipulate.stored.length; i++) {
                    storeMeta = pluginManipulate.stored[i];

                    storeMeta.descMeta = Descriptor.wrapDescriptor(Object.assign(new Descriptor(), {attrs: []}, storeMeta.descMeta /**没有attrs*/));

                    // console.log(storeMeta.descMeta);
                    // let i: Item = Object.assign(new Item(desc), pluginManipulate.stored[i]);
                    // i.wrapItemVals();
                }
            }
        }


        let attrs: AttrDesc[] = [];
        let attr: AttrDesc;
        d.attrs.forEach((a) => {

            attr = Object.assign(new AttrDesc(), a);
            if (attr.describable) {
                attr.descriptors = Descriptor.wrapDescriptors(attr.descriptors);
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
        return d;
    }

    public static wrapDescriptors(descriptors: Map<string /* impl */, Descriptor>)
        : Map<string /* impl */, Descriptor> {
        if (!descriptors) {
            throw new Error("param descriptors can not be null");
        }
        let descMap: Map<string /* impl */, Descriptor> = new Map();
        let d: Descriptor = null;
        for (let impl in descriptors) {
            d = Object.assign(new Descriptor(), descriptors[impl]);

            descMap.set(impl, Descriptor.wrapDescriptor(d));
        }

        return descMap;
    }

    public findAttrDesc(attrKey: string, validateNull: boolean): AttrDesc {
        for (let attr of this.attrs) {
            if (attrKey === attr.key) {
                return attr;
            }
        }
        if (validateNull) {
            throw new Error("can not find attr with key:"
                + attrKey + " exist keys:" + this.attrs.map((attr) => attr.key).join(","));
        }
    }

    public get endtype(): string {
        return this.extractProps['endType'];
    }

    public get manipulateStorable(): boolean {
        return !!this.extractProps['manipulateStorable'];
    }

    public get supportIcon(): boolean {
        return !!this.extractProps['supportIcon'];
    }

    public static createNewItem(des: Descriptor, updateModel: boolean
        , itemPropSetter?: (key: string, propVal: ItemPropVal) => ItemPropVal): Item {
        if (!itemPropSetter) {
            itemPropSetter = (_, propVal) => propVal;
        }
        let nItem = new Item(des);

        nItem.displayName = des.displayName;
        nItem.implUrl = des.implUrl;
        // nItem.containAdvance = des.containAdvance;
        des.attrs.forEach((attr) => {
            //Item.wrapItemPropVal
            nItem.vals[attr.key] = itemPropSetter(attr.key, ((attr.addNewEmptyItemProp(updateModel))));
        });
        return nItem
    }

    /**
     *
     * @param h
     * @param des
     * @param updateModel 是否是更新模式，在更新模式下，插件的默认值不能设置到控件上去
     */
    public static addNewItem(h: HeteroList, des: Descriptor, updateModel: boolean
        , itemPropSetter: (key: string, propVal: ItemPropVal) => ItemPropVal): void {
        let nItem = Descriptor.createNewItem(des, updateModel, itemPropSetter);

        h.items = [...h.items, nItem];
    }


    public static addNewItemByDescs(h: HeteroList, decs: Array<Descriptor>, updateModel: boolean
        , itemPropSetter: (key: string, propVal: ItemPropVal) => ItemPropVal): void {
        let des: Descriptor;
        // let nitems: Item[] = [];
        for (let index = 0; index < decs.length; index++) {
            des = decs[index];
            Descriptor.addNewItem(h, des, updateModel, itemPropSetter);
        }
    }

    public get eprops(): PluginExtraProps {
        let extraProps: PluginExtraProps = <any>this.extractProps;
        return extraProps;
    }

    // public get notebook(): NotebookMeta {
    //   let note: NotebookMeta = this.extractProps["notebook"];
    //   return note;
    // }

    public get manipulate(): PluginManipulate {
        let manipulate: PluginManipulate = this.extractProps["manipulate"];
        return manipulate;
    }

    public get helpPath(): string {
        return this.extractProps["helpPath"];
    }

    public get supportBatch(): boolean {
        return !!this.extractProps["supportBatch"];
    }
}

// export interface NotebookMeta {
//   // 是否可用
//   ability: boolean;
//   // 服务端是否激活
//   activate: boolean;
// }

/**
 * 插件操作扩展点
 */
export interface PluginManipulate {
    //扩展点
    extendPoint: string;
    /**
     * <pre>
     * displayName: "Export To Dolphinscheduler"
     * endType: "ds"
     * identityName:"ttt"
     * impl:"com.qlangtech.tis.plugin.datax.doplinscheduler.export.ExportTISPipelineToDolphinscheduler"
     * implUrl : "http://tis.pub/docs/plugin/plugins/#comqlangtechtisplugindataxdoplinschedulerexportexporttispipelinetodolphinscheduler"
     * supportIcon :true
     * </pre>
     */
    stored: Array<PluginManipulateMeta>;
}

export type PluginManipulateMeta = { descMeta: Descriptor, identityName: string };

export interface TisResponseResult {
    bizresult?: any;
    success: boolean;
    errormsg?: string[];
    action_error_page_show?: boolean;
    msg?: Array<any>;
    errorfields?: Array<Array<Array<IFieldError> | Map<string, Array<IFieldError>>>>;
}

export enum TuplesPropertyType {
    MongoCols = ('mongoCols'),
    JdbcTypeProps = ("jdbcTypeProps"),
    TransformerRules = ('transformerRules'),
    SimpleCols = ('simpleCols')
}


export class SynchronizeMcolsResult {
    syncCols: Array<ReaderColMeta> = [];
    newAddCols: Array<string> = [];
    deletedCols: Array<string> = [];

    constructor(syncCols: Array<ReaderColMeta>) {
        this.syncCols = syncCols;
    }

    get hasAnyDiff(): boolean {
        return this.newAddCols.length > 0 || this.deletedCols.length > 0;
    }

    get differSummary(): string {
        let differ = '';
        if (this.newAddCols.length > 0) {
            differ += " 新增：" + this.newAddCols.map((c) => "'" + c + "'").join(",");
        }
        if (this.deletedCols.length > 0) {
            differ += " 删除：" + this.deletedCols.map((c) => "'" + c + "'").join(",");
        }
        return differ;
    }
}

export interface ReaderColMeta {
    openAssist: boolean;
    index: number;
    name: Item | string;
    type: string | DataTypeDesc;
    disable: boolean;
    ip: ItemPropVal;
    // extraProps?: { string?: any };

    /**
     * 是否是新添加的列，有别与其他的从数据源带过来的字段，例如在csv导入到mysql流程中，由于csv文件的字段中没有可以作为主键的字段
     * ，所以需要在DataxAddStep6ColsMetaSetterComponent页面需要添加一个虚拟列作为主键的占位符，在后一个流程transformer中为其赋值
     */
    virtual?: boolean;
}

export interface DataTypeMeta {
    colsSizeRange: { min: number, max: number };
    decimalRange: { min: number, max: number };
    containColSize: boolean;
    "containDecimalRange": boolean,
    "type": DataTypeDesc
    //   {
    //   "columnSize": number,
    //   "decimalDigits": number,
    //   //"s": "12,32,",
    //   "type": number,
    //   //"typeDesc": "varchar(32)",
    //   "typeName": string,
    //   // "unsigned": false,
    //   // "unsignedToken": ""
    // }
}

export interface CMeta {
    "name": string,
    "type": DataTypeDesc
}

export interface DataTypeDesc {
    "columnSize": number,
    "decimalDigits": number,
    //"s": "12,32,",
    "type": number,
    //"typeDesc": "varchar(32)",
    "typeName": string,
    // "unsigned": false,
    // "unsignedToken": ""
}

export type ItemValType
    = ItemPropVal | { [key: string]: ItemPropVal } | Array<Item>

/**
 * 对应一个plugin的输入项
 */
export class Item {
    impl = '';
    implUrl: string;
    public dspt: Descriptor;
    //  vals: Map<string /**key*/, string | DescribleVal> = new Map();
    // vals: Map<string /**key*/, ItemPropVal> = new Map();
    // 后一种类型支持subform的类型
    /**
     * subform format:
     * <pre>
     *   vals:{
     *     tableName:[
     *      {
     *       impl:""
     *       vals:{ k1:v1,k2:v2,k3:v3}
     *      },{},{}
     *     ]
     *   }
     *
     * </pre>
     */
    public vals: { [key: string]: ItemValType } = {}
    // | { [key: string]: { [key: string]: ItemPropVal } }
    // | { [key: string]: Array<Item> } = {};
    displayName = '';
    private _propVals: ItemPropVal[];

    /**
     * 提交到服务端时，为了服务端执行日志只打印必要的信息，需要在客户端对提交的json内容作投影，只提交必要的信息
     */
    public project(): Item {
        let it: Item = ls.pick(this, ['impl', 'vals']);
        let itPropVal: ItemValType = null;
        it.vals = Object.assign({}, it.vals);
        for (let key in it.vals) {
            itPropVal = it.vals[key];
            if (typeof itPropVal === 'string') {
                continue;
            } else if (Array.isArray(itPropVal)) {
                // 保存整体表单的操作
                let its = new Array<Item>();
                for (let i of itPropVal) {
                    its.push(i.project());
                }
                it.vals[key] = its;
            } else if (itPropVal instanceof ItemPropVal) {
                it.vals[key] = itPropVal.project();
            } else {
                throw new Error("illegal type of item prop val:" + typeof itPropVal);
            }
        }
        return it;
    }

    /**
     * 表单中有高级字段，是否显示全部？
     */
    public showAllField = false;

    get pk(): ItemPropVal {
        let vs = <{ [key: string]: ItemPropVal }>this.vals;
        for (let key in vs) {
            if (vs[key].pk) {
                return vs[key];
            }
        }
        return null;
    }

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
        //console.log([errorFields,items]);
        if (errorFields) {
            for (let index = 0; index < errorFields.length; index++) {
                fieldsErrs = errorFields[index];
                item = items[index];
                let itemProp: ItemPropVal;
                let containAdvanceField = false;
                fieldsErrs.forEach((fieldErr) => {

                    let ip = item.vals[fieldErr.name];
                    // console.log([item.vals, fieldErr.name, fieldErr, item.vals[fieldErr.name], ip]);
                    if (ip instanceof ItemPropVal) {

                        itemProp = ip;
                        itemProp.error = fieldErr.content;
                        if (itemProp.advance) {
                            containAdvanceField = true;
                        }
                        if (!itemProp.primaryVal && fieldErr.errorfields) {
                            // console.log(fieldErr);
                            if (fieldErr.errorfields.length !== 1) {
                                throw new Error(`errorfields length ${fieldErr.errorfields.length} shall be 1`);
                            }
                            Item.processErrorField(fieldErr.errorfields, [itemProp.descVal]);
                        }
                    } else {
                        console.log([fieldErr.name, ip, item.vals])
                        throw new Error("illegal type");
                    }
                });

                if (containAdvanceField) {
                    // 错误字段中有在高级选项中的字段，需要将高级字段展示打开
                    item.showAllField = true;
                }
            }
        }
    }

    public static processFieldsErr(result: TisResponseResult): Item {
        let errFields = result.errorfields;
        if (errFields && errFields.length > 0) {
            let pluginsErr = errFields[0];
            if (pluginsErr.length > 0) {
                let pluginErr: Array<IFieldError> = <Array<IFieldError>>pluginsErr[0];
                let errKeys = pluginErr.map((r) => r.name);
                let item: Item = Item.create(errKeys);
                Item.processErrorField(<Array<Array<IFieldError>>>pluginsErr, [item]);
                return item;
            }
        }
        return Item.create([]);
    }

    public static wrapItemPropVal(v: any, at: AttrDesc): ItemPropVal {
        if (v === undefined || v === null || v instanceof ItemPropVal) {
            return v;
        }
        let newVal: ItemPropVal = at.addNewEmptyItemProp(true);

        if (at.describable) {
            let d = at.descriptors.get(v.impl);
            if (!d) {
                console.log(v);
                throw new Error(`impl:${v.impl},field:${at.key} exist descs:${at.descriptors.size} can not find relevant descriptor`);
            }
            let ii: Item = Object.assign(new Item(d), v);
            ii.wrapItemVals();
            newVal.descVal = at.createDescribleVal(ii);
        } else {
            if (at.isMultiSelectableType) {
                this.buildMultiSelectedAttr(v, at, newVal);
            } else {
                newVal._primaryVal = v;
            }
        }
        return newVal;
    }


    public static buildMultiSelectedAttr(val: Array<any>, at: AttrDesc, newVal: ItemPropVal) {
        if (!at.isMultiSelectableType) {
            throw new Error("attr " + at.key + " must be multi selectable type");
        }
        if (!Array.isArray(val)) {
            // console.log(v);
            //throw new Error("expect val type is array but is not");
        }
        // console.log([at, v, at.eprops[KEY_OPTIONS_ENUM]]);
        if (!at.eprops) {
            // console.log(at);
            throw new Error("at.eprops can not be null");
        }
        let enumVal = at.eprops[KEY_OPTIONS_ENUM];
        let mcols: Array<ReaderColMeta>;
        let typeMetas: Array<DataTypeMeta>;


        if (mcols = enumVal["tabMapper"]) {
            // console.log(v);
            let contentType: TuplesPropertyType = enumVal["viewContentType"];
            let elementKeys: Array<string> = enumVal["elementKeys"];
            typeMetas = enumVal["colMetas"];
            switch (contentType) {
                case TuplesPropertyType.MongoCols: {
                    newVal.setMcolsEnums(elementKeys || [], mcols, (val.length > 0) ? val : mcols, typeMetas);
                    break;
                }
                case TuplesPropertyType.TransformerRules: {

                    let selectedTab: string = enumVal[KEY_subform_DetailIdValue];
                    let transformerRule: Array<RecordTransformer> = [...val];
                    // console.log(transformerRule);
                    newVal.setTransformerRules(elementKeys || [], transformerRule, typeMetas, selectedTab);
                    break;
                }
                case TuplesPropertyType.JdbcTypeProps: {

                    let selectedTab: string = enumVal[KEY_subform_DetailIdValue];
                    //  console.log(selectedTab);

                    let isCollection: boolean = enumVal["isList"];
                    let dftListElementDesc: Descriptor = null;
                    let selectFromExistField: boolean = false;
                    if (isCollection) {
                        // console.log(enumVal);
                        let dftDescs = Descriptor.wrapDescriptors(enumVal["dftListElementDesc"]);
                        for (let desc of dftDescs.values()) {
                            dftListElementDesc = desc;
                            break;
                        }
                        if (!dftListElementDesc) {
                            console.log(["dftDescs", dftDescs]);
                            throw new Error("dftListElementDesc can not be null");
                        }
                        // 字段类型是否呈现selector 下列列表的形式，下来列表的可选表从当前选中表的列选择
                        selectFromExistField = enumVal["selectFromExistField"];
                    }
                    // console.log(val);
                    let jdbcProps: Array<JdbcTypeProp> = Array.isArray(val) ? [...val] : [val];
                    //console.log(enumVal);
                    // plugin 中的元素是否是集合，例如： CopyValUDF中的to 属性为 isCollection 为false

                    let tabCols: Array<CMeta> = enumVal["sourceTabCols"];
                    let tabColsMapper: Map<string, CMeta> = new Map();
                    tabCols.forEach((col) => {
                        tabColsMapper.set(col.name, col);
                    });

                    let dftType: DataTypeDesc = enumVal["dftStrType"];


                    newVal.setTableView(new JdbcTypePropsProperty(selectedTab, jdbcProps, isCollection, selectFromExistField, dftListElementDesc, typeMetas, tabColsMapper, dftType));
                    break;
                }
                default:
                    throw new Error(`error content type:${contentType}`)

            }

            // console.log([mcols,elementKeys,typeMetas]);

        } else {
            let selectableCol: Array<{ val: string, label: string }> = at.eprops[KEY_OPTIONS_ENUM];
            if (!selectableCol) {
                throw new Error("selectableCol can not be null");
            }
            let cols: Array<{ name: string, value: string }> = null;
            if (selectableCol.length < 1) {
                cols = val.map((r) => {
                    return {name: r, value: r}
                });
                newVal.setPropValEnums(cols, (_) => true);
            } else {
                cols = selectableCol.map((c) => {
                    return {"name": c.label, "value": c.val}
                });
                newVal.setPropValEnums(cols, (sval) => {
                    return !!val.find((optVal) => optVal === sval);
                });
            }
        }
    }

// containAdvance = false;

    /**
     * 字段中是否包含高级字段（可以隐藏）
     */
    public get containAdvanceField(): boolean {
        return this.dspt.containAdvance;
    }


    constructor(_dspt: Descriptor, public updateModel = false) {
        // console.log(_dspt);
        // if (dspt) {
        //   this.impl = dspt.impl;
        // }
        this.newDesc = _dspt;
    }

    public set newDesc(desc: Descriptor) {
        this.dspt = desc;
        if (desc) {
            this.impl = desc.impl;
        } else {
            this.impl = null;
        }
    }

    public get implVal() {
        if (!this.updateModel) {

        }
        return '';
    }

    public wrapItemVals(): void {
        let newVals = {};
        let ovals: any /**map*/ = this.vals;
        //  console.log([this.dspt.impl, this.vals]);
        let newVal: ItemPropVal;
        // console.log(this.dspt.attrs);
        this.dspt.attrs.forEach((at) => {
            let v = ovals[at.key];
            // console.log([at.key, v, at]);
            newVal = Item.wrapItemPropVal(v, at);
            // console.log([at.key, newVal]);
            if (newVal) {
                newVals[at.key] = (newVal);
            }
        });
        this.vals = newVals;
    }

    public clearPropVals(dspClear = true): void {
        delete this._propVals;
        this.vals = {};
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
            let ip: ItemPropVal | { [key: string]: ItemPropVal } | Array<Item> = this.vals[attr.key];
            if (!ip) {
                // throw new Error(`attrKey:${attr.key} can not find relevant itemProp`);
                ip = attr.addNewEmptyItemProp(this.updateModel);
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
    extendPoint: string;
    extensible: boolean;
}

export class AttrDesc {
    key: string;
    ord: number;
    // 是否是主键
    pk: boolean;
    advance: boolean;
    /**
     * 当describable为true时descriptors 应该有内容
     * */
    descriptors: Map<string /*impl*/, Descriptor>;
    describable: boolean;
    extendPoint: string;
    // 实现类型是否可以在运行期添加
    extensible: boolean;
    type: number;
    options: Array<ValOption>;
    required: boolean;
    eprops: { String: any };

    // MULTI_SELECTABLE
    public get isMultiSelectableType(): boolean {
        return this.type === TYPE_PLUGIN_MULTI_SELECTION;
    }

    public get label(): string {
        return this.eprops[KEY_LABEL];
    }

    /**
     *
     * @param updateModel 是否是更新模式，在更新模式下，插件的默认值不能设置到控件上去
     */
    public addNewEmptyItemProp(updateModel: boolean): ItemPropVal {
        let desVal = new ItemPropVal(updateModel);
        desVal.key = this.key;
        desVal.pk = this.pk;
        desVal.advance = this.advance;
        desVal.eprops = Object.assign({}, this.eprops);
        desVal.required = this.required;
        desVal.type = this.type;
        // 当type为6时，options应该有内容
        desVal.options = this.options;
        if (this.describable) {
            desVal.descVal = this.createDescribleVal(new Item(null, updateModel));
            if (this.eprops) {
                let displayName = this.eprops[KEY_DEFAULT_VALUE];
                // displayName
                if (!updateModel && displayName) {
                    // 在新建时候
                    for (let e of desVal.descVal.descriptors.values()) {
                        if (displayName === e.displayName) {
                            desVal.descVal.impl = e.impl;
                            desVal.descVal.dspt = e;
                            break;
                        }
                    }
                }
            }
        } else {
            if (this.isMultiSelectableType) {
                Item.buildMultiSelectedAttr([], this, desVal);
            }
        }
        return desVal;
    }

    public createDescribleVal(v: Item): DescribleVal {
        // console.log(v);
        let descVal = new DescribleVal(v.dspt, v.updateModel);
        descVal.extensible = this.extensible;
        descVal.extendPoint = this.extendPoint;
        descVal.displayName = v.displayName;
        // descVal.containAdvance = v.containAdvance;
        // descVal.impl = v.impl;
        descVal.vals = v.vals;
        this.descriptors.forEach((entry) => {
            descVal.descriptors.set(entry.impl, entry);
        });
        return descVal;
    }
}


/*HeteroList*/
export class HeteroList {
    descriptors: Map<string /* impl */, Descriptor> = new Map();
    private _descriptorList: Array<Descriptor>;

    identityId: string;
    // item 可选数量
    cardinality: string;
    caption: string;
    extensionPoint: string;
    extensionPointUrl: string;
    items: Item[] = [];

    pluginCategory: PluginType;

    public static isDescFilterDefined(type: PluginType): type is PluginMeta {
        if (!type) {
            return false;
        }
        let filter = (<PluginMeta>type).descFilter;
        return !!filter && !!filter.endType;
    }

    private _captionId: string;
    public get captionId(): string {
        if (!this._captionId) {
            let t: string = this.caption || '';
            this._captionId = t.replace(/ /g, '_');
        }
        return this._captionId;
    }

    public get descriptorList(): Array<Descriptor> {
        if (!this._descriptorList) {
            this._descriptorList = Array.from(this.descriptors.values());
        }
        return this._descriptorList;
    }

    public get endType(): string {
        // console.log(this.pluginCategory);
        if (HeteroList.isDescFilterDefined(this.pluginCategory)) {
            return this.pluginCategory.descFilter.endType();
        }
        return null;
    }


    public get identity(): string {
        return this.extensionPoint.replace(/\./g, '-');
    }

    public updateDescriptor(newDescriptors: Map<string /* impl */, Descriptor>): void {
        this.descriptors = newDescriptors;
        this._descriptorList = undefined;
    }

    public get addItemDisabled(): boolean {
        return (this.cardinality === '1' && this.items.length > 0);
    }
}

export class PluginSaveResponse {
    constructor(public saveSuccess: boolean, public formDisabled: boolean, private savePluginEvent: SavePluginEvent, private bizResult?: any) {

    }

    /**
     * 是否是删除操作流程
     */
    public get deleteProcess(): boolean {
        return this.savePluginEvent.deleteProcess;
    }

    public getPostPayloadPropery(key: string): any {
        return this.savePluginEvent && this.savePluginEvent.postPayload && this.savePluginEvent.postPayload[key];
    }

    public get verify(): boolean {
        return this.savePluginEvent && (this.savePluginEvent.verifyConfig === VerifyConfig.VERIFY);
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
    // 端类型，mysql，docker，sqlserver
    public endType: string;
}

export interface OptionEnum {
    // {label: s.name, val: s.value, checked: colItemChecked(s.value)}
    label: string;
    val: string;
    checked: boolean;
}

export enum VerifyConfig {
    FIRST_VALIDATE = ("first"),
    SECOND_VALIDATE = ("second"),
    VERIFY = ("verify"),
    /**
     * 最严格的校验 VERIFY + FIRST_VALIDATE 都要执行
     */
    STRICT = ("strict")
}

export const FLAG_DELETE_PROCESS = "deleteProcess";

export class SavePluginEvent {
    /**
     * 是否跳过插件持久化保存阶段
     */
    skipPluginSave: boolean = false;
    public verifyConfig: VerifyConfig = VerifyConfig.FIRST_VALIDATE;

    public get justVerify(): boolean {
        return this.verifyConfig === VerifyConfig.VERIFY;
    }

    /**
     * example: "coredefine:core_action:determine_process_kerbernete_application_cfg";
     */
    public serverForward;
    public postPayload: { [key: string]: any };
    public overwriteHttpHeader: Map<string, string>;

    constructor(public notShowBizMsg = false) {
    }

    public static createPostPayload( pluginMeta: PluginType, updateProcess: boolean): SavePluginEvent {
        let opt = new SavePluginEvent();
        opt.postPayload = {
           // 'manipulateTarget': hostItem
             'manipulatePluginMeta': getPluginMetaParam(pluginMeta)
            , 'updateProcess': updateProcess
        };
        return opt;
    }

    public overwriteHttpHeaderOfAppName(val: string) {
        let headerOverwrite = new Map<string, string>();
        headerOverwrite.set(KEY_APPNAME, val);
        this.overwriteHttpHeader = headerOverwrite;
    }

    get deleteProcess(): boolean {
        return this.postPayload && this.postPayload[FLAG_DELETE_PROCESS];
    }

}

export interface DataType {
    typeDesc: string;
}

export interface IColumnMeta {
    key: string;
    pk: boolean;
    index: number;

    nullable: boolean;

    comment: string;

    type: DataType;
}

//{ tableid?: number, dbId?: string, dbName?: string, isNew: boolean }
export class DataBase {
    constructor(public dbId: string, public dbName: string) {
    }
}

export class SuccessAddedDBTabs {
    public db: DataBase;

    constructor(tab: TablePojo, private tabs: { [key: string]: Array<Item> }) {
        if (tab) {
            this.db = new DataBase(tab.dbId, tab.dbName);
        }
    }

    public get tabKeys(): Array<string> {
        let tabs: Array<string> = [];

        for (let tabName in this.tabs) {
            tabs.push(tabName);
        }
        return tabs;
    }
}

export const KEY_DOC_FIELD_SPLIT_METAS = "docFieldSplitMetas";

/**
 * 该类目前只为mongo 的document 类型的field拆解而用
 */
export class RowAssist {
    public _ip: Map<string, ErrorFeedback>;

    public static getDocFieldSplitMetas(u: ReaderColMeta): Array<RowAssist> {
        let rowAssist: Array<RowAssist> = u[KEY_DOC_FIELD_SPLIT_METAS];
        if (!rowAssist) {
            rowAssist = [];
        }
        return rowAssist;
    }

    static setDocFieldSplitMetas(u: ReaderColMeta, rowAssist: Array<RowAssist>) {
        u[KEY_DOC_FIELD_SPLIT_METAS] = [...rowAssist];
    }

    constructor(public name: string, public jsonPath: string, public type: DataTypeDesc) {
        this._ip = new Map<string, ErrorFeedback>();
    }

    public getIp(propName: string): ErrorFeedback {
        let ip = this._ip.get(propName);
        if (!ip) {
            ip = new ItemPropVal();
            this._ip.set(propName, ip);
        }
        return ip;
    }
}

