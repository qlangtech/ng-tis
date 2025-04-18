import {Descriptor, HeteroList, Item, PluginType} from "../common/tis.plugin";
import {BasicFormComponent} from "../common/basic.form.component";
import {NzTreeNode} from "ng-zorro-antd/tree";
import {DataxAddStep4Component, ISubDetailTransferMeta} from "../base/datax.add.step4.component";
import {DATAX_PREFIX_DB} from "../base/datax.add.base";

import {CreatorRouter} from "../common/plugin/type.utils";

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
            let m = DataxAddStep4Component.dataXReaderSubFormPluginMeta(desc.displayName, desc.impl, "selectedTabs", (DATAX_PREFIX_DB + dbName));
            let selectedTablePluginMeta = [m];
            let meta = <ISubDetailTransferMeta>{id: event.name};

            // DataxAddStep4Component.initializeSubFieldForms(this, m, desc.impl
            //   , true, (subFieldForms: Map<string /*tableName*/, Array<Item>>, subFormHetero: HeteroList, readerDesc: Descriptor) => {

            return DataxAddStep4Component.processSubFormHeteroList(basicCpt, m, meta, null // , subFormHetero.descriptorList[0]
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
  , creatorRouter?: CreatorRouter)
  : Promise<{ "dbs": Array<DataBaseMeta>, "dbsWhichSupportDataXReader": Array<DataBaseMeta>, "desc": Array<Descriptor> }> {

  let action = 'emethod=get_datasource_info&action=offline_datasource_action&filterSupportReader=' + filterSupportReader;
  if (creatorRouter) {

    for (let targetPlugin of creatorRouter.plugin) {

    }
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
