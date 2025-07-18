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

import {ChangeDetectorRef, Component, Input, OnInit, TemplateRef, ViewChild} from "@angular/core";
import {TISService} from "./tis.service";
import {BasicFormComponent} from "./basic.form.component";

import {Pager} from "./pagination.component";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {NzModalService} from "ng-zorro-antd/modal";
import {DataXJobWorkerStatus} from "../runtime/misc/RCDeployment";
import {Descriptor, PluginType, SavePluginEvent, TisResponseResult} from "./tis.plugin";
import {openParamsCfg, PluginsComponent} from "./plugins.component";
import {DataxWorkerAddStep0Component} from "../base/datax.worker.add.step0.component";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {NzDrawerService} from "ng-zorro-antd/drawer";
import {ItemPropValComponent} from "./plugin/item-prop-val.component";
import {TargetPlugin} from "./plugin/type.utils";
import {NzSafeAny} from "ng-zorro-antd/core/types";
import {PreviewComponent} from "./preview.component";
import {KEY_DATAFLOW_PARSER} from "../base/common/datax.common";

class ProcessStrategy {
  constructor(public url: string, public post: string, public sucMsg: string) {
  }
}

@Component({
  selector: "full-build-history",
  template: `

    <ng-template #previewTpl><span nz-icon nzType="preview" nzTheme="fill"></span> 数据预览</ng-template>



    <div style="margin-top: 8px;" *ngIf="dataxProcess && dataXWorkerStatus">
      <nz-alert *ngIf="!dataXWorkerStatus.k8sReplicationControllerCreated" nzType="warning" nzMessage="告知"
                [nzDescription]="unableToUseK8SController" nzShowIcon></nz-alert>
      <ng-template #unableToUseK8SController>
        当前DataX任务执行默认为本地模式（<strong>单机版</strong>），DataX任务只能串型执行，适合非生产环境中使用。如若要在生产环境中使用可启用以下方案：
        <ul style="padding-left: 1em;">
          <li><a target="_blank" [routerLink]="'/base/datax-worker'">K8S DataX执行器</a></li>
          <li>TIS 整合Apache DolphinScheduler 方案 <a target="_blank"
                                                      href="https://tis.pub/docs/install/integer-dolphinscheduler/">详细</a>
            <nz-tag [nzColor]="'pink'">推荐</nz-tag>
          </li>
        </ul>
      </ng-template>
      <nz-alert *ngIf="dataXWorkerStatus.installLocal" nzType="error" nzMessage="警告"
                [nzDescription]="installLocal" nzShowIcon></nz-alert>
      <ng-template #installLocal>
        当前DataX任务执行器需要安装（<strong>单机版</strong>）执行器，请先安装
        <tis-plugin-add-btn [extendPoint]="'com.qlangtech.tis.datax.DataXJobSubmit'" [descriptors]="[]">添加
        </tis-plugin-add-btn>
      </ng-template>
    </div>
    <tis-page-header title="构建历史" [showBreadcrumb]="this.showBreadcrumb" [breadcrumb]="breadcrumb"
                     [result]="result" (refesh)="refesh()">
      <tis-page-header-left *ngIf="dataxProcess && dataXWorkerStatus">
        <ng-container [ngSwitch]="dataXWorkerStatus.k8sReplicationControllerCreated">
          <ng-container *ngSwitchCase="true">
            <nz-tag nzColor="processing">
              <a target="_blank" [routerLink]="'/base/datax-worker'" fragment="wf-list">
                <i nz-icon
                   nzType="link"
                   nzTheme="outline"></i>分布式执行</a>
            </nz-tag>
            <button (click)="editDistributeJob()" [disabled]="formDisabled" nzSize="small" nz-button
                    nzType="default"><span nz-icon nzType="edit" nzTheme="outline"></span>编辑
            </button>
          </ng-container>
          <ng-container *ngSwitchCase="false">
            <button (click)="editLocalJob()" [disabled]="formDisabled" nzSize="small" nz-button
                    nzType="default"><span nz-icon nzType="setting" nzTheme="outline"></span>执行参数
            </button>
          </ng-container>
        </ng-container>&nbsp;
        <button (click)="previewData()" [disabled]="formDisabled" nzSize="small" nz-button
                nzType="default">
          <ng-container *ngTemplateOutlet="previewTpl"></ng-container>
        </button>
      </tis-page-header-left>

      <tis-page-header-left *ngIf="!dataxProcess">
        <button (click)="editLocalJob()" [disabled]="formDisabled" nzSize="small" nz-button
                nzType="default"><span nz-icon nzType="setting" nzTheme="outline"></span>执行参数
        </button>
      </tis-page-header-left>

      <tis-plugin-add-btn [disabled]="formDisabled" *ngIf="showTriggerBtn" [btnSize]="'default'"
                          [extendPoint]="jobTriggerExend"
                          [descriptors]="[]" [initDescriptors]="true" (primaryBtnClick)="triggerFullBuild()"
                          (addPlugin)="triggerPartialBuild($event)">
        <i class="fa fa-rocket" aria-hidden="true"></i> &nbsp;触发构建
      </tis-plugin-add-btn>

    </tis-page-header>
    <tis-page [rows]="buildHistory" [pager]="pager" (go-page)="gotoPage($event)">
      <tis-col title="ID" width="10">
        <ng-template let-rr="r">
          <a [routerLink]="['./', rr.id]">#{{rr.id}}</a>
        </ng-template>
      </tis-col>
      <tis-col title="状态" width="10">
        <ng-template let-rr='r'>
          <i nz-icon [nzType]="rr.stateClass" [ngStyle]="{'color':rr.stateColor}" aria-hidden="true"></i>
          {{rr.literalState}}
        </ng-template>
      </tis-col>
      <tis-col title="阶段描述" width="24">
        <ng-template let-rr='r'>
          <nz-tag [nzColor]="'blue'">{{rr.startPhase}}</nz-tag>
          <i nz-icon nzType="arrow-right" nzTheme="outline"></i>
          <nz-tag [nzColor]="'blue'">{{rr.endPhase}}</nz-tag>
        </ng-template>
      </tis-col>

      <tis-col title="开始时间" width="12">
        <ng-template let-rr='r'>
          {{rr.createTime | date : "yyyy/MM/dd HH:mm:ss"}}
        </ng-template>
      </tis-col>

      <tis-col title="耗时" width="12">
        <ng-template let-rr='r'>
          {{rr.consuming}}
        </ng-template>
      </tis-col>
      <tis-col title="触发方式" width="10">
        <ng-template let-rr='r'>{{rr.triggerType}}</ng-template>
      </tis-col>
    </tis-page>
  `,
  styles: [
    `
      nz-alert {
        margin-top: 5px;
      }
    `
  ]
})
export class FullBuildHistoryComponent extends BasicFormComponent implements OnInit {
  @ViewChild('previewTpl', {read: TemplateRef, static: true}) previewTpl: TemplateRef<NzSafeAny>;
  pager: Pager = new Pager(1, 1, 0);
  buildHistory: any[] = [];
  wfid: number;

