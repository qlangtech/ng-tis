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

import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {TISService} from "../common/tis.service";
import {AppFormComponent, CurrentCollection} from "../common/basic.form.component";

import {ActivatedRoute, Router} from "@angular/router";


import {NzModalService} from "ng-zorro-antd/modal";
import {Item, SavePluginEvent} from "../common/tis.plugin";
import {K8SReplicsSpecComponent} from "../common/k8s.replics.spec.component";
import {DataxWorkerDTO} from "../runtime/misc/RCDeployment";
import {NzNotificationService} from "ng-zorro-antd/notification";

@Component({
  template: `
      <tis-steps [type]="this.dto.processMeta.stepsType" [step]="1"></tis-steps>
      <tis-page-header [showBreadcrumb]="false">
          <tis-header-tool>
              <button nz-button nzType="default" (click)="prestep()">上一步</button>&nbsp;<button nz-button nzType="primary" (click)="createStep1Next(k8sReplicsSpec)">下一步</button>
          </tis-header-tool>
      </tis-page-header>
      <div class="item-block">
          <k8s-replics-spec [rcSpec]="dto.rcSpec" [errorItem]="errorItem" #k8sReplicsSpec [labelSpan]="3">
          </k8s-replics-spec>
      </div>
  `
})
export class DataxWorkerAddStep2Component extends AppFormComponent implements AfterViewInit, OnInit {
  savePlugin = new EventEmitter<SavePluginEvent>();
  // @ViewChild('k8sReplicsSpec', {read: K8SReplicsSpecComponent, static: true}) k8sReplicsSpec: K8SReplicsSpecComponent;
  @Output() nextStep = new EventEmitter<any>();
  @Output() preStep = new EventEmitter<any>();
  @Input() dto: DataxWorkerDTO;

  errorItem: Item;

  constructor(tisService: TISService, route: ActivatedRoute, modalService: NzModalService) {
    super(tisService, route, modalService);
  }

  get currentApp(): CurrentCollection {
    return new CurrentCollection(0, this.dto.processMeta.targetName);
  }

  createStep1Next(k8sReplicsSpec: K8SReplicsSpecComponent) {
    // console.log(k8sReplicsSpec.k8sControllerSpec);
    let rcSpec = k8sReplicsSpec.k8sControllerSpec;
    let e = new SavePluginEvent();
    e.notShowBizMsg = true;
    this.jsonPost(`/coredefine/corenodemanage.ajax?action=datax_action&emethod=save_datax_worker&targetName=${this.dto.processMeta.targetName}`
      , {
        k8sSpec: rcSpec,
      }, e)
      .then((r) => {
        if (r.success) {
          this.dto.rcSpec = rcSpec;
          this.nextStep.emit(this.dto);
        } else {
          this.errorItem = Item.processFieldsErr(r);
        }
      });
  }

  protected initialize(app: CurrentCollection): void {
  }

  ngAfterViewInit() {
  }


  ngOnInit(): void {
  }


  prestep() {
    this.preStep.emit(this.dto);
  }
}

