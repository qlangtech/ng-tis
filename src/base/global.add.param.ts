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

import {TISService} from '../common/tis.service';
import {Component} from '@angular/core';

import {BasicFormComponent} from '../common/basic.form.component';
import {NzModalService} from "ng-zorro-antd";

declare var jQuery: any;

// 添加全局参数
@Component({
  // templateUrl: '/runtime/config_file_parameters_add.htm'
  template: `
      <!--from modal frame-->
      <fieldset [disabled]='formDisabled'>
          <div class="modal-header">
              <h4 class="modal-title">添加全局配置参数</h4>
              <button type="button" class="close" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
              </button>
          </div>
          <div class="modal-body">
              <!--show msg-->
              <tis-msg [result]="result"></tis-msg>
              <!--end msg-->
              <p style="text-align:right;">
                  <button type="submit" class="btn btn-primary"
                          name="event_submit_do_add_parameter" (click)="event_submit_do_add_parameter(form)">提 交
                  </button>
              </p>
              <fieldset>
                  <form #form>
                      <input type="hidden" name="action" value="config_file_parameters_action"/>
                      <div class="form-group row">
                          <label for="example-text-input" class="col-2 col-form-label">键</label>
                          <div class="col-10">
                              <input class="form-control" type="text" placeholder="appkey">
                          </div>
                      </div>
                      <div class="form-group row">
                          <label for="example-text-input" class="col-2 col-form-label">值</label>
                          <div class="col-10">
                              <input class="form-control" type="text" placeholder="value123445"/>
                          </div>
                      </div>

                      <div class="form-group row">
                          <label for="example-text-input" class="col-2 col-form-label">说明</label>
                          <div class="col-10">
                              <input class="form-control" type="text" placeholder="全局常量"/>
                          </div>
                      </div>
                  </form>
              </fieldset>
          </div>
      </fieldset>
  `
})
export class AddGlobalParamComponent extends BasicFormComponent {
  constructor(tisService: TISService, modalService: NzModalService) {
    super(tisService, modalService);
  }

  // 添加参数
  public event_submit_do_add_parameter(form: any) {
    this.submitForm('/runtime/config_file_parameters_add.ajax?action=config_file_parameters_action&event_submit_do_add_parameter=y'
      , form);
  }

}
