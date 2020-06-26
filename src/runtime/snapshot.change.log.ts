/**
 * Created by baisui on 2017/4/10 0010.
 */
//
import {Component, OnInit} from '@angular/core';
import { TISService} from '../service/tis.service';
import {BasicEditComponent} from '../corecfg/basic.edit.component';
// import {ScriptService} from '../service/script.service';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AppFormComponent, BasicFormComponent, CurrentCollection} from '../common/basic.form.component';
import {ActivatedRoute} from '@angular/router';

@Component({
  // templateUrl: '/runtime/operation_log_special_app.htm'
  template: `
    <fieldset [disabled]='formDisabled'>
      <div class="modal-header">
        <h4 class="modal-title">版本切换历史</h4>
        <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss('Cross click')">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
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
      </div>
    </fieldset>
  `
})
export class SnapshotChangeLogComponent extends AppFormComponent {
  logs: any[] = [];

  constructor(tisService: TISService, public activeModal: NgbActiveModal, route: ActivatedRoute, modalService: NgbModal) {
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
