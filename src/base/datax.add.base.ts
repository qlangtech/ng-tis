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

import {TISService} from "../service/tis.service";
import {BasicFormComponent} from "../common/basic.form.component";

import {NzModalService} from "ng-zorro-antd";
import {EventEmitter, Input, Output} from "@angular/core";
import {DataxDTO} from "./datax.add.component";


export class BasicDataXAddComponent extends BasicFormComponent {
  @Input() protected dto: DataxDTO;
  @Output() protected nextStep = new EventEmitter<any>();
  @Output() protected preStep = new EventEmitter<any>();

  public get componentName(): string {
    return this.constructor.name;
  }

  constructor(tisService: TISService, modalService: NzModalService) {
    super(tisService, modalService);
  }

  cancel() {
  }

  goback() {
    this.preStep.next(this.dto);
  }
}


