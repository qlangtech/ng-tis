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

import {BasicFormComponent, CurrentCollection} from "../common/basic.form.component";
import {Component, OnInit} from "@angular/core";
import {TISService} from "../common/tis.service";

import {NzModalService} from "ng-zorro-antd/modal";
import {ActivatedRoute, Router} from "@angular/router";
import {DataxDTO} from "./datax.add.component";
import {
    createExtraDataXParam,
    HeteroList,
    Item,
    MultiStepsDescriptor,
    PluginMeta,
    PluginType
} from "../common/tis.plugin";
import {PluginsComponent} from "../common/plugins.component";
import {ISubDetailTransferMeta, processSubFormHeteroList} from "../common/ds.utils";
import {NzNotificationService} from "ng-zorro-antd/notification";


const KEY_END_TYPE = 'desc'
const KEY_TRANSFORMER_END_TYPE = 'transformer_desc'
const DATAX_READER = 'dataxReader'
const DATAX_WRITER = 'dataxWriter'

const INCR_SOURCE = 'mq'
const INCR_SINK = 'sinkFactory'

const DATASOURCE_FACTORY = 'datasource';
const PARAMS_CFG = 'params-cfg';


@Component({
    template: `

        <div id="dataxReader" *ngIf="dataXReaderMeta" class="plugin-block">
            <tis-plugins [showExtensionPoint]="{'open':true}" [showSaveButton]="false"
                         [forceInitializePluginItems]="false"
                         [shallInitializePluginItems]="true"
                         [itemChangeable]="false"
                         [plugins]="dataXReaderMeta"></tis-plugins>
        </div>

        <div id="dataxWriter" *ngIf="dataXWriterMeta" class="plugin-block">
            <tis-plugins [showExtensionPoint]="{'open':true}" [showSaveButton]="false"
                         [forceInitializePluginItems]="false"
                         [shallInitializePluginItems]="true"
                         [itemChangeable]="false"
                         [plugins]="dataXWriterMeta"></tis-plugins>
        </div>

        <div [id]="'mq'" *ngIf="incrSourceMeta" class="plugin-block">
            <tis-plugins [showExtensionPoint]="{'open':true}" [showSaveButton]="false"
                         [forceInitializePluginItems]="false"
                         [shallInitializePluginItems]="true"
                         [itemChangeable]="false"
                         [plugins]="incrSourceMeta"></tis-plugins>
        </div>

        <div id="sinkFactory" *ngIf="incrSinkMeta" class="plugin-block">
            <tis-plugins [showExtensionPoint]="{'open':true}" [showSaveButton]="false"
                         [forceInitializePluginItems]="false"
                         [shallInitializePluginItems]="true"
                         [itemChangeable]="false"
                         [plugins]="incrSinkMeta"></tis-plugins>
        </div>

        <div [id]="dsFactory" *ngIf="_dataSourceMeta" class="plugin-block">
            <tis-plugins [showExtensionPoint]="{'open':true}" [showSaveButton]="false"
                         [forceInitializePluginItems]="false"
                         [shallInitializePluginItems]="true"
                         [itemChangeable]="false"
                         [plugins]="_dataSourceMeta"></tis-plugins>
        </div>

        <div [id]="param" *ngIf="_paramCfgMeta" class="plugin-block">
            <tis-plugins [showExtensionPoint]="{'open':true}" [showSaveButton]="false"
                         [forceInitializePluginItems]="false"
                         [shallInitializePluginItems]="true"
                         [itemChangeable]="false"
                         [plugins]="_paramCfgMeta"></tis-plugins>
        </div>


        <div id="assist" *ngIf="assistHeteroList" class="plugin-block">

            <tis-plugins [showExtensionPoint]="{'open':false}" [showSaveButton]="false"
                         [forceInitializePluginItems]="false"
                         [shallInitializePluginItems]="false"
                         [useCollapsePanel]="true"
                         [itemChangeable]="false"
                         [pluginMeta]="assistMetas"
                         [_heteroList]="assistHeteroList"></tis-plugins>


        </div>

    `
    ,
    styles: [`
        .plugin-block {
            width: 70%;
            margin-top: 20px
        }
    `]
})
export class EndCptListComponent extends BasicFormComponent implements OnInit {
    _dataXReaderMeta: PluginType[];
    _dataXWriterMeta: PluginType[];
    _incrSourceMeta: PluginType[];
    _incrSinkMeta: PluginType[];

    _dataSourceMeta: PluginType[];

    _paramCfgMeta: PluginType[];

    dsFactory = DATASOURCE_FACTORY;
    param = PARAMS_CFG;

    /**
     * assist type 对应的component 会使用endtype将与之对应的所有所有插件类型都取得
     */
    assistHeteroList: HeteroList[];
    assistMetas: PluginType[] = [];

    constructor(tisService: TISService, modalService: NzModalService, private router: Router, private route: ActivatedRoute) {
        super(tisService, modalService);
        tisService.test = true;
    }

