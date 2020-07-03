/**
 * Created by baisui on 2017/5/19 0019.
 */

// 小白模式pojo
export class StupidModal {
  fieldtypes: Array<SchemaFieldType> = [];
  schemaXmlContent: string;
  fields: Array<SchemaField> = [];
  uniqueKey: string;
  shareKey: string;
  tplAppId: number;

  public static deseriablize(r: StupidModal): StupidModal {
    let stupidModal = Object.assign(new StupidModal(), r);
    stupidModal.schemaXmlContent = r.schemaXmlContent;
    stupidModal.fieldtypes = [];
    stupidModal.fields = [];
    r.fields.forEach((ff: any) => {
      stupidModal.fields.push(Object.assign(new SchemaField(), ff));
    });
    r.fieldtypes.forEach((type: any) => {
      let nt: SchemaFieldType = Object.assign(new SchemaFieldType(), type);
      nt.tokensType = [];
      if (type.tokensType) {
        type.tokensType.forEach((token: any) => {
          nt.tokensType.push(Object.assign(new SchemaFieldTypeTokensType(), token));
        });
      }
      stupidModal.fieldtypes.push(nt);
    });
    return stupidModal;
  }

}

export class SchemaFieldTypeTokensType {
  value: string;
  key: string;
}

export class SchemaFieldType {
  split = false;
  name: string;
  rangeAware: false;
  tokensType: Array<SchemaFieldTypeTokensType> = [];
}

export class SchemaField {
  sharedKey = false;
  // rangequery = false;
  // range = false;
  indexed = false;
  docval = true;
  uniqueKey = false;
  index: number;
  fieldtype: string;
  multiValue = false;
  required = false;
  inputDisabled = true;
  split = false;
  stored = true;
  name: string;
  id: number;
  tokenizerType: string;

  _editorOpen = false;
  get editorOpen(): boolean {
    return this._editorOpen;
  }

  set editorOpen(val: boolean) {
    this._editorOpen = val;
  }
}

// 从schema编辑页面跳转到确认页面使用的包装对象
export class ConfirmDTO {
// {appform: {tisTpl: any, workflow: any}, expertModel: boolean, expert: {xml: string}, stupid: {model:StupidModal}}
  // 使用的模板索引的appid
  tplAppId: number;
  appform: AppDesc;
  expertModel: boolean;
  expert: { xml: string };
  stupid: { model: StupidModal };

  // 当上一次索引已经创建，经过删除之后需要重新创建
  recreate = false;

  // 日常环境中使用的候选服务器
  coreNode: CoreNodeCandidate = new CoreNodeCandidate();
}

export class CoreNodeCandidate {
  shardCount = 1;
  replicaCount = 1;
  // "hostName":"10.1.5.19",
  // "luceneSpecVersion":5.3,
  // "nodeName":"10.1.5.19:8080_solr",
  // "solrCoreCount":11
  hosts: Array<{ hostName: string }> = [];
}

// 可选项
export class Option {
  name: string;
  value: string;
}

// 第一步提交的基本信息包装类
export class AppDesc {
  // nodeName: form.nodeName.value, tisTpl: form.tisTpl.value, workflow: form.workflow.value
  // , dptId: form.dptId.value, recept: form.recept.value

  name: string;
  tisTpl: string;
  workflow: string;
  dptId: string;
  recept: string;

  // 部门列表
  dpts: Option[];

  public get checkedDptName(): string {

    if (!this.dpts) {
      throw new Error('dpts of AppDesc can not be null');
    }

    let o: Option = this.dpts.find((v) => {
      return v.value === this.dptId;
    });

    if (o) {
      return o.name;
    } else {
      return '';
    }

  }

}
