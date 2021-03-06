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
import {Component, Injector, Input, OnInit} from '@angular/core';

import {BasicFormComponent} from '../common/basic.form.component';
import {NzModalService} from "ng-zorro-antd";


// 设置全局参数
@Component({
  // templateUrl: '/runtime/config_file_parameters_set.htm'
  template: `
    <!--from modal frame-->
    <fieldset [disabled]='formDisabled'>
      <div class="modal-header">
        <h4 class="modal-title">设置全局配置参数</h4>
        <button type="button" class="close" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
         <tis-page-header [showBreadcrumb]="false" [result]="result" >
             <button nz-button nzType="danger"  (click)="deleteParam()">
                 <i class="fa fa-trash" aria-hidden="true"></i>删除
             </button> &nbsp;
             <button nz-button nzType="primary"
                     (click)="event_submit_do_set_parameter(form)">更新
             </button>
         </tis-page-header>
        <fieldset id="uploaddialog">
          <form #form>
            <input type="hidden" name="action" value="config_file_parameters_action"/>
            <input type="hidden" name="emethod" value="set_parameter"/>
            <div class="form-group">

              <h4>{{resparam.keyName}}:</h4>
              <input type="text" class="form-control" id="inputValue"
                     [(ngModel)]="resparam.value" name="keyvalue"/>
            </div>
          </form>
        </fieldset>
      </div>
    </fieldset>
  `
})
export class GlobalUpdateParamComponent extends BasicFormComponent implements OnInit {


  resparam: any = {value: '', keyName: ''};
  rpidVal: number;

  constructor(tisService: TISService, modalService: NzModalService
    , private injector: Injector) {
    super(tisService, modalService);
  }

  ngOnInit(): void {
    this.httpPost('/runtime/config_file_parameters_set.ajax'
      , 'event_submit_do_get_param=y&action=config_file_parameters_action&rpid=' + this.rpidVal)
      .then(result => {
        if (result.success) {
          this.resparam = result.bizresult;
        }
      });
  }

  @Input() set rpid(val: number) {
    this.rpidVal = val;

  }


  // 添加参数
  public event_submit_do_set_parameter(form: any) {
    this.submitForm('/runtime/config_file_parameters_set.ajax'
      , form);
  }

  deleteParam() {
  }
}