  breadcrumb: string[];

  showBreadcrumb = false;
  showTriggerBtn = true;
  @Input()
  dataxProcess = false;
  dataXWorkerStatus: DataXJobWorkerStatus;

  jobTriggerExend = 'com.qlangtech.tis.plugin.trigger.JobTrigger';


  constructor(tisService: TISService, modalService: NzModalService
    , private router: Router, private route: ActivatedRoute
    , private cd: ChangeDetectorRef, notification: NzNotificationService, private drawerService: NzDrawerService
  ) {
    super(tisService, modalService, notification);
    cd.detach();
  }


  ngOnInit(): void {

    let data = this.route.snapshot.data;
    let b = data['showBreadcrumb'];
    let datax = data['datax'];
    if (datax) {
      this.dataxProcess = !!datax;
    }
    this.showBreadcrumb = !!b;
    this.showTriggerBtn = !!data['showTriggerBtn'];


    this.route.params
      .subscribe((params: Params) => {
        this.wfid = parseInt(params['wfid'], 10);
      //  console.log([this.wfid,this.breadcrumb]);

        this.route.queryParams.subscribe((p) => {
          this.httpPost('/coredefine/full_build_history.ajax'
            , `emethod=get_full_build_history&action=core_action&page=${p['page']}&wfid=${this.wfid}&getwf=${!this.breadcrumb}`)
            .then((r) => {
            if (!this.breadcrumb) {
              let wfname = r.bizresult.payload[0];
              this.breadcrumb = [KEY_DATAFLOW_PARSER, '/offline/wf', wfname, `/offline/wf_update/${wfname}`];
            }
        //    console.log([this.wfid,this.breadcrumb]);
            this.pager = Pager.create(r);
            this.buildHistory = r.bizresult.rows;

            if (this.dataxProcess) {
              this.httpPost('/coredefine/corenodemanage.ajax'
                , `action=datax_action&emethod=get_datax_worker_meta&disableRcdeployment=true`).then((rr) => {
                if (rr.success) {
                  this.dataXWorkerStatus = rr.bizresult;
                }
                this.cd.reattach();
              });
            } else {
              this.cd.reattach();
            }
          });
        });
      });
  }

// 刷新列表
  public refesh(): void {
    this.ngOnInit();
  }

