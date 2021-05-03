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

import {AfterContentInit, AfterViewInit, Component, Input, OnInit} from "@angular/core";
import {BasicFormComponent} from "./basic.form.component";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {TISService} from "../service/tis.service";
import {ActivatedRoute} from "@angular/router";
import {NzModalService} from "ng-zorro-antd";


@Component({
  selector: `k8s-replics-spec`,
  template: `

      <tis-form [labelSpan]="this.labelSpan" [controlerSpan]="this.controlSpan" [formGroup]="specForm">
          <tis-ipt #pods title="Pods" name="pods" require>
              <nz-input-group nzCompact [nzAddOnAfter]="podUnit" style="width:200px">
                  <nz-input-number [nzDisabled]="disabled" name="pods" formControlName="pods" class="input-number" [nzMin]="1" [nzMax]="20" [nzStep]="1" [ngModel]="1"></nz-input-number>
              </nz-input-group>
          </tis-ipt>
          <tis-ipt title="CPU" name="cpu" require>
              <div class="resource-spec">
                  <div>
                      <nz-input-group nzAddOnBefore="Request" nzCompact [nzAddOnAfter]="cpuRequestTpl">
                          <nz-input-number [nzDisabled]="disabled" name="cuprequest" class="input-number" formControlName="cuprequest" [nzMin]="1" [nzStep]="1"></nz-input-number>
                      </nz-input-group>
                      <ng-template #cpuRequestTpl>
                          <nz-select [nzDisabled]="disabled" class="spec-unit" formControlName="cuprequestunit">
                              <nz-option [nzLabel]="'millicores'" [nzValue]="'m'"></nz-option>
                              <nz-option [nzLabel]="'cores'" [nzValue]="'cores'"></nz-option>
                          </nz-select>
                      </ng-template>
                  </div>
                  <div>
                      <nz-input-group nzAddOnBefore="Limit" nzCompact [nzAddOnAfter]="cpuLimitTpl">
                          <nz-input-number [nzDisabled]="disabled" formControlName="cuplimit" class="input-number" [nzMin]="1" [nzStep]="1"></nz-input-number>
                      </nz-input-group>
                      <ng-template #cpuLimitTpl>
                          <nz-select [nzDisabled]="disabled" class="spec-unit" formControlName="cuplimitunit">
                              <nz-option [nzLabel]="'millicores'" [nzValue]="'m'"></nz-option>
                              <nz-option [nzLabel]="'cores'" [nzValue]="'cores'"></nz-option>
                          </nz-select>
                      </ng-template>
                  </div>
              </div>
          </tis-ipt>
          <tis-ipt title="Memory" name="memory" require>
              <div class="resource-spec">
                  <div>
                      <nz-input-group nzAddOnBefore="Request" nzCompact [nzAddOnAfter]="memoryrequestTpl">
                          <nz-input-number [nzDisabled]="disabled" formControlName="memoryrequest" class="input-number" [nzMin]="1" [nzStep]="1"></nz-input-number>
                      </nz-input-group>
                      <ng-template #memoryrequestTpl>
                          <nz-select [nzDisabled]="disabled" class="spec-unit" formControlName="memoryrequestunit">
                              <nz-option [nzLabel]="'MB'" [nzValue]="'M'"></nz-option>
                              <nz-option [nzLabel]="'GB'" [nzValue]="'G'"></nz-option>
                          </nz-select>
                      </ng-template>
                  </div>
                  <div>
                      <nz-input-group nzAddOnBefore="Limit" nzCompact [nzAddOnAfter]="memorylimitTpl">
                          <nz-input-number [nzDisabled]="disabled" formControlName="memorylimit" class="input-number" [nzMin]="1" [nzStep]="1"></nz-input-number>
                      </nz-input-group>
                      <ng-template #memorylimitTpl>
                          <nz-select [nzDisabled]="disabled" class="spec-unit" formControlName="memorylimitunit">
                              <nz-option [nzLabel]="'MB'" [nzValue]="'M'"></nz-option>
                              <nz-option [nzLabel]="'GB'" [nzValue]="'G'"></nz-option>
                          </nz-select>
                      </ng-template>
                  </div>
              </div>
          </tis-ipt>
          <tis-ipt title="弹性扩缩容" name="hpa" require>
              <div *ngIf="!disabled">
                  <nz-switch  nzCheckedChildren="开" nzUnCheckedChildren="关" formControlName="supportHpa"></nz-switch>
              </div>
              <div *ngIf="specForm?.get('supportHpa').value" class="resource-spec">
                  <div>
                      <nz-input-group  nzAddOnBefore="CPU平均利用率" [nzAddOnAfter]="'%'" nzCompact>
                          <nz-input-number [nzDisabled]="disabled" name="cpuAverageUtilization" class="input-number" formControlName="cpuAverageUtilization" [nzMin]="1" [nzStep]="1"></nz-input-number>
                      </nz-input-group>
                  </div>
                  <div>
                      <nz-input-group nzAddOnBefore="最小Pods" [nzAddOnAfter]="podUnit" nzCompact>
                          <nz-input-number [nzDisabled]="disabled" name="minHpaPod" class="input-number" formControlName="minHpaPod" [nzMin]="1" [nzStep]="1"></nz-input-number>
                      </nz-input-group>
                  </div>
                  <div>
                      <nz-input-group nzAddOnBefore="最大Pods" [nzAddOnAfter]="podUnit" nzCompact>
                          <nz-input-number [nzDisabled]="disabled" formControlName="maxHpaPod" class="input-number" formControlName="maxHpaPod" [nzMin]="1" [nzStep]="1"></nz-input-number>
                      </nz-input-group>
                  </div>
              </div>
          </tis-ipt>
      </tis-form>
      <ng-template #podUnit>个</ng-template>
  `
  , styles: [`
        .resource-spec {
            display: flex;
        }

        .resource-spec .spec-unit {
            width: 150px;
        }

        .resource-spec div {
            flex: 1;
            margin-right: 20px;
        }

        .input-number {
            width: 100%;
        }

        .spec-form {
        }
  `]
})
export class K8SReplicsSpecComponent extends BasicFormComponent implements AfterContentInit, AfterViewInit, OnInit {
  specForm: FormGroup;
  @Input()
  labelSpan = 2;
  @Input()
  controlSpan = 20;

  @Input()
  disabled = false;

  // supportHpa = true;

  constructor(tisService: TISService, modalService: NzModalService, private fb: FormBuilder) {
    super(tisService, modalService);
  }

  ngAfterContentInit(): void {
  }

  public get k8sControllerSpec(): any {
    // if (this.specForm && this.specForm.valid) {
    //   alert('has error');
    //   return;
    // }
    return this.specForm.value;
  }

  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
    this.specForm = this.fb.group({
      supportHpa: [false, Validators.required],
      minHpaPod: [1],
      maxHpaPod: [1],
      cpuAverageUtilization: [10, [Validators.max(100), Validators.min(1)]],
      pods: [1, Validators.required],
      cuprequest: [500, [Validators.required]],
      cuprequestunit: ['m', [Validators.required]],
      cuplimitunit: ['cores', [Validators.required]],
      cuplimit: [1, [Validators.required]],
      memoryrequest: [500, [Validators.required]],
      memoryrequestunit: ['M', [Validators.required]],
      memorylimit: [2, [Validators.required]],
      memorylimitunit: ['G', [Validators.required]]
    });
  }
}
