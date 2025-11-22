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

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    EventEmitter,
    Input,
    Output, QueryList
} from "@angular/core";
import {Descriptor, HeteroList, Item, PluginManipulateMeta, PluginType, SavePluginEvent} from "./tis.plugin";
import {PluginsComponent} from "./plugins.component";
import {BasicFormComponent} from "./basic.form.component";
import {NzModalService} from "ng-zorro-antd/modal";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {TISService} from "./tis.service";
import {TisPluginAddBtnExtractLiItem} from "./plugin.add.btn.component";

/**
 * 插件操作按钮组件
 * 用于展示和处理插件的所有操作按钮,包括校验、添加和已存储的操作项
 */
@Component({
    selector: 'tis-manipulate-plugin',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <nz-space nzSize="middle">
            <!-- 校验按钮 -->
            <ng-container *ngIf="!disableVerify && item.dspt.veriflable">
                <button *nzSpaceItem nz-button nzSize="small"
                        (click)="onConfigCheck.emit($event)">
                    <i nz-icon nzType="check" nzTheme="outline"></i>校验
                </button>&nbsp;
            </ng-container>

            <!-- 操作区域 -->
            <ng-container *ngIf="!disableManipulate && manipulatePluginExtendPoint">
                <tis-plugin-add-btn *nzSpaceItem [btnSize]="'small'"
                                    [appname]="appname"
                                    [extendPoint]="manipulatePluginExtendPoint"
                                    [descriptors]="[]" [initDescriptors]="true"
                                    (addPlugin)="onPluginManipulate.emit($event)"
                                    [lazyInitDescriptors]="true">


                    <tis-plugin-add-btn-extract-item *ngFor="let li of extractLiItems" (click)="li.click.emit($event)"
                                                     [nz-icon]="li.nzIcon" [li-name]="li.liName">
                    </tis-plugin-add-btn-extract-item>
                    <span nz-icon nzType="setting" nzTheme="outline"></span>
                </tis-plugin-add-btn>
                &nbsp;
                <!-- 已存储的操作按钮 -->
                <ng-container *ngFor="let m of storedPlugins  let i = index">
                    <button style="background-color: #fae8ae" *nzSpaceItem nz-tooltip
                            [nzTooltipTitle]="m.identityName" nzTooltipPlacement="top" nz-button
                            nzSize="small"
                            nzShape="round" (click)="openManipulateStore(m)">
                        <ng-container [ngSwitch]="m.descMeta.supportIcon">
                            <span *ngSwitchCase="true" nz-icon [nzType]="m.descMeta.endtype"></span>
                            <span *ngSwitchDefault nz-icon nzType="tags"></span>
                        </ng-container>
                        {{m.identityName | maxLength:15}}
                    </button>
                </ng-container>
            </ng-container>
        </nz-space>
    `
})
export class ManipulatePluginComponent extends BasicFormComponent {

    /**
     * Item 对象,包含所有业务数据
     */
    @Input()
    item: Item;

    @Input()
    appname:string;
    /**
     * HeteroList 对象,用于 configCheck
     */
    @Input()
    heteroList: HeteroList;

    /**
     * 插件元数据
     */
    @Input()
    pluginMeta: PluginType;

    /**
     * 是否禁用校验按钮
     */
    @Input()
    disableVerify: boolean;

    /**
     * 是否禁用操作按钮
     */
    @Input()
    disableManipulate: boolean;

    @Input()
    storedPlugins: Array<PluginManipulateMeta>

    @Input()
    hostPluginImpl: string;

    @Input()
    manipulatePluginExtendPoint:string

    /**
     * 校验按钮点击事件
     */
    @Output()
    onConfigCheck = new EventEmitter<MouseEvent>();

    /**
     * 插件操作事件
     */
    @Output()
    onPluginManipulate = new EventEmitter<Descriptor>();


    /**
     * 额外的下拉列表item
     */
    @ContentChildren(TisPluginAddBtnExtractLiItem) extractLiItems: QueryList<TisPluginAddBtnExtractLiItem>;

    constructor(
        tisService: TISService,
        modalService: NzModalService,
        notification: NzNotificationService,
        private cdr: ChangeDetectorRef
    ) {
        super(tisService, modalService, notification);
    }

    /**
     * 打开插件操作存储对话框
     * @param manipuldateMeta 插件操作元数据
     */
    openManipulateStore(manipuldateMeta: PluginManipulateMeta) {
        // if (!this.item || !this.item.dspt) {
        //     throw new Error("item or item.dspt can not be null");
        // }
        if (!manipuldateMeta) {
            throw new Error("manipuldateMeta can not be null");
        }

        let opt = SavePluginEvent.createPostPayload(this.pluginMeta, true);

        this.httpPost('/coredefine/corenodemanage.ajax',
            "event_submit_do_get_manipuldate_plugin=y&action=plugin_action&impl=" + this.hostPluginImpl  + "&identityName=" + manipuldateMeta.identityName)
            .then((result) => {

                let descMap = Descriptor.wrapDescriptors(result.bizresult.desc);

                for (let [_, desc] of descMap) {
                    let i: any = Object.assign(new (class {
                        wrapItemVals() {
                        }
                    })(), result.bizresult.item);
                    i.wrapItemVals();

                    PluginsComponent.openPluginDialog({
                            saveBtnLabel: '更新',
                            enableDeleteProcess: true,
                            shallLoadSavedItems: false,
                            item: i,
                            savePluginEventCreator: () => {
                                return opt;
                            }
                        },
                        this, desc,
                        {name: 'noStore', require: true},
                        `${desc.displayName}`,
                        (event, biz) => {
                            if (event.deleteProcess) {
                                let stored = this.storedPlugins;
                                let idx = stored.findIndex((s) => s.identityName === manipuldateMeta.identityName);
                                if (idx > -1) {
                                    stored.splice(idx, 1);
                                    this.storedPlugins = [...stored];
                                }
                                this.cdr.detectChanges();
                            }
                        });
                    break;
                }
            });
    }
}