  /**
   * 部份表构建
   */
  public triggerPartialBuild(pluginDesc: Descriptor): void {
    //console.log(desc);
    let opt = new SavePluginEvent();
    opt.serverForward = "coredefine:datax_action:trigger_fullbuild_task";


    PluginsComponent.openPluginDialog({
        saveBtnLabel: '触发构建',
        shallLoadSavedItems: false, savePluginEventCreator: () => {
          return opt;
        }
      }
      , this, pluginDesc
      , {name: 'noStore', require: true}
      , `任务触发`
      , (_, biz) => {
        // console.log(taskId);
        let rr: TisResponseResult = {
          success: biz.success,
          bizresult: biz
        }
        this.processTriggerResult(this.getProcessStrategy(true), Promise.resolve(rr));

      });
  }


  public triggerFullBuild(): void {
    this.formDisabled = true;
    let processStrategy = this.getProcessStrategy(this.dataxProcess);
    if (this.appNotAware) {
      // 单纯数据流触发
      processStrategy = {
        url: "/offline/datasource.ajax",
        post: `action=offline_datasource_action&emethod=execute_workflow&id=${this.wfid}`,
        sucMsg: '数据流构建已经触发'
      };
    }
    if (this.dataXWorkerStatus) {
      this.dataXWorkerStatus.installLocal = false;
    }
    this.confirm("是否要触发数据管道执行？", () => {
      this.processTriggerResult(processStrategy, this.httpPost(processStrategy.url, processStrategy.post));
    }).then((_) => {
    }, (reject) => {
      this.formDisabled = false;
    });


    //   .then((r) => {
    //   if (!r.success) {
    //     // let p =   <Promise<any>>r;
    //     return;
    //   }
    //   let taskid = r.bizresult.taskid;
    //   let msg: Array<any> = [];
    //   msg.push({
    //     'content': processStrategy.sucMsg
    //     , 'link': {'content': `查看构建状态(${taskid})`, 'href': './' + taskid}
    //   });
    //   this.httpPost("/coredefine/coredefine.ajax", `action=core_action&emethod=get_workflow_build_history&taskid=${taskid}`)
    //     .then((rr) => {
    //       this.processResultWithTimeout({'success': true, 'msg': msg}, 10000);
    //       this.buildHistory = [rr.bizresult].concat(this.buildHistory); // .concat()
    //     });
    // }, (r: TisResponseResult) => {
    //   if (!r.success && r.bizresult && this.dataXWorkerStatus) {
    //     this.dataXWorkerStatus.installLocal = r.bizresult.installLocal;
    //   }
    // })

  }

  private getProcessStrategy(dataxProcess: boolean) {
    let processStrategy = dataxProcess ?
      new ProcessStrategy(
        "/coredefine/coredefine.ajax",
        "action=datax_action&emethod=trigger_fullbuild_task",
        'DataX任务已经触发'
      ) : new ProcessStrategy(
        "/coredefine/coredefine.ajax",
        "action=core_action&emethod=trigger_fullbuild_task",
        '全量索引构建已经触发'
      );
    return processStrategy;
  }

