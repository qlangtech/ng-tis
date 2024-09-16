import {AppFormComponent, CurrentCollection} from "../common/basic.form.component";
import {
  AfterContentInit,
  Component,
  EventEmitter,
  OnDestroy,
  Output,
  Input,
  TemplateRef,
  ViewChild
} from "@angular/core";
import {TISService} from "../common/tis.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NzModalService} from "ng-zorro-antd/modal";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {Pager} from "../common/pagination.component";
import {IndexIncrStatus} from "./misc/RCDeployment";
import FlinkSavepoint = flink.job.detail.FlinkSavepoint;
import {TisResponseResult} from "../common/tis.plugin";
import {NzSafeAny} from "ng-zorro-antd/core/types";
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {openWaittingProcessComponent} from "../common/launch.waitting.process.component";
import {CreateLaunchingTarget} from "../base/datax.worker.add.step3.component";
import {NzStatusType} from "ng-zorro-antd/steps/steps.component";
import {NzDrawerService} from "ng-zorro-antd/drawer";

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


@Component({
  selector: "incr-build-step4-running-savepoint",
  template: `
    <nz-spin size="large" [nzSpinning]="this.formDisabled">
      <tis-page-header [showBreadcrumb]="false">
        <nz-space>
          <ng-template #restoreFromCheckpointContentTemplate>
            <div class="item-block">
              <nz-alert *ngIf="dto.restorableByCheckpoint" nzType="info"
                        [nzMessage]="'以下输入框值请查看Flink JobManager 节点，路径为:'+ dto.flinkJobDetail.incrJobStatus.savePointRootPath+' 路径中的参数'"></nz-alert>
              <form nz-form style="margin-top:10px" [formGroup]="validateForm">
                <nz-form-item>
                  <nz-form-label [nzSpan]="10" nzFor="email">CheckpointId</nz-form-label>
                  <nz-form-control [nzSpan]="14" nzErrorTip="请填写">
                    <nz-input-number formControlName="checkpointId" [nzMin]="1" id="checkpointId"
                                     [nzStep]="1"></nz-input-number>
                  </nz-form-control>
                </nz-form-item>
              </form>
            </div>
          </ng-template>
          <button *nzSpaceItem nz-button nzType="default" (click)="restoreFromCheckpoint()"
                  [disabled]="dto.state === 'RUNNING' ">
            从Checkpoint恢复
          </button>
          <button *nzSpaceItem nz-button nzType="primary" (click)="createNewSavepoint()"
                  [disabled]="dto.state !== 'RUNNING' ">
            创建新记录
          </button>
        </nz-space>
      </tis-page-header>
      <tis-page [rows]="savepoints" [pager]="pager" (go-page)="gotoPage($event)">
        <tis-col title="SavePoint" width="80">
          <ng-template let-rr="r">
            <dl class="sp-info">
              <dt><i nz-icon nzType="file-text" nzTheme="outline"></i> 路径</dt>
              <dd> {{rr.path}}</dd>
              <dt>创建时间</dt>
              <dd> {{rr.createTimestamp | date:'yyyy/MM/dd HH:mm:ss'}} </dd>
            </dl>
          </ng-template>
        </tis-col>
        <tis-col title="操作">
          <ng-template let-rr='r'>
            <button nz-button nz-dropdown [nzDropdownMenu]="menu">
              操作
              <i nz-icon nzType="down"></i>
            </button>
            <nz-dropdown-menu #menu="nzDropdownMenu">
              <ul nz-menu>
                <li nz-menu-item>
                  <button nz-button nzType="link"
                          [disabled]="dto.state !== 'STOPED' && dto.state !== 'DISAPPEAR' "
                          (click)="relaunchJob(rr)"><i nz-icon nzType="rollback" nzTheme="outline"></i>恢复任务
                  </button>
                </li>
                <li nz-menu-item>
                  <button nz-button nzType="link" [disabled]="dto.state !== 'RUNNING'"
                          (click)="discardSavePoint(rr)"><i nz-icon nzType="delete"
                                                            nzTheme="outline"></i>废弃
                  </button>
                </li>
              </ul>
            </nz-dropdown-menu>
          </ng-template>
        </tis-col>
      </tis-page>
    </nz-spin>
  `,
  styles: [
    `
      .sp-info dt {
        font-weight: bold;
      }

      .sp-info dd {
        color: #989898;
      }
    `
  ]
})
export class IncrBuildStep4StopedComponent extends AppFormComponent implements AfterContentInit, OnDestroy {

