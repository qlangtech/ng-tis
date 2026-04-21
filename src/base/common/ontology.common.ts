import {TuplesProperty} from "../../common/plugin/type.utils";
import {DataTypeMeta, ReaderColMeta, TuplesPropertyType} from "../../common/tis.plugin";

export interface ObjectType {
  name: string;
  ds: string;
  domain: string;
  colSize?: number
}

export function buildObjectTypePluginExtraParam(objType: ObjectType) {
  if (!objType) {
    throw new Error("param objType can not be null");
  }
  return `ontology_${objType.domain},ds_${objType.ds},object-type_${objType.name}`;
}

export interface ObjectTypeProperty {
  name: string;
  nullable: boolean;
  pk: string;
  type: string;
  // 用于显示图标icon用
  typeEnd: string;
}

export type ObjectTypeDetail = {
  name: string;
  properties: Array<ObjectTypeProperty>;
  linkTypes: Array<{ name: string; sourceType: string; targetType: string; description: string }>;
  datasources: Array<{ name: string; type: string }>;
}

/**
 * 一个本体域下的详细
 */
export type OntologyDetail = {
  name: string;
  objectTypes: Array<{ name: string }>;
  linkTypes: Array<{ name: string; sourceType: string; targetType: string; description: string }>;
  valueTypes: Array<{ name: string; description: string }>;
}

export class MultiSingleValue implements TuplesProperty {
  mcols: Array<ReaderColMeta> = [];
  typeMetas: Array<DataTypeMeta> = [];
  _mcols: Array<{ enumVal: string }>;

  constructor(vals: Array<{ enumVal: string }>) {
    this._mcols = vals;
  }

  viewType(): TuplesPropertyType {
    return TuplesPropertyType.MultiSelectSingleVal;
  }
}
