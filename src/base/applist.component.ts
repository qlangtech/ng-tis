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
import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {
    BasicFormComponent,
    CurrentCollection,
    KEY_INCR_CONTROL_WEBSOCKET_PATH,
    WSMessage
} from '../common/basic.form.component';

import {Pager} from '../common/pagination.component';
import {NzModalService} from "ng-zorro-antd/modal";
import {Application} from "../common/application";
import {LatestSelectedIndex} from "../common/LatestSelectedIndex";
import {LocalStorageService} from "../common/local-storage.service";
import {DataxAddStep7Component} from "./datax.add.step7.confirm.component";
import {StepType} from "../common/steps.component";
import {
    createExtraDataXParam,
    Descriptor,
    Item,
    PluginManipulateMeta,
    PluginMeta,
    SavePluginEvent
} from "../common/tis.plugin";
import {DataxDTO} from "./datax.add.component";
import {Subject, Subscription} from "rxjs";
import {LogType} from "../runtime/misc/RCDeployment";
import {PluginsComponent} from "../common/plugins.component";


// 全局配置文件
@Component({
    template: `

        <tis-page-header title="管道">
            <tis-header-tool>
                <button data-testid="start-add" nz-button nzType="primary" nz-dropdown [nzDropdownMenu]="menu"><i
                        class="fa fa-plus"
                        aria-hidden="true"></i>添加<i
                        nz-icon nzType="down"></i></button>
                <nz-dropdown-menu #menu="nzDropdownMenu">
                    <ul nz-menu>
                        <!--   <li nz-menu-item>
                               <a routerLink="/base/appadd">Solr实例</a>
                           </li> -->
                        <li nz-menu-item>
                            <a data-testid="add-new-pipeline" (click)="gotoDataXAdd()">数据管道</a>
                        </li>
                    </ul>
                </nz-dropdown-menu>
            </tis-header-tool>
        </tis-page-header>
        <tis-page [rows]="pageList" [pager]="pager" [spinning]="formDisabled" (go-page)="gotoPage($event)">
            <page-row-assist>

                <ng-template #pipeProfileTemplate let-u='r'>
                    <tis-plugins [errorsPageShow]="false"
                                 [formControlSpan]="20" [shallInitializePluginItems]="false" [showSaveButton]="true"
                                 [disabled]="false"
                                 [plugins]="[{name: 'appSource', require: true, extraParam: parsetPluginExtraParam(u)}]"></tis-plugins>
                </ng-template>

            </page-row-assist>

            <tis-col title="实例" width="16" (search)="filterByAppName($event)">
                <ng-template let-app='r'>

                    <button nz-button nzType="link" style="cursor: pointer" nzSize="small"
                            (click)="toggleOpenAssist(app)">
                        <i nz-icon
                           [nzType]="app.openAssist?'up':'down'"></i>
                    </button>

                    <button nz-button nzType="link" nzSize="small"
                            (click)="gotoApp(app)">{{app.projectName}}</button>

                    <div *ngIf="app.incrRunning" style="margin-left: 25px">

                        <nz-tag nzColor="success"><span nz-icon nzType="sync" nzSpin></span>
                            <span>累积消费：{{app.incrConsumeNum}}</span><a
                                    [routerLink]="['/x',app.projectName,'incr_build']">，进入</a></nz-tag>
                    </div>


                </ng-template>
            </tis-col>

            <tis-col title="类型" width="10">
                <ng-template let-app="r">
                    <ng-container [ngSwitch]="app.appType">
                        <nz-tag *ngSwitchCase="1" [nzColor]="'processing'">Solr</nz-tag>
                        <nz-tag *ngSwitchCase="2" [nzColor]="'processing'">Pipeline</nz-tag>
                    </ng-container>
                    <!--
                    <a [routerLink]="['/offline/wf_update',app.dataflowName]">{{app.dataflowName}}</a>
                   -->
                </ng-template>
            </tis-col>
            <tis-col title="接口人" width="14" field="recept"></tis-col>
            <tis-col title="归属部门" field="dptName" width="20">
                <ng-template let-app='r'>
   <span style="color:#999999;" [ngSwitch]="app.dptName !== null">
   <i *ngSwitchCase="true">{{app.dptName}}</i>
   <i *ngSwitchDefault>未设置</i></span>
                </ng-template>
            </tis-col>
            <tis-col title="创建时间" width="10">
                <ng-template let-app='r'> {{app.createTime | date : "yyyy/MM/dd HH:mm:ss"}}</ng-template>
            </tis-col>

            <tis-col title="管理">
                <ng-template let-app='r'>

                    <tis-manipulate-plugin [disableVerify]="true"
                                           [storedPlugins]="app.manipulateMetas"
                                           [pluginMeta]="pluginMeta"
                                           [appname]="app.projectName"
                                           [hostPluginImpl]="'com.qlangtech.tis.plugin.datax.DefaultDataxProcessor'"
                                           [manipulatePluginExtendPoint]="processorExend"
                                           (onPluginManipulate)="pipelineManipuate(app,$event)">
                        <tis-plugin-add-btn-extract-item (click)="startEditReader(app)" nz-icon="edit" li-name="Reader">
                        </tis-plugin-add-btn-extract-item>
                        <tis-plugin-add-btn-extract-item (click)="startEditWriter(app)" nz-icon="edit" li-name="Writer">
                        </tis-plugin-add-btn-extract-item>
                        <tis-plugin-add-btn-extract-item (click)="startDeletePipeline(app)" nz-icon="delete"
                                                         li-name="删除">
                        </tis-plugin-add-btn-extract-item>
                    </tis-manipulate-plugin>

                </ng-template>
            </tis-col>
        </tis-page>
    `
})
export class ApplistComponent extends BasicFormComponent implements OnInit, OnDestroy {
    processorExend = 'com.qlangtech.tis.datax.DefaultDataXProcessorManipulate';
    // allrowCount: number;
    pager: Pager = new Pager(1, 1);
    pageList: Array<Application> = [];