  @ViewChild('restoreFromCheckpointContentTemplate', {
    read: TemplateRef,
    static: true
  }) restoreFromCheckpointContentTemplate: TemplateRef<NzSafeAny>;
  validateForm!: FormGroup;
  pager: Pager = new Pager(1, 1, 0);
  @Input()
  dto: IndexIncrStatus = new IndexIncrStatus();
  savepoints: any[] = [];
  @Output() afterRelaunch = new EventEmitter<TisResponseResult>();

  constructor(tisService: TISService, private router: Router, route: ActivatedRoute
    , modalService: NzModalService, notification: NzNotificationService, private fb: FormBuilder, private drawerService: NzDrawerService) {
    super(tisService, route, modalService, notification);
    this.validateForm = this.fb.group({
      checkpointId: [null, [Validators.required]]
    });
  }

  protected initialize(app: CurrentCollection): void {
    this.savepoints = this.dto.flinkJobDetail.incrJobStatus.savepointPaths;
  }

  relaunchJob(sp: FlinkSavepoint) {
    // this.modalService.confirm({
    //   nzTitle: '恢复任务',
    //   nzContent: `是否要恢复增量实例'${this.currentApp.appName}'`,
    //   nzOkText: '执行',
    //   nzCancelText: '取消',
    //   nzOnOk: () => {
    //     this.httpPost('/coredefine/corenodemanage.ajax'
    //       , "event_submit_do_relaunch_incr_process=y&action=core_action&savepointPath=" + sp.path).then((r) => {
    //       if (r.success) {
    //         this.successNotify(`已经成功恢复增量实例${this.currentApp.appName}`);
    //         //  this.router.navigate(["."], {relativeTo: this.route});
    //         // this.nextStep.next(this.dto);
    //         this.afterRelaunch.emit(r);
    //       }
    //     });
    //   }
    // });

    //====================================================
    let sseUrl = '/coredefine/corenodemanage.ajax?event_submit_do_relaunch_incr_process=y&action=core_action&savepointPath=' + sp.path + '&appname=' + this.tisService.currentApp.appName;
    // 保存MQ消息
    // this.jsonPost(url, {}).then((r) => {
    //   if (r.success) {
    //     this.nextStep.emit(this.dto);
    //   }
    // });
    ///////////////////////
    let subject = this.tisService.createEventSource(null, sseUrl);
    const drawerRef = openWaittingProcessComponent(this.drawerService, subject
      //  , new CreateLaunchingTarget("core_action", "re_deploy_incr_sync_channal",`appname=${this.tisService.currentApp.appName}`)
    );// this.drawerService.create<LaunchK8SClusterWaittingProcessComponent, {}, {}>({
    //   nzWidth: "60%",
    //   nzHeight: "100%",
    //   nzPlacement: "right",
    //   nzContent: LaunchK8SClusterWaittingProcessComponent,
    //   nzContentParams: {"obserable": subject},
    //   nzClosable: false,
    //   nzMaskClosable: false
    // });
    // let cpt: LaunchK8SClusterWaittingProcessComponent = drawerRef.getContentComponent();
    // console.log(drawerRef);
    // cpt.launchTarget =;
    drawerRef.afterClose.subscribe((status: NzStatusType) => {
      subject.close();
      if (status === 'finish') {
        // this.successNotify("已经成功在K8S集群中启动" + this.dto.processMeta.pageHeader);
        // this.afterRelaunch.emit(r);
        //this.nextStep.emit(this.dto);
        IndexIncrStatus.getIncrStatusThenEnter(this, (incrStatus) => {
          let result: TisResponseResult = {success: true, bizresult: incrStatus};
          this.afterRelaunch.emit(result);
        }, false);


        // let dataXWorkerStatus: DataXJobWorkerStatus
        //   = Object.assign(new DataXJobWorkerStatus(), r.bizresult, {'processMeta': this.dto.processMeta});
        //  this.dto.processMeta.successCreateNext(this);
        // DataxWorkerComponent.getJobWorkerMeta(this, null, this.dto.processMeta)
        //   .then((dataXWorkerStatus) => {
        //     this.nextStep.emit(dataXWorkerStatus);
        //   });


      }
    })
  }

