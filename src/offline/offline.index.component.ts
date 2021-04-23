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

import {TISService} from '../service/tis.service';
import {Component} from '@angular/core';

// import 'ng-zorro-antd/../ng-zorro-antd.min.css';

@Component({
  template: `
    <my-navigate></my-navigate>
    <div class="body_content">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [
      `
    `
  ]
})
export class OffileIndexComponent {
  constructor(private tisService: TISService) {

  }
}