  private processTriggerResult(processStrategy: ProcessStrategy, triggerPromise: Promise<TisResponseResult>) {
    triggerPromise.then((r) => {
      if (!r.success) {
        // let p =   <Promise<any>>r;
        return;
      }
      let taskid = r.bizresult.taskid;
      let msg: Array<any> = [];
      msg.push({
        'content': processStrategy.sucMsg
        , 'link': {'content': `查看构建状态(${taskid})`, 'href': './' + taskid}
      });
      this.httpPost("/coredefine/coredefine.ajax", `action=core_action&emethod=get_workflow_build_history&taskid=${taskid}`)
        .then((rr) => {
          this.processResultWithTimeout({'success': true, 'msg': msg}, 10000);
          this.buildHistory = [rr.bizresult].concat(this.buildHistory); // .concat()
        });
    }, (r: TisResponseResult) => {
      if (!r.success && r.bizresult && this.dataXWorkerStatus) {
        this.dataXWorkerStatus.installLocal = r.bizresult.installLocal;
      }
    }).finally(() => {
      this.formDisabled = false;
    });
  }

  public gotoPage(p: number) {
    Pager.go(this.router, this.route, p);
  }


  editLocalJob() {

    let targetDesc = 'DataXSubmitParams';

    openParamsCfg(targetDesc, this.drawerService, this, "设置任务触发参数");
  }

  editDistributeJob() {
    // this.openDialog(DistPowerJobTemplateOverwriteComponent,{});

    // this.httpPost('/coredefine/corenodemanage.ajax'
    //   , `action=datax_action&emethod=worker_desc&targetName=${dataXWorkerCfg.processMeta.targetName}`)
    //   .then((r) => {
    //     if (r.success) {
    //       let rList = PluginsComponent.wrapDescriptors(r.bizresult.pluginDesc);
    //       console.log(rList);
    //     }});

    DataxWorkerAddStep0Component.startPowerJobTplAppOverwrite(this);

    // DataxWorkerAddStep0Component.getWorkDescs(dataXWorkerCfg.processMeta.targetName, this)
    //     .then((rList) => {
    //
    //         let desc = Array.from(rList.values());
    //         let pluginDesc = desc.find((dec) => PowerjobCptType.JobTplAppOverwrite.toString() === dec.displayName);
    //         let pluginCategory: PluginType = {name: PowerjobCptType.JobTplAppOverwrite, require: true};
    //
    //         let modelRef = PluginsComponent.openPluginDialog({
    //                 shallLoadSavedItems: true,
    //                 savePluginEventCreator: () => {
    //                     let evnet = new SavePluginEvent();
    //                     evnet.serverForward = "coredefine:datax_action:update_power_job"
    //                     return evnet;
    //                 }
    //             }, this, pluginDesc
    //             , pluginCategory
    //             , `更新PowerJob任务配置`
    //             , (plugin) => {
    //                 this.successNotify("更新PowerJob任务配置成功");
    //                 modelRef.close();
    //             });
    //
    //     });


  }

  /**
   * 预览数据
   */
  previewData() {

    const drawerRef = this.drawerService.create({
      nzHeight: "90%",
      nzTitle: this.previewTpl,
      nzMaskClosable: false,
      nzContent: PreviewComponent,
      nzPlacement: 'bottom',
      nzContentParams: {}
    });
    drawerRef.afterClose.subscribe(hetero => {

    });
  }
}

// @Component({
//     template: `
//         <tis-plugins [formControlSpan]="20" [pluginMeta]="[pluginCategory]"
//                      (afterSave)="afterSaveReader($event)" [showSaveButton]="true"
//                      [shallInitializePluginItems]="true" [_heteroList]="[]"
//                      #pluginComponent></tis-plugins>
//
//     `
// })
// export class DistPowerJobTemplateOverwriteComponent extends BasicFormComponent implements OnInit {
//     pluginCategory: PluginType = {
//         name: 'datax-worker',
//         require: true,
//         extraParam: "dataxName_" + PowerjobCptType.Server
//     };
//
//     constructor(tisService: TISService, modalService: NzModalService
//     ) {
//         super(tisService, modalService);
//     }
//
//     ngOnInit(): void {
//     }
//
//     afterSaveReader($event: PluginSaveResponse) {
//
//     }
// }