    // manipulateMetas: Descriptor[] = [];

    private runningPipes: { [Key: string]: number } = null;
    private assembleWS: Subject<WSMessage>;
    private assembleWSSubscription: Subscription;


    pluginMeta: PluginMeta = {
        name: 'appSource',
        require: true,
        //    extraParam: createExtraDataXParam(app.projectName)
    };

    constructor(tisService: TISService, private router: Router, private route: ActivatedRoute, modalService: NzModalService, private _localStorageService: LocalStorageService
    ) {
        super(tisService, modalService);
    }

    parsetPluginExtraParam(app: Application): string {
        let dto = new DataxDTO();
        dto.dataxPipeName = app.projectName;
        dto.processModel = StepType.CreateDatax;
        return DataxAddStep7Component.createPluginExtraParam(false, dto);
    }

    startEditReader(app: Application) {
        let saveEvent = new SavePluginEvent();
        saveEvent.overwriteHttpHeaderOfAppName(app.projectName);
        DataxAddStep7Component.startDataXEdit(this, StepType.UpdateDataxReader, this.router, this.route, `/x/${app.projectName}/update`, "reader", saveEvent);
    }

    startEditWriter(app: Application) {
        let saveEvent = new SavePluginEvent();
        saveEvent.overwriteHttpHeaderOfAppName(app.projectName);
        DataxAddStep7Component.startDataXEdit(this, StepType.UpdateDataxWriter, this.router, this.route, `/x/${app.projectName}/update`, "writer", saveEvent);
    }

    startDeletePipeline(app: Application) {
        // let saveEvent = new SavePluginEvent();
        // saveEvent.overwriteHttpHeaderOfAppName(app.projectName);
        // DataxAddStep7Component.startDataXEdit(this, StepType.UpdateDataxWriter, this.router, this.route, `/x/${app.projectName}/manage#control`, "writer", saveEvent);


        this.router.navigate(["/", "x", app.projectName, "manage"], {
            relativeTo: this.route,
            fragment: "control"
        });
    }

    ngOnDestroy(): void {
        this.assembleWS.unsubscribe();
        this.assembleWSSubscription.unsubscribe();
    }

    ngOnInit(): void {

        this.assembleWS = this.getWSMsgSubject(
            "all_running_pipeline_consume_tags_status", KEY_INCR_CONTROL_WEBSOCKET_PATH);


        this.assembleWSSubscription = this.subcribe_all_running_pipeline_consume_tags_status();

        this.route.queryParams.subscribe((param) => {

            let nameQuery = '';
            for (let key in param) {
                nameQuery += ('&' + key + '=' + param[key]);
            }
            this.httpPost('/runtime/applist.ajax'
                , 'emethod=get_apps&action=app_view_action' + nameQuery)
                .then((r) => {
                    if (r.success) {
                        this.pager = Pager.create(r);
                        let payload = this.pager.payload;
                        this.pageList = r.bizresult.rows;
                        this.setAppListRunningIncrConsumeStat();
                    }
                });
        });

        // PluginsComponent.getAllDesc(this, this.processorExend, null)
        //   .then((descs) => {
        //
        //     this.processorDescriptors = Array.from(descs.values());
        //     // resolve(this.descriptors);
        //     // this.cd.detectChanges();
        //
        //   }).finally(() => {
        //   // this.formDisabled = false;
        // });
    }