  discardSavePoint(sp: FlinkSavepoint) {
    this.modalService.confirm({
      nzTitle: '删除Savepoint',
      nzContent: `是否要删除 该路径下的Savepoint：'${sp.path}'`,
      nzOkText: '执行',
      nzCancelText: '取消',
      nzOnOk: () => {
        this.httpPost('/coredefine/corenodemanage.ajax'
          , "event_submit_do_discard_savepoint=y&action=core_action&savepointPath=" + sp.path).then((r) => {
          if (r.success) {
            this.dto = Object.assign(new IndexIncrStatus(), r.bizresult);
            this.initialize(null);
            this.successNotify(`已经成功删除Savepoint${sp.path}`);
            //  this.router.navigate(["."], {relativeTo: this.route});
            // this.nextStep.next(this.dto);
            // this.afterRelaunch.emit(r);
          }
        });
      }
    });
  }

  public gotoPage(p: number) {
    Pager.go(this.router, this.route, p);
  }

  ngAfterContentInit(): void {
  }

  ngOnDestroy(): void {
  }


  createNewSavepoint() {
    this.modalService.confirm({
      nzTitle: '创建最新Savepoint',
      nzContent: `是否要为'${this.currentApp.appName}'创建Savepoint`,
      nzOkText: '执行',
      nzCancelText: '取消',
      nzOnOk: () => {
        this.httpPost('/coredefine/corenodemanage.ajax'
          , "event_submit_do_create_new_savepoint=y&action=core_action").then((r) => {
          if (r.success) {
            this.dto = Object.assign(new IndexIncrStatus(), r.bizresult);
            this.initialize(null);
            this.successNotify(`已经成功为${this.currentApp.appName}创建Savepoint`);
          }
        });
      }
    });
  }


  restoreFromCheckpoint() {

    if (!this.dto.restorableByCheckpoint) {
      this.errNotify("不能执行，因为需要恢复的Flink任务，没有开启Checkpoint并且使用持久化StateBackend");
      return;
    }

    this.modalService.confirm({
      nzTitle: '从历史Checkpoint中恢复任务',
      nzContent: this.restoreFromCheckpointContentTemplate,
      nzOkText: '执行',
      nzCancelText: '取消',
      nzWidth: "500px",
      nzOnOk: () => {

        if (this.validateForm.valid) {
          // console.log('submit', this.validateForm.value);

          // this.httpPost('/coredefine/corenodemanage.ajax'
          //   , "event_submit_do_restore_from_checkpoint=y&action=core_action&checkpointId="
          //   + this.validateForm.controls["checkpointId"].value).then((r) => {
          //   if (r.success) {
          //     this.dto = Object.assign(new IndexIncrStatus(), r.bizresult);
          //     this.initialize(null);
          //     this.successNotify(`已经成功为${this.currentApp.appName}创建Savepoint`);
          //   }
          // });

          //==========================================================
          let sseUrl = '/coredefine/corenodemanage.ajax?event_submit_do_restore_from_checkpoint=y&action=core_action&checkpointId='
            + this.validateForm.controls["checkpointId"].value
            + '&appname=' + this.tisService.currentApp.appName;

          let subject = this.tisService.createEventSource(null, sseUrl);
          const drawerRef = openWaittingProcessComponent(this.drawerService, subject);
          drawerRef.afterClose.subscribe((status: NzStatusType) => {
            subject.close();
            if (status === 'finish') {
              IndexIncrStatus.getIncrStatusThenEnter(this, (incrStatus) => {
                let result: TisResponseResult = {success: true, bizresult: incrStatus};
                this.afterRelaunch.emit(result);
                // this.dto = incrStatus;
                // this.initialize(null);
                // this.successNotify(`已经成功为${this.currentApp.appName}恢复增量任务`);

              }, false);
            }
          })


        } else {
          Object.values(this.validateForm.controls).forEach(control => {
            if (control.invalid) {
              control.markAsDirty();
              control.updateValueAndValidity({onlySelf: true});
            }
          });
          return false;
        }


      }
    });
  }
}
