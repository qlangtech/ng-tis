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

import {TISService} from '../common/tis.service';
import {Component, OnInit} from '@angular/core';
import {BasicFormComponent} from '../common/basic.form.component';
import {NzModalRef, NzModalService} from "ng-zorro-antd/modal";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {DepartmentAddComponent} from "./department.add.component";
import {ItemPropValComponent} from "../common/plugin/item-prop-val.component";
import {PluginsComponent} from "../common/plugins.component";
import {TargetPlugin} from "../common/plugin/type.utils";
import {Descriptor, HeteroList, PluginSaveResponse, PluginType} from "../common/tis.plugin";
import {ExecModel} from "./datax.add.step7.confirm.component";
import {TISBaseProfile} from "../common/navigate.bar.component";
import {getUserProfile} from "./common/datax.common";


// 部门管理
@Component({
    template: `
        <tis-page-header title="会员"></tis-page-header>

        <div class="item-block">
            <tis-plugins [formControlSpan]="14" [pluginMeta]="userProfileCategory"
                         [showSaveButton]="true"
                         (ajaxOccur)="buildStep1ParamsSetComponentAjax($event)"
                         [shallInitializePluginItems]="false" [_heteroList]="hlist"
                         #pluginComponent></tis-plugins>
        </div>
    `
})
export class UserProfileComponent extends BasicFormComponent implements OnInit {

    hlist: HeteroList[] = [];

    userProfileCategory: Array<PluginType> = [];

    constructor(tisService: TISService, modalService: NzModalService, notification: NzNotificationService) {
        super(tisService, modalService, notification);
    }

    ngOnInit(): void {
        // let tp: TargetPlugin = {
        //     "hetero": "params-cfg-user-isolation",
        //     "descName": "UserProfile"
        // };
        // ItemPropValComponent.checkAndInstallPlugin(null, this, null, tp)
        //     .then((desc) => {
        //         if (!desc) {
        //             throw new Error("desc can not be null");
        //         }
        //         for (const [key, value] of desc) {
        //             this.hlist = PluginsComponent.pluginDesc(value, null);
        //             return;
        //         }
        //
        //         throw new Error("have not set hlist");
        //     });
        getUserProfile(this).then((result) => {
            this.userProfileCategory = [result.userProfileCategory];
            this.hlist = [result.hlist];
        })

        // let targetDisplayName = 'UserProfile';
        // let pluginCategory: PluginType = {
        //     name: 'params-cfg-user-isolation',
        //     require: true,
        //     extraParam: `update_true,targetItemDesc_${targetDisplayName}`
        // }
        //
        // this.userProfileCategory = [pluginCategory];
        //
        // this.httpPost('/coredefine/corenodemanage.ajax'
        //     , 'action=plugin_action&emethod=get_describle&plugin='
        //     + PluginsComponent.getPluginMetaParam(pluginCategory) + `&name=${targetDisplayName}&hetero=` + pluginCategory.name)
        //     .then((r) => {
        //         if (r.success) {
        //             let hlist: HeteroList = PluginsComponent.wrapperHeteroList(r.bizresult, pluginCategory);
        //             if (hlist.items.length < 1) {
        //                 Descriptor.addNewItem(hlist, hlist.descriptorList[0], false, (key, p) => {
        //                     if (key === 'name' && !p.primary) {
        //                         this.tisService.tisMeta.then((profile) => {
        //                             p.primary = profile.usr.name;
        //                         })
        //                     }
        //                     return p;
        //                 });
        //             }
        //             // console.log(hlist);
        //             this.hlist = [hlist];
        //         }
        //     });
    }


    buildStep1ParamsSetComponentAjax($event: PluginSaveResponse) {

    }
}
