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

import {TISService} from "../common/tis.service";
import {AppFormComponent, CurrentCollection} from "../common/basic.form.component";

import {NzModalService, NzNotificationService} from "ng-zorro-antd";
import {EventEmitter, Input, Output} from "@angular/core";
import {DataxDTO} from "./datax.add.component";
import {ActivatedRoute, Router} from "@angular/router";
import {StepType} from "../common/steps.component";


export abstract class BasicDataXAddComponent extends AppFormComponent {

  @Output()
  protected nextStep = new EventEmitter<any>();
  @Output()
  protected preStep = new EventEmitter<any>();
  @Input()
  public dto: DataxDTO;

  public _offsetStep = -1;

  protected constructor(tisService: TISService, modalService: NzModalService, protected r: Router, route: ActivatedRoute, notification?: NzNotificationService) {
    super(tisService, route, modalService, notification);
  }

  public get stepType(): StepType {
    return this.dto.processModel; //  ? StepType.UpdateDataxReader : StepType.CreateDatax;
  }

  protected initialize(app: CurrentCollection): void {
  }

  public offsetStep(step: number) {
    if (this._offsetStep > -1) {
      return this._offsetStep;
    }
    switch (this.dto.processModel) {
      case StepType.UpdateDataxReader:
        this._offsetStep = step - 1;
        break;
      case StepType.UpdateDataxWriter:
        this._offsetStep = step - 2;
        break;
      default:
        this._offsetStep = step;
    }
    return this._offsetStep;
  }

  // public get componentName(): string {
  //   return this.constructor.name;
  // }
  // tisService: TISService, protected route: ActivatedRoute, modalService: NzModalService


  cancel() {
    if (this.dto.processModel === StepType.CreateDatax) {
      this.r.navigate(['/base/applist'], {relativeTo: this.route});
    } else {
      this.r.navigate(['/x', this.dto.dataxPipeName, "config"], {relativeTo: this.route});
    }
  }

  goback() {
    this.preStep.next(this.dto);
  }
}


