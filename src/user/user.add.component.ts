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

import {Component, OnInit} from '@angular/core';
import {BasicFormComponent} from '../common/basic.form.component';
import {TISService} from '../common/tis.service';
import {Router} from '@angular/router';

import {NzModalService} from "ng-zorro-antd";

@Component({
  // from:/runtime/usradd.htm
  template: `

      <tis-msg [result]="result"></tis-msg>
      <form class="form-horizontal">
          <input type="hidden" name="action" value="user_action"/>
          <input type="hidden" name="event_submit_do_usr_add" value="y"/>

          <div class="row justify-content-end">

              <div class="col-sm-2">
                  <button type="submit" class="btn btn-primary">创建账户</button>
              </div>
          </div>

          <div class="form-group">
              <label for="user_account">账户名</label>
              <input type="text" class="form-control" id="user_account" placeholder="xiaobai@126.com/xiaobai" name="userAccount">
          </div>

          <div class="form-group">
              <label for="real_name">用户名</label>
              <input type="text" id="real_name" class="form-control" placeholder="小白" name="realName"/>
          </div>
          <div class="form-group">
              <label for="inputPassword">密码</label>
              <input type="password" id="inputPassword" class="form-control" placeholder="Password" name="password"/>
          </div>

          <div class="form-group">
              <label for="real_name">设置部门</label>

              <input type="hidden" name="selecteddptid" id="selecteddptid"/>
              <select id="rootdpt" class="form-control" style="width:200px" name="dptid">
                  <option value="-1" selected>请选择</option>
              </select>
          </div>
      </form>
  `
})
export class UserAddComponent extends BasicFormComponent implements OnInit {

  constructor(tisService: TISService, private router: Router
    , modalService: NzModalService) {
    super(tisService, modalService);
  }


  ngOnInit(): void {

  }
}
