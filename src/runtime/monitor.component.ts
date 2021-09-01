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

import {Component} from "@angular/core";
import {TISService} from "../common/tis.service";
import {BasicFormComponent} from "../common/basic.form.component";

import {NzModalService} from "ng-zorro-antd";


@Component({
  template: `
      <div style="margin-top: 20px" nz-row [nzGutter]="16">
          <div class="line-chart-block" nz-col nzSpan="12">
              <line-chart queryType="solrQuery"></line-chart>
          </div>
          <div class="line-chart-block"  nz-col nzSpan="12">
              <line-chart queryType="docUpdate"></line-chart>
          </div>
      </div>
  `,
  styles: [
      `
          .line-chart-block {
          }
    `
  ]
})
export class MonitorComponent extends BasicFormComponent {
  constructor(tisService: TISService, modalService: NzModalService) {
    super(tisService, modalService);
  }
}
