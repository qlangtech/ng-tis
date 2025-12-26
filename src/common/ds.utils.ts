import {DATAX_PREFIX_DB, Descriptor, HeteroList, Item, PluginType} from "../common/tis.plugin";
import {BasicFormComponent} from "../common/basic.form.component";
import {NzTreeNode} from "ng-zorro-antd/tree";

import {CreatorRouter, router2PluginTypes} from "../common/plugin/type.utils";
import {PluginsComponent} from "./plugins.component";

export const db_model_detailed = "detailed";

export function createDataSourceDetailedPluginsMetas(dbName: string): PluginType[] {
  return [{
    name: 'datasource',
    'require': true,
    'extraParam': `dsname_${dbName},type_${db_model_detailed},update_true`
  }];
}

export class DbPojo {
  dbName = '';
  // 插件实现
  pluginImpl: string;
  readerPluginImpl: string;
  // 是否是Cobar配置
  facade = false;
  // 对应的DataSource是否已经设置DataX配置？
  dataReaderSetted = false;
  supportDataXReader = false;

  constructor(public dbId?: string) {

  }
}

export interface DBClickResponse {
  db: DbPojo,
  facadeDb: DbPojo,
  tabs: Array<string>
}

export interface TableClickResponse {
  selectedTable: { tableName?: string, dbId?: number, dbName?: string };
  selectedTableHeteroList: HeteroList[];
  selectedTablePluginMeta: Array<PluginType>;
}

export enum NodeType {
  DB = 'db',
  TAB = 'table'
}

export interface ISubDetailTransferMeta {
  id: string;
  // behaviorMeta: ISubDetailClickBehaviorMeta;
  fieldName: string;
  idList: Array<string>;
  // 是否已经设置子表单
  setted: boolean;
}

export function clickDBNode(
  basicCpt: BasicFormComponent, event: { 'type': NodeType, 'dbId': string, 'name'?: string }, targetNode?: NzTreeNode)
  : Promise<DBClickResponse | TableClickResponse> {
  if (!event.dbId) {
    throw new Error("param event.dbId can not be empty");
  }
  let type = event.type;
  let id = event.dbId;

//  let realId = 0;
  let action = `action=offline_datasource_action&emethod=get_datasource_${type}_by_id&id=${id}&labelName=${event.name}`;

  return basicCpt.httpPost('/offline/datasource.ajax', action)
    .then(result => {
      try {
        if (result.success) {

          let biz = result.bizresult;
          // console.log([biz, type])
          if (type === NodeType.DB) {
            let detail = biz.detailed;
            let db: DbPojo = createDB(id, detail, biz.dataReaderSetted, biz.supportDataXReader);
            // console.log([detail,db,targetNode]);
            let tabs: Array<string> = biz.selectedTabs;
            let facdeDb: DbPojo = null;
            if (biz.facade) {
              facdeDb = createDB(id, biz.facade);
              facdeDb.facade = true;
            }

            return {"db": db, "tabs": tabs, "facadeDb": facdeDb} as DBClickResponse;
          } else if (type === NodeType.TAB) {
            let descs: Map<string /* impl */, Descriptor> = Descriptor.wrapDescriptors(biz);
            let desc: Descriptor = descs.values().next().value;
            //  console.log([biz, descs, desc]);
            let dbName = targetNode.parentNode.title;
            let selectedTable = {
              tableName: event.name,
              dbName: dbName,
              dbId: parseInt(targetNode.parentNode.key, 10)
            };
            if (!targetNode) {
              throw new Error("targetNode must be present");
            }
            // this.selectedDb = new DbPojo();
            let m = dataXReaderSubFormPluginMeta(desc.displayName, desc.impl, "selectedTabs", (DATAX_PREFIX_DB + dbName));
            let selectedTablePluginMeta = [m];
            let meta = <ISubDetailTransferMeta>{id: event.name};

            // DataxAddStep4Component.initializeSubFieldForms(this, m, desc.impl
            //   , true, (subFieldForms: Map<string /*tableName*/, Array<Item>>, subFormHetero: HeteroList, readerDesc: Descriptor) => {

            return processSubFormHeteroList(basicCpt, m, meta, null // , subFormHetero.descriptorList[0]
            )
              .then((hlist: HeteroList[]) => {
                // this.openSubDetailForm(meta, pluginMeta, hlist);
                let selectedTableHeteroList = hlist;

                return {
                  "selectedTable": selectedTable,
                  "selectedTablePluginMeta": selectedTablePluginMeta,
                  "selectedTableHeteroList": selectedTableHeteroList
                } as TableClickResponse;
              });
            //  });
          }
        } else {
          basicCpt.processResult(result);
        }
      } finally {
      }
    });
}

