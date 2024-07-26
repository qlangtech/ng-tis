import {
  DataTypeMeta,
  Item,
  PluginName,
  ReaderColMeta,
  SavePluginEvent,
  TisResponseResult,
  TuplesPropertyType
} from "../tis.plugin";
import {BasicFormComponent} from "../basic.form.component";

export const KEY_subform_DetailIdValue = "subformDetailIdValue";

export interface CreatorRouter {
  routerLink: string;
  label: string;
  plugin: Array<TargetPlugin>;
}

export interface TargetPlugin {
  hetero: PluginName;
  extraParam?: string;
  descName?: string;
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

export function getTableMapper(module: BasicFormComponent, dataxPipeName: string): Promise<Array<ITableAlias>> {
  let url = '/coredefine/corenodemanage.ajax';
  return module.httpPost(url, 'action=datax_action&emethod=get_table_mapper&dataxName=' + dataxPipeName)
    .then((r) => {
      if (r.success) {
        return <Array<ITableAlias>>r.bizresult;
      }
    });
}
