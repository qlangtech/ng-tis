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
 * Created by baisui on 2017/3/29 0029.
 */
import {Component} from '@angular/core';
import {TISService} from '../common/tis.service';
import {BasicFormComponent} from "../common/basic.form.component";

@Component({
  // templateUrl: '/runtime/jarcontent/sys_daily_resources.htm'
  template: `
      <fieldset [disabled]='formDisabled'>
          <div class="modal-header">
              <h4 class="modal-title">同步线上配置</h4>
              <button type="button" class="close" aria-label="Close" >
                  <span aria-hidden="true">&times;</span>
              </button>
          </div>
          <div class="modal-body">
              <tis-msg [result]="result"></tis-msg>
              <div class="note">DAILY环境中还没有设置配置文件，不能同步</div>
              <br/>
              <div>
                  <div class="note2">DAILY环境配置文件已经同步到线上，不需要再同步了</div>
              </div>
          </div>
      </fieldset>
  `
})
// 将配置同步到线上
export class SyncConfigComponent extends BasicFormComponent {

  constructor(tisService: TISService, ) {
    super(tisService, null);
  }

// 开始将日常环境中的配置同步到线上环境中
  public synchronizeConfigRes(): void {
    //   TIS.ajax({url:'$manageModule.setTarget('jarcontent/snapshotlist.ajax')',
    //     type:'POST',
    //     dataType:"json",
    //     data:"event_submit_do_sync_daily_config=y&action=save_file_content_action&appid=$manageTool.appDomain.appid",
    //     success:function(data){
    //     appendMessage(data,$("#messageblock"))
    //   }
    // });

    this.tisService.httpPost('', '');

  }

}
