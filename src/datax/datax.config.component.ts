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

import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {TISService} from '../common/tis.service';
import {ActivatedRoute, Router} from '@angular/router';
import {AppFormComponent, BasicFormComponent, CurrentCollection} from '../common/basic.form.component';

import {NzModalService} from "ng-zorro-antd/modal";
import {DataxAddComponent, DataxDTO} from "../base/datax.add.component";
import {ExecModel} from "../base/datax.add.step7.confirm.component";
import {PluginsComponent} from "../common/plugins.component";
import {Descriptor} from "../common/tis.plugin";

// import {ExecModel} from "../base/datax.add.step7.confirm.component";


@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
      <!--      <tis-plugins [errorsPageShow]="false"-->
      <!--                   [formControlSpan]="20" [shallInitializePluginItems]="false" [showSaveButton]="false" [disabled]="true"-->
      <!--                   [plugins]="[{name: 'dataxReader', require: true, extraParam: 'justGetItemRelevant_true,dataxName_' + this.dto.dataxPipeName}]"></tis-plugins>-->
      <datax-config *ngIf="dto"  [dtoooo]="dto" [execModel]="execModel"></datax-config>
  `,
  styles: [`
  `]
})
export class DataxConfigComponent extends AppFormComponent implements OnInit {

  public dto: DataxDTO = null;



  constructor(tisService: TISService, route: ActivatedRoute, modalService: NzModalService, private router: Router) {
    super(tisService, route, modalService);
  }

  protected initialize(app: CurrentCollection): void {
    DataxAddComponent.getDataXMeta(this, app).then((dto) => {
      // console.log(dto);
      this.dto = dto;
    });
  }


  get execModel(): ExecModel {
    return ExecModel.Reader;
  }
}
