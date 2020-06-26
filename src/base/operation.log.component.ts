import {Component, OnInit} from '@angular/core';
import {TISService} from '../service/tis.service';
import {BasicFormComponent} from '../common/basic.form.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

// 查看操作日志
@Component({
  template: `
    <tis-page-header>操作日志</tis-page-header>
    <div class="container">
      <div class="row">
        <div [class.col-8]="showDetail" [class.col-12]="!showDetail">
          <tis-page [rows]="logs">
            <tis-col title="用户名" width="14" field="usrName"></tis-col>
            <tis-col title="操作对象" width="30" field="tabName"></tis-col>
            <tis-col title="创建时间">
              <ng-template let-l='r'>{{l.createTime | dateformat}}</ng-template>
            </tis-col>
            <tis-col title="操作">
              <ng-template let-l='r'>
                <a href="javascript:void(0)" class="btn btn-secondary btn-sm" (click)="operationDetail(l.opId)">详细</a>
              </ng-template>
            </tis-col>
          </tis-page>
        </div>
        <div *ngIf="showDetail" class="col-4 alert alert-info" style="height:600px;overflow:auto;">
          <button type="button" class="close" (click)="closeDetail()" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
<pre>
  {{detail}}
</pre>
        </div>
      </div>
    </div>

    <div>
    </div>

  `
})
export class OperationLogComponent extends BasicFormComponent implements OnInit {
  logs: any[] = [];
  private detailLog: string;

  constructor(tisService: TISService, modalService: NgbModal) {
    super(tisService, modalService);
  }


  ngOnInit(): void {
    this.httpPost('/runtime/operation_log.ajax'
      , 'action=operation_log_action&emethod=get_init_data')
      .then((r) => {
        if (r.success) {
          this.logs = r.bizresult;
        }
      });
  }

  public get showDetail(): boolean {
    return this.detail != null;
  }


  // 显示详细信息
  public operationDetail(opId: number): void {
    this.httpPost(
      '/runtime/operation_detail.ajax?action=operation_log_action&event_submit_do_get_detail=y&opid=' + opId, '')
      .then(result => this.detailLog = result.msg[0]);
  }

  public closeDetail(): void {
    this.detailLog = null;
  }

  public get detail(): string {
    return this.detailLog;
  }

}
