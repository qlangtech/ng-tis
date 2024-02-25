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
  AfterContentInit,
  AfterViewInit,
  Component,
  EventEmitter,
  Input, NgZone,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from "@angular/core";
import {EventSourceSubject, EventType, ExecuteStep, MessageData, TISService} from "../common/tis.service";
import {BasicFormComponent, CurrentCollection} from "../common/basic.form.component";


import {NzModalService} from "ng-zorro-antd/modal";
import {NzNotificationService} from "ng-zorro-antd/notification";

import {K8SRCSpec, K8SReplicsSpecComponent} from "../common/k8s.replics.spec.component";
import {DataxWorkerDTO, ScalaLog} from "../runtime/misc/RCDeployment";
import {DataxWorkerComponent, PowerjobCptType} from "./datax.worker.component";
import {NzDrawerRef, NzDrawerService} from "ng-zorro-antd/drawer";
import {NgTerminal} from "ng-terminal";
import {Subject, Subscription} from "rxjs";
import {HeteroList, PluginType} from "../common/tis.plugin";
import {NzStatusType} from "ng-zorro-antd/steps/steps.component";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {openWaittingProcessComponent} from "../common/launch.waitting.process.component";

// {
//   // hetero: PluginName
//   heteroPluginTypeGetter: (dto: DataxWorkerDTO) => PluginType //
//     , cptType: PowerjobCptType //
//   , cptShow: (dto: DataxWorkerDTO) => boolean //
//   , cpuMemorySpecGetter: (dto: DataxWorkerDTO) => K8SRCSpec
// }

class ConfirmStepComponent {

  constructor(public heteroPluginType: PluginType, public cptType: PowerjobCptType, public cptShow: boolean, public cpuMemorySpec: K8SRCSpec) {
  }
}


@Component({
  selector: 'k8s-res-config',
  template: `
    <ng-container *ngIf="displayHeader">
      <tis-steps [type]="this.dto.processMeta.stepsType" [step]="3"></tis-steps>
      <tis-page-header [showBreadcrumb]="false">
        <tis-header-tool>
          <button nz-button nzType="default" [disabled]="formDisabled" (click)="prestep()">上一步</button>&nbsp;
          <button [disabled]="formDisabled" nz-button nzType="primary" (click)="launchK8SController()">
            <i nz-icon
               nzType="rocket"
               nzTheme="outline"></i>启动
          </button>
        </tis-header-tool>
      </tis-page-header>
    </ng-container>

    <ng-container *ngFor="let cpt of stepCpts">
      <nz-page-header *ngIf="cpt.cptShow" [nzGhost]="true">
        <nz-page-header-title>{{cpt.cptType.toString()}}</nz-page-header-title>

        <nz-page-header-content>
          <h4>基本配置</h4>
          <div class="item-block">

            <!--            <tis-plugins [formControlSpan]="20" [shallInitializePluginItems]="false"-->
            <!--                         [plugins]="[{name: cpt.hetero, require: true,extraParam:'dataxName_'+ cpt.cptType}]"-->
            <!--                         [disabled]="true" [showSaveButton]="false"></tis-plugins>-->


            <tis-plugins [formControlSpan]="20" [shallInitializePluginItems]="false"
                         [plugins]="[cpt.heteroPluginType]"
                         [disabled]="true" [showSaveButton]="false"></tis-plugins>
          </div>
          <ng-container *ngTemplateOutlet="cpuMemorySpec;context:{spec:cpt.cpuMemorySpec}">

          </ng-container>

        </nz-page-header-content>


      </nz-page-header>
    </ng-container>
    <ng-template #cpuMemorySpec let-spec='spec'>
      <ng-container *ngIf="spec">
        <h4>资源规格</h4>
        <div class="item-block">
          <k8s-replics-spec [rcSpec]="spec" [disabled]="true" [labelSpan]="5"></k8s-replics-spec>
        </div>
      </ng-container>
    </ng-template>
  `
  , styles: [
    `
    `]
})
export class DataxWorkerAddStep3Component extends BasicFormComponent implements AfterViewInit, OnInit, OnDestroy {
  savePlugin = new EventEmitter<any>();
  @ViewChild('k8sReplicsSpec', {read: K8SReplicsSpecComponent, static: true}) k8sReplicsSpec: K8SReplicsSpecComponent;
  @Output() nextStep = new EventEmitter<any>();
  @Output() preStep = new EventEmitter<any>();
  @Input() dto: DataxWorkerDTO;

  @Input() displayHeader = true;

  stepCpts: Array<ConfirmStepComponent> = [];

  constructor(tisService: TISService, modalService: NzModalService, notification: NzNotificationService //
    , public route: ActivatedRoute, public router: Router, private drawerService: NzDrawerService) {
    super(tisService, modalService, notification);
  }

