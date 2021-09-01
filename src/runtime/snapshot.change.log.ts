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

/**
 * Created by baisui on 2017/4/10 0010.
 */
//
import {Component, OnInit} from '@angular/core';
import {TISService} from '../common/tis.service';
import {BasicEditComponent} from '../corecfg/basic.edit.component';
// import {ScriptService} from '../service/script.service';

import {AppFormComponent, BasicFormComponent, CurrentCollection} from '../common/basic.form.component';
import {ActivatedRoute} from '@angular/router';
import {NzModalService} from "ng-zorro-antd";

@Component({
  // templateUrl: '/runtime/operation_log_special_app.htm'
  template: `
      <fieldset [disabled]='formDisabled'>

          <tis-msg [result]="result"></tis-msg>
          <table class="table table-hover">
              <thead class="thead-default">
              <tr>
                  <th width="100px">操作人</th>
                  <th>日志</th>
                  <th width="200px">时间</th>
              </tr>
              </thead>
              <tbody>
              <tr *ngFor="let l of logs">
                  <td style="padding-right:10px;" align="right">{{l.usrName}}</td>
                  <td>{{l.memo}}</td>
                  <td>{{l.createTime}}</td>
              </tr>
              </tbody>
          </table>
      </fieldset>
  `
})
export class SnapshotChangeLogComponent extends AppFormComponent {
  logs: any[] = [];

  constructor(tisService: TISService, route: ActivatedRoute, modalService: NzModalService) {
    super(tisService, route, modalService);
  }

  protected initialize(app: CurrentCollection): void {
    this.httpPost('/runtime/operation_log_special_app.ajax'
      , 'action=operation_log_action&emethod=get_init_data&tab=server_group&opt=updateByExampleSelective')
      .then((r) => {
        if (r.success) {
          this.logs = r.bizresult;
        }
      });
  }
}
