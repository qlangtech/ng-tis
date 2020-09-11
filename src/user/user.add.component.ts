import {Component, OnInit} from '@angular/core';
import {BasicFormComponent} from '../common/basic.form.component';
import {TISService} from '../service/tis.service';
import {Router} from '@angular/router';

import {NzModalService} from "ng-zorro-antd";

@Component({
  // from:/runtime/usradd.htm
  template: `
      <fieldset [disabled]='formDisabled'>
          <div class="modal-header">
              <h4 class="modal-title"><i class="fa fa-user-plus" aria-hidden="true"></i></h4>
              <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss('Cross click')">
                  <span aria-hidden="true">&times;</span>
              </button>
          </div>
          <div class="modal-body">
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
          </div>
      </fieldset>
  `
})
export class UserAddComponent extends BasicFormComponent implements OnInit {

  constructor(tisService: TISService, private router: Router
    , modalService: NzModalService, ) {
    super(tisService, modalService);
  }


  ngOnInit(): void {

  }
}
