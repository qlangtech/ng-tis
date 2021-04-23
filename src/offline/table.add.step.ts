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

import {EventEmitter, Input, Output} from '@angular/core';
import {TISService} from '../service/tis.service';
import {BasicFormComponent} from '../common/basic.form.component';
import {Router} from '@angular/router';
import {Location} from '@angular/common';

import {NzModalService} from "ng-zorro-antd";

export class TableAddStep extends BasicFormComponent {
 // @Input() isShow: boolean;
  @Output() previousStep: EventEmitter<any> = new EventEmitter();
  @Output() nextStep: EventEmitter<any> = new EventEmitter();

  constructor(protected tisService: TISService, protected router: Router
    , protected localtion: Location) {
    super(tisService);
  }

  // 执行下一步
  public createPreviousStep(form: any): void {
    this.previousStep.emit(form);
  }

  // 执行下一步
  public createNextStep(form: any): void {
    this.nextStep.emit(form);
  }

  // protected goHomePage(tableId: number): void {
  //   // this.router.navigate(['/t/offline'], {queryParams: {tableId: tableId}});
  // }

  protected goBack(): void {
    this.localtion.back();
  }
}