    public get dataXReaderMeta(): PluginType[] {
        return this._dataXReaderMeta;
    }

    public get dataXWriterMeta(): PluginType[] {
        return this._dataXWriterMeta;
    }

    public get incrSourceMeta(): PluginType[] {
        return this._incrSourceMeta;

        // [{
        //   name: 'mq',
        //   require: true,
        //   extraParam: `targetItemDesc_Flink-CDC-MySQL,update_false,justGetItemRelevant_true,dataxName_xxx,${DataxDTO.KEY_PROCESS_MODEL}_createDatax`,
        //   descFilter: {localDescFilter: (_) => true}
        // }]
    }

    public get incrSinkMeta(): PluginType[] {
        return this._incrSinkMeta;
        // [{
        //   name: 'sinkFactory',
        //   require: true,
        //   extraParam: `targetItemDesc_Chunjun-Sink-MySQL,update_false,justGetItemRelevant_true,dataxName_xxx,${DataxDTO.KEY_PROCESS_MODEL}_createDatax`,
        //   descFilter: {localDescFilter: (_) => true}
        // }]
    }

    ngOnInit(): void {

        let queryParams = this.route.snapshot.queryParamMap;
        let pipeName = "mysql_mysql";
        this.tisService.currentApp = new CurrentCollection(0, pipeName);

        let transformerEndType: string[] = queryParams.getAll(KEY_TRANSFORMER_END_TYPE);

        if (transformerEndType && transformerEndType.length > 0) {

            let pluginMeta: PluginType = {
                name: 'transformerUDF',
                require: true,
                "extraParam": (createExtraDataXParam(pipeName, true)),
                descFilter: {
                    localDescFilter: (d) => {
                        return transformerEndType[0] === d.impl;
                    }
                }
            }
            let meta: ISubDetailTransferMeta = {
                id: 'orderdetail',
                // behaviorMeta: ISubDetailClickBehaviorMeta;
                fieldName: null,
                idList: [],
                // 是否已经设置子表单
                setted: false
            };
            //console.log([transformerEndType,transformerEndType.length]);
            processSubFormHeteroList(this, pluginMeta, meta, [])
                .then((hlist: HeteroList[]) => {
                    // console.log(hlist);
                    for (let hetero of hlist) {
                        PluginsComponent.addDefaultItem(pluginMeta as PluginMeta, hetero);
                    }

                    this.assistHeteroList = hlist;
                    this.assistMetas = [pluginMeta];
                });
            return;
        }

        let assistEndType: string[] = queryParams.getAll(KEY_END_TYPE);
        if (assistEndType && assistEndType.length > 0) {

            let pluginMeta: PluginType[] = new Array();
            for (let i of assistEndType) {
                pluginMeta.push({
                    name: 'dataxReader',
                    require: true,
                    "extraParam": createExtraDataXParam(pipeName, true),
                    descFilter: {
                        localDescFilter: (_) => true
                    }
                });
            }
            // let pluginMeta = PluginsComponent.getPluginMetaParams(pm);
            let url = '/coredefine/corenodemanage.ajax?action=plugin_action&emethod=get_descs&'
                + assistEndType.map((desc) => KEY_END_TYPE + "=" + desc).join("&")
            // console.log([pm,url]);
            PluginsComponent.process_response_of_get_plugin_config_info(this, url, null, pluginMeta
                , (success: boolean, _heteroList: HeteroList[], showExtensionPoint: boolean) => {
                    this.assistHeteroList = _heteroList;
                    this.assistMetas = pluginMeta;
                });

            return;
        }

        let descName = queryParams.get(DATAX_READER);
        if (descName) {
            this._dataXReaderMeta = [{
                name: DATAX_READER,
                require: true,
                extraParam: `targetItemDesc_${descName},update_false,justGetItemRelevant_true,${createExtraDataXParam(pipeName, true)},${DataxDTO.KEY_PROCESS_MODEL}_createDatax`,
                descFilter: {localDescFilter: (_) => true}
            }];
        }

        descName = queryParams.get(DATAX_WRITER);
        if (descName) {
            this._dataXWriterMeta = [{
                name: DATAX_WRITER,
                require: true,
                extraParam: `targetItemDesc_${descName},update_false,justGetItemRelevant_true,${createExtraDataXParam(pipeName, true)},${DataxDTO.KEY_PROCESS_MODEL}_createDatax`,
                descFilter: {localDescFilter: (_) => true}
            }];
        }


        descName = queryParams.get(INCR_SOURCE);
        if (descName) {
            this._incrSourceMeta = [{
                name: INCR_SOURCE,
                require: true,
                extraParam: `targetItemDesc_${descName},update_false,justGetItemRelevant_true,${createExtraDataXParam(pipeName, true)},${DataxDTO.KEY_PROCESS_MODEL}_createDatax`,
                descFilter: {localDescFilter: (_) => true}
            }];
        }

        descName = queryParams.get(INCR_SINK);
        if (descName) {
            this._incrSinkMeta = [{
                name: INCR_SINK,
                require: true,
                extraParam: `targetItemDesc_${descName},update_false,justGetItemRelevant_true,${createExtraDataXParam(pipeName, true)},${DataxDTO.KEY_PROCESS_MODEL}_createDatax`,
                descFilter: {localDescFilter: (_) => true}
            }];
        }

        // descName = queryParams.get(DATASOURCE_FACTORY);
        // console.log(  );
        let dsDescs = queryParams.getAll(DATASOURCE_FACTORY);
        if (dsDescs) {
            this._dataSourceMeta = new Array();
            for (let desc of dsDescs) {
                this._dataSourceMeta.push({
                    name: DATASOURCE_FACTORY,
                    require: true,
                    extraParam: `targetItemDesc_${desc},type_detailed,update_false,justGetItemRelevant_true,${createExtraDataXParam(pipeName, true)},${DataxDTO.KEY_PROCESS_MODEL}_createDatax`,
                    descFilter: {localDescFilter: (_) => true}
                });
            }

            // this._dataSourceMeta = [];
        }


        descName = queryParams.get(PARAMS_CFG);
        if (descName) {
            this._paramCfgMeta = [{
                name: PARAMS_CFG,
                require: true,
                extraParam: `targetItemDesc_${descName},update_false,justGetItemRelevant_true,${createExtraDataXParam(pipeName, true)},${DataxDTO.KEY_PROCESS_MODEL}_createDatax`,
                descFilter: {localDescFilter: (_) => true}
            }];
        }


    }


}


