export const KEY_DATAFLOW_PARSER = "数据流分析（EMR）";

/**
 * 被选中的列
 */
export interface ISelectedCol {
  label: string;
  value: string;
  checked: boolean;
  pk: boolean;
}

export interface ISelectedTabMeta {

  tableName: string,
  selectableCols: Array<ISelectedCol> // r.bizresult
}

export class DataxProfile {
  projectName: string;
  recept: string;
  dptId: string;
}

// "transformerInfo":[
//   {
//     "ruleCount":3,
//     "tableName":"base"
//   }
// ]
export interface TransformerInfo {
  ruleCount: number;
  tableName: string;
}

export interface DataXCfgFile {
  dbFactoryId?: string;
  fileName: string;//:"totalpayinfo_0.json"
}

export class AddStep2ComponentCfg {
  public readerCptNeed = true;
  public headerCaption = 'Reader & Writer类型';
  public writerTypeLable = "Writer类型";
  public writerPluginTag: string = '';

  public stepIndex = 0;

  get stepToolbarNeed(): boolean {
    return true; //this.readerCptNeed;
  }

  installableExtension: Array<string> = ['com.qlangtech.tis.datax.impl.DataxReader', 'com.qlangtech.tis.datax.impl.DataxWriter'];
}

export interface DataXCreateProcessMeta {
  readerRDBMS: boolean;
  readerRDBMSChangeableInLifetime?: boolean;
  // DataX Reader 是否有明确的表名
  explicitTable: boolean;

  // writer 是否符合关系型数据库要求
  writerRDBMS: boolean;
  // reader 中是否可以选择多个表，例如像elastic这样的writer中对于column的设置比较复杂，需要在writer plugin页面中完成，所以就不能支持在reader中选择多个表了
  writerSupportMultiTab: boolean;
}
