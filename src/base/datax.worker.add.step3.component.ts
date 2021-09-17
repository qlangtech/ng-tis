/**
 * Copyright (c) 2020 QingLang, Inc. <baisui@qlangtech.com>
 * <p>
 *   This program is free software: you can use, redistribute, and/or modify
 *   it under the terms of the GNU Affero General Public License, version 3
 *   or later ("AGPL"), as published by the Free Software Foundation.
 * <p>
 *  This program is distributed in the hope that it will be useful, but WITHOUT
 *  ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 *   FITNESS FOR A PARTICULAR PURPOSE.
 * <p>
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild} from "@angular/core";
import {TISService} from "../common/tis.service";
import {AppFormComponent, CurrentCollection} from "../common/basic.form.component";

import {ActivatedRoute} from "@angular/router";


import {NzModalService, NzNotificationService} from "ng-zorro-antd";
import {K8SReplicsSpecComponent} from "../common/k8s.replics.spec.component";
import {DataXJobWorkerStatus, DataxWorkerDTO} from "../runtime/misc/RCDeployment";

@Component({
  template: `
      <tis-steps type="CreateWorkderOfDataX" [step]="2"></tis-steps>
      <tis-page-header [showBreadcrumb]="false">
          <tis-header-tool>
              <button nz-button nzType="default" [disabled]="formDisabled" (click)="prestep()">上一步</button>&nbsp;
              <button [disabled]="formDisabled" nz-button nzType="primary" (click)="launchK8SController()"><i nz-icon nzType="rocket" nzTheme="outline"></i>启动</button>
          </tis-header-tool>
      </tis-page-header>
      <h4>K8S基本信息</h4>
      <div class="item-block">
          <tis-plugins [formControlSpan]="20" [shallInitializePluginItems]="false" [plugins]="['datax-worker']" [disabled]="true"
                       [showSaveButton]="false"
                       #pluginComponent></tis-plugins>
      </div>
      <h4>K8S资源规格</h4>
      <div class="item-block">
          <k8s-replics-spec [rcSpec]="this.dto.rcSpec" [disabled]="true" #k8sReplicsSpec [labelSpan]="3"></k8s-replics-spec>
      </div>
  `
  , styles: [
      `
    `]
})
export class DataxWorkerAddStep3Component extends AppFormComponent implements AfterViewInit, OnInit {
  savePlugin = new EventEmitter<any>();
  @ViewChild('k8sReplicsSpec', {read: K8SReplicsSpecComponent, static: true}) k8sReplicsSpec: K8SReplicsSpecComponent;
  @Output() nextStep = new EventEmitter<any>();
  @Output() preStep = new EventEmitter<any>();
  @Input() dto: DataxWorkerDTO;

  constructor(tisService: TISService, route: ActivatedRoute, modalService: NzModalService, notification: NzNotificationService) {
    super(tisService, route, modalService, notification);
  }

  ngOnInit(): void {
    if (!this.dto.rcSpec) {
      throw new Error("rcSpec can not be null");
    }
  }

  launchK8SController() {
    this.jsonPost('/coredefine/corenodemanage.ajax?action=datax_action&emethod=launch_datax_worker'
      , {
        // k8sSpec: this.k8sReplicsSpec.k8sControllerSpec,
      })
      .then((r) => {
        if (r.success) {
          this.successNotify("已经成功在K8S集群中启动DataX执行器");
          let dataXWorkerStatus: DataXJobWorkerStatus = Object.assign(new DataXJobWorkerStatus(), r.bizresult);
          // let rList = PluginsComponent.wrapDescriptors(r.bizresult.pluginDesc);
          // let desc = Array.from(rList.values());
          // this.hlist = DatasourceComponent.pluginDesc(desc[0])
          this.nextStep.emit(dataXWorkerStatus);
        }
      });
  }

  protected initialize(app: CurrentCollection): void {
  }

  ngAfterViewInit() {
  }


  prestep() {
    this.preStep.next(this.dto);
  }
}