//multi-step-test
const pipeName = "mysql_doris";

@Component({
    template: `

        <h2>Multi Steps Test</h2>
      <ul>
        <li>MulitStepsTestComponent</li>
        <li>PluginsMultiStepsComponent</li>
      </ul>


        <div id="assist" class="plugin-block">


            <tis-plugins-multi-steps [hlist]="hlist" [stepDesc]="stepDesc"/>

        </div>

    `
    ,
    styles: [`
        .plugin-block {
            width: 60%;
            margin-top: 20px;
            padding: 20px;
            border: 1px solid #cccccc;
        }
    `]
})
export class MulitStepsTestComponent extends BasicFormComponent implements OnInit {
    hlist: HeteroList[] = [];
    stepDesc: MultiStepsDescriptor;

    constructor(tisService: TISService, modalService: NzModalService, notification: NzNotificationService) {
        super(tisService, modalService, notification);
    }

    ngOnInit(): void {
        // action=plugin_action&emethod=subform_detailed_click&plugin=transformerUDF:require,dataxName_mysql_doris&id=orderdetail
        let assistEndType: string[] = ["com.qlangtech.tis.plugin.datax.transformer.impl.JoinerUDF"];
        let pluginMeta: PluginType[] = new Array();
        for (let i of assistEndType) {
            pluginMeta.push({
                name: 'transformerUDF',
                require: true,
                "extraParam": createExtraDataXParam(pipeName, false),
                descFilter: {
                    localDescFilter: (_) => true
                }
            });
        }



        // baseCpt: BasicFormComponent, pluginMeta: PluginType
        //     , meta: ISubDetailTransferMeta, subForm: Array<Item>
         processSubFormHeteroList(this,pluginMeta[0],{ id: "orderdetail" } as ISubDetailTransferMeta,[])
             .then((_heteroList)=>{
 console.log(_heteroList);

                         this.hlist = _heteroList;
                         for (let h of _heteroList) {
                             for (let [impl, desc] of h.descriptors) {
                                 if (desc instanceof MultiStepsDescriptor) {


                                     this.stepDesc = desc;
                                     let stepPluginCategory: PluginType = h.pluginCategory;

                                     this.hlist = PluginsComponent.pluginDesc(desc.firstStep, stepPluginCategory);
                                     console.log([desc,h,stepPluginCategory]);
                                     return;
                                 }

                             }
                         }
         });





        // // let pluginMeta = PluginsComponent.getPluginMetaParams(pm);
        // let url = '/coredefine/corenodemanage.ajax?action=plugin_action&emethod=get_descs&'
        //     + assistEndType.map((desc) => KEY_END_TYPE + "=" + desc).join("&")+"&id=orderdetail"
        //
        //
        //
        //
        // PluginsComponent.process_response_of_get_plugin_config_info(this, url, null, pluginMeta
        //     , (success: boolean, _heteroList: HeteroList[], showExtensionPoint: boolean) => {
        //         console.log(_heteroList);
        //         this.hlist = _heteroList;
        //         for (let h of _heteroList) {
        //             for (let [impl, desc] of h.descriptors) {
        //                 if (desc instanceof MultiStepsDescriptor) {
        //
        //
        //                     this.stepDesc = desc;
        //                     let stepPluginCategory: PluginType = h.pluginCategory;
        //
        //                     this.hlist = PluginsComponent.pluginDesc(desc.firstStep, stepPluginCategory);
        //                     console.log([desc,h,stepPluginCategory]);
        //                 }
        //                 return;
        //             }
        //         }
        //     });
    }

}