    private subcribe_all_running_pipeline_consume_tags_status() {
        return this.assembleWS.subscribe((msg) => {

            if (msg.logtype == LogType.ALL_RUNNING_PIPELINE_CONSUME_TAGS_STATUS) {
                //console.log(msg.data.msg);

                this.runningPipes = msg.data.msg;
                this.setAppListRunningIncrConsumeStat();
            }
        });
    }

    private setAppListRunningIncrConsumeStat() {
        this.pageList.forEach((app) => {
            // console.log(app.manipulateMetas);
            if (Array.isArray(app.manipulateMetas)) {
                app.manipulateMetas = PluginManipulateMeta.wrapManipulateStore(app.manipulateMetas);
            } else {
                app.manipulateMetas = [];
            }
        });

        if (this.runningPipes) {
            this.pageList.forEach((app) => {


                let incrConsumeNum;
                //console.log([app.projectName, runningPipes[app.projectName]]);
                if ((incrConsumeNum = this.runningPipes[app.projectName]) != undefined) {

                    app.incrRunning = true;
                    app.incrConsumeNum = incrConsumeNum;
                } else {
                    app.incrRunning = false;
                }
            });
        }
    }

    public gotoPage(p: number) {

        Pager.go(this.router, this.route, p);
    }


    // 跳转到索引维护页面
    public gotoAppManage(app: { appId: number }): void {

        this.httpPost('/runtime/changedomain.ajax'
            , 'event_submit_do_change_app_ajax=y&action=change_domain_action&selappid=' + app.appId)
            .then(result => {
                this.router.navigate(['/corenodemanage']);
            });

    }

    public gotAddIndex(): void {
        this.router.navigate(['/base/appadd']);
    }

    /**
     * 使用索引名称来进行查询
     * @param query
     */
    filterByAppName(data: { query: string, reset: boolean }) {
        // console.log(query);
        Pager.go(this.router, this.route, 1, {name: data.reset ? null : data.query});
    }

    gotoApp(app: Application) {
        // console.log(app);
        // <a [routerLink]="['/c',app.projectName]">{{app.projectName}}</a>
        // if (app.appType === AppType.Solr) {
        //   this.router.navigate(['/c', app.projectName]);
        // } else if (app.appType === AppType.DataX) {
        //   this.router.navigate(['/x', app.projectName]);
        // }
        // _localStorageService: LocalStorageService, r: Router, app: Application
        LatestSelectedIndex.routeToApp(this.tisService, this._localStorageService, this.router, app);
    }

    toggleOpenAssist(app: Application) {
        let a: any = app;
        if (!a.openAssist) {
            this.pageList.forEach((app) => {
                (app as any).openAssist = false;
            });
            this.tisService.currentApp = new CurrentCollection(0, app.projectName);
        } else {
            this.tisService.currentApp = null;
        }
        a.openAssist = !a.openAssist;
    }

    gotoDataXAdd() {
        //routerLink="/base/dataxadd"
        // console.log("xxx");
        this.tisService.currentApp = null;
        this.router.navigate(["/", "base", "dataxadd"], {
            relativeTo: this.route
        });
    }

    pipelineManipuate(app: Application, desc: Descriptor) {
        // console.log(desc);
        if (!desc) {
            throw new Error("param desc can not be empty")
        }
        let pluginMeta: PluginMeta = {
            name: 'appSource',
            require: true,
            extraParam: createExtraDataXParam(app.projectName)
        };

        PluginsComponent.addManipulate(this, pluginMeta, desc, app.projectName)
            .then((result) => {
                if (desc.manipulateStorable) {
                    // this.cdr.detectChanges();
                    // {descMeta: desc, identityName: result.biz()}
                    // console.log(); PluginManipulateMeta

                    let metas: Array<PluginManipulateMeta> = result.biz();
                    for (let meta of metas) {
                        app.manipulateMetas = [...app.manipulateMetas, new PluginManipulateMeta(desc, meta.identityName, meta.stateSummary)];
                        return;
                    }


                    //  console.log( app.manipulateMetas);
                    //  item.dspt.manipulate.stored = [...item.dspt.manipulate.stored, {descMeta: pluginDesc, identityName: result.biz()}]
                    // this.cdr.detectChanges();
                }
                // this.afterPluginManipulate.emit(result);
            });
    }
}


