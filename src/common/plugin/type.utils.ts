import {
    DataTypeMeta,
    Item,
    PluginName, PluginType,
    ReaderColMeta,
    SavePluginEvent,
    TisResponseResult,
    TuplesPropertyType
} from "../tis.plugin";
import {BasicFormComponent} from "../basic.form.component";
import {HttpParams} from "@angular/common/http";

export const KEY_subform_DetailIdValue = "subformDetailIdValue";

export enum RouterAssistType {
    hyperlink = 'hyperlink',
    dbQuickManager = 'dbQuickManager',
    paramCfg = 'paramCfg'
}

export interface CreatorRouter {

    assistType: RouterAssistType;

    routerLink: string;
    label: string;
    plugin: Array<TargetPlugin>;
}

export function router2PluginTypes(createCfg: CreatorRouter): PluginType[] {
    let pluginTyps: PluginType[] = [];
    for (let p of createCfg.plugin) {
        for (let pt of convertReducePluginType2PluginTypes(reducePluginType2Map({
            plugin: [p],
            assistType: createCfg.assistType,
            routerLink: null,
            label: null
        }))) {
            pluginTyps.push(pt);
        }
    }
    return pluginTyps;
}


export function reducePluginType2Map(createCfg: CreatorRouter): Map<PluginName, Array<TargetPlugin>> {
    let tp: TargetPlugin;
    let reducePluginType: Map<PluginName, Array<TargetPlugin>> = new Map<PluginName, Array<TargetPlugin>>();
    let tplugins: Array<TargetPlugin>;
    for (let i = 0; i < createCfg.plugin.length; i++) {
        tp = createCfg.plugin[i];
        tplugins = reducePluginType.get(tp.hetero);
        if (!tplugins) {
            tplugins = new Array<TargetPlugin>();
            reducePluginType.set(tp.hetero, tplugins);
        }
        tplugins.push(tp);
    }
    // console.log(reducePluginType);
    return reducePluginType;
}

export function convertReducePluginType2PluginTypes(reducePluginType: Map<PluginName, Array<TargetPlugin>>): PluginType[] {

    let pluginTyps: PluginType[] = [];

    for (const [key, val] of reducePluginType.entries()) {
        // console.log(key);
        // console.log(val);
        let extraParam = null;
        let descFilter = {
            localDescFilter: (desc) => true
        };
        let tp: TargetPlugin = {hetero: key};
        if (val.length > 0) {
            tp = val[0];
            let targetDescDisplayName = (tp.targetItemDesc || tp.descName);
            if (targetDescDisplayName) {
                extraParam = "targetItemDesc_" + targetDescDisplayName;
                if (tp.extraParam) {
                    extraParam += (',' + tp.extraParam);
                }
                descFilter = {
                    localDescFilter: (desc) => {
                        return desc.displayName === targetDescDisplayName;
                    }
                };
            }
        }
        pluginTyps.push({
            name: tp.hetero
            , require: true
            , extraParam: extraParam
            , descFilter: descFilter
        });
    }
    return pluginTyps;
}

export interface TargetPlugin {
    hetero: PluginName;
    /**
     * <br>ParamsConfig 一个实现的扩展类型下 可以有不同的实现，
     * 例如：ParamsConfig-> LLMProvider -> 1. DeepSeekProvider 2.QwenProvider 此时 <br>
     *        UserProfile 下的llm配置为
     *<pre>
     * {
     *  "hetero": "params-cfg-user-isolation",
     * "targetItemDesc": "LLM",
     * "descName": "DeepSeek"
     * }
     *</pre>
     */
    targetItemDesc?: string;
    extraParam?: string;
    descName?: string;
    endType?: string;
    //页面初始化显示Descriptor时传输的参数= new HttpParams();
    pluginInitialParams?: HttpParams;
}

export interface OpenPluginDialogOptions {
    opt?: SavePluginEvent;
    // 如更新已有表单，就将item添加上
    item?: Item;
    shallLoadSavedItems: boolean;
    /**
     * 最上头保存按钮的label
     */
    saveBtnLabel?: string;
    enableDeleteProcess?: boolean
    /**
     * 是否要覆写创建SavePluginEvent的行为
     */
    savePluginEventCreator?: () => SavePluginEvent;
}

/**
 * 多元组属性
 */
export interface TuplesProperty {
    viewType(): TuplesPropertyType;

    mcols: Array<ReaderColMeta>;
    typeMetas: Array<DataTypeMeta>;
}

export const KEY_APPNAME = "appname";

export interface ITableAlias {
    from: string;
    to: string;
    error: string;
}

export function getTableMapper(module: BasicFormComponent, dataxPipeName: string, forceInit?: boolean): Promise<Array<ITableAlias>> {
    let url = '/coredefine/corenodemanage.ajax';
    return module.httpPost(url, 'action=datax_action&emethod=get_table_mapper&dataxName=' + dataxPipeName + "&forceInit=" + forceInit)
        .then((r) => {
            if (r.success) {
                return <Array<ITableAlias>>r.bizresult;
            }
        });
}