export interface DataBaseMeta {
  iconEndtype: string;
  id: number;
  name: string;
}

/**
 *
 * @param basicCpt
 * @param filterSupportReader 有部分dataSource 是不支持 dataXReader的，例如Doris，当需要只显示支持dataXReader时此处设置为true
 * @param creatorRouter
 */
export function loadDSWithDesc(
  basicCpt: BasicFormComponent
  , filterSupportReader = false
  , creatorRouter?: CreatorRouter, datasourceName?: string)
  : Promise<{ "dbs": Array<DataBaseMeta>, "dbsWhichSupportDataXReader": Array<DataBaseMeta>, "desc": Array<Descriptor> }> {

  let action = 'emethod=get_datasource_info&action=offline_datasource_action&filterSupportReader=' + filterSupportReader;
  if (creatorRouter) {
    let ptypes: PluginType[] = router2PluginTypes(creatorRouter);
    action += ("&plugin=" + PluginsComponent.getPluginMetaParams(ptypes));
  }

  if (datasourceName) {
    action += (`&datasourceName=${datasourceName}`);
  }
  return basicCpt.httpPost('/offline/datasource.ajax', action)
    .then(result => {
      basicCpt.processResult(result);
      if (result.success) {
        //
        let dbs: Array<DataBaseMeta> = result.bizresult.dbs;
        const dbsWhichSupportDataXReader: Array<DataBaseMeta> = result.bizresult.dbsSupportDataXReader;
        // console.log([dbs,updateTreeInit]);
        let descList = Descriptor.wrapDescriptors(result.bizresult.pluginDesc);
        let datasourceDesc: Array<Descriptor> = Array.from(descList.values());
        datasourceDesc.sort((a, b) => a.displayName > b.displayName ? 1 : -1);
        return {"dbs": dbs, "desc": datasourceDesc, "dbsWhichSupportDataXReader": dbsWhichSupportDataXReader};
      }
    });
}

export interface ProcessedDBRecord {
  dbId: number;
  detailed: Item;
  name: string;
  selectedTabs: Array<any>;
}

export function createDB(id: string, detail: any, dataReaderSetted?: boolean, supportDataXReader?: boolean): DbPojo {
  let db = new DbPojo(id);
  db.dbName = detail.identityName;
  db.pluginImpl = detail.impl;
  db.dataReaderSetted = dataReaderSetted;
  db.supportDataXReader = supportDataXReader;
  return db;
}

/**
 *
 * @param readerDescName
 * @param readerDescImpl
 * @param subformFieldName
 * @param dataXReaderTargetName
 * @param skipSubformDescNullError
 */
export function dataXReaderSubFormPluginMeta(readerDescName: string, readerDescImpl: string //
  , subformFieldName: string, dataXReaderTargetName: string, skipSubformDescNullError?: boolean): PluginType {
  return {
    skipSubformDescNullError: skipSubformDescNullError,
    name: "dataxReader",
    require: true,
    extraParam: `targetDescriptorImpl_${readerDescImpl},targetDescriptorName_${readerDescName},subFormFieldName_${subformFieldName},${dataXReaderTargetName}`
  };
}

/**
 *
 * @param baseCpt
 * @param pluginMeta
 * @param meta
 * @param subForm
 */
export function processSubFormHeteroList(baseCpt: BasicFormComponent, pluginMeta: PluginType
  , meta: ISubDetailTransferMeta, subForm: Array<Item>): Promise<HeteroList[]> {
  console.log(new Error("processSubFormHeteroList"));
  let metaParam = PluginsComponent.getPluginMetaParams([pluginMeta]);
  return baseCpt.httpPost('/coredefine/corenodemanage.ajax'
    , 'action=plugin_action&emethod=subform_detailed_click&plugin=' + metaParam + "&id=" + meta.id)
    .then((r) => {
      if (!r.success) {
        return;
      }
      let h: HeteroList = PluginsComponent.wrapperHeteroList(r.bizresult, pluginMeta);
      let hlist: HeteroList[] = [h];
      return hlist;
    });
}