  ngOnInit(): void {
    // console.log(this.dto);
    // if (this.dto.processMeta.supportK8SReplicsSpecSetter && !this.dto.usingPowderJobUseExistCluster && !this.dto.primaryRCSpec) {
    //   throw new Error("rcSpec can not be null");
    // }

    let appTisService: TISService = this.tisService;
    // console.log(this.dto);
    appTisService.currentApp = this.currentApp;// new CurrentCollection(0, this.dto.processMeta.targetName);


    let cpt: {
      // hetero: PluginName
      heteroPluginTypeGetter: (dto: DataxWorkerDTO, params: Params) => PluginType //
      , cptType: PowerjobCptType //
      , cptShow: (dto: DataxWorkerDTO) => boolean //
      , cpuMemorySpecGetter: (dto: DataxWorkerDTO) => K8SRCSpec
    };
    let params = this.route.snapshot.params;
    for (let i = 0; i < this.dto.processMeta.confirmStepCpts.length; i++) {
      cpt = this.dto.processMeta.confirmStepCpts[i];
      //public heteroPluginType: PluginType, public cptType: PowerjobCptType, public cptShow: boolean, public cpuMemorySpec: K8SRCSpec
      this.stepCpts.push(new ConfirmStepComponent(cpt.heteroPluginTypeGetter(this.dto, params), cpt.cptType, cpt.cptShow(this.dto), cpt.cpuMemorySpecGetter(this.dto)));
    }

  }

  get currentApp(): CurrentCollection {
    // console.log(this.dto.processMeta);
    return new CurrentCollection(0, this.dto.processMeta.targetNameGetter(this.route.snapshot.params));
  }

  // private drawerRef: NzDrawerRef<LaunchK8SClusterWaittingProcessComponent>


  launchK8SController() {
    // console.log(this.dto);
    let subject = DataxWorkerAddStep3Component.createLaunchingEventSubject(new CreateLaunchingTarget("datax_action", this.dto.processMeta.launchClusterMethod)
      , this.tisService, this.dto.processMeta.targetNameGetter(this.route.snapshot.params, false, this.dto));


    const drawerRef = openWaittingProcessComponent(this.drawerService, subject);// this.drawerService.create<LaunchK8SClusterWaittingProcessComponent, {}, {}>({
    //   nzWidth: "60%",
    //   nzHeight: "100%",
    //   nzPlacement: "right",
    //   nzContent: LaunchK8SClusterWaittingProcessComponent,
    //   nzContentParams: {"obserable": subject},
    //   nzClosable: false,
    //   nzMaskClosable: false
    // });

    drawerRef.afterClose.subscribe((status: NzStatusType) => {
      subject.close();
      if (status === 'finish') {
        this.successNotify("已经成功在K8S集群中启动" + this.dto.processMeta.pageHeader);
        // let dataXWorkerStatus: DataXJobWorkerStatus
        //   = Object.assign(new DataXJobWorkerStatus(), r.bizresult, {'processMeta': this.dto.processMeta});
        this.dto.processMeta.successCreateNext(this);
        // DataxWorkerComponent.getJobWorkerMeta(this, null, this.dto.processMeta)
        //   .then((dataXWorkerStatus) => {
        //     this.nextStep.emit(dataXWorkerStatus);
        //   });


      }
    })

    // let e = new SavePluginEvent();
    // e.notShowBizMsg = true;
    //
    // this.jsonPost(`/coredefine/corenodemanage.ajax?action=datax_action&emethod=launch_datax_worker&targetName=${this.dto.processMeta.targetName}`
    //   , {'usingPowderJobUseExistCluster': this.dto.usingPowderJobUseExistCluster}, e)
    //   .then((r) => {
    //     if (r.success) {
    //       this.successNotify("已经成功在K8S集群中启动" + this.dto.processMeta.pageHeader);
    //       let dataXWorkerStatus: DataXJobWorkerStatus
    //         = Object.assign(new DataXJobWorkerStatus(), r.bizresult, {'processMeta': this.dto.processMeta});
    //       this.nextStep.emit(dataXWorkerStatus);
    //     }
    //   });
  }

  /**
   * 'launch_datax_worker'
   * @param targetMethodName
   * @param tisService
   * @param targetName
   */
  public static createLaunchingEventSubject(launchTarget: CreateLaunchingTarget, tisService: TISService, targetName: string): EventSourceSubject {
    if (!launchTarget) {
      throw new Error("param launchTarget can not be null");
    }
    // datax_action
    let sseUrl = `/coredefine/corenodemanage.ajax?resulthandler=exec_null&action=${launchTarget.action}&emethod=${launchTarget.targetMethodName}&targetName=${targetName}`;
    if (launchTarget.extraParams) {
      sseUrl += ('&' + launchTarget.extraParams);
    }
    return tisService.createEventSource(targetName, sseUrl);

  }

  ngOnDestroy(): void {
  }

  protected initialize(app: CurrentCollection): void {
    // console.log(app);
  }

  ngAfterViewInit() {
  }


  prestep() {
    this.preStep.next(this.dto);
  }

  public readonly PowerjobCptType = PowerjobCptType;
}

export class CreateLaunchingTarget {
  constructor(public action: string, public targetMethodName: string, public extraParams?: string) {
  }
}



