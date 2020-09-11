import {TISService} from '../service/tis.service';
import {Component, OnInit} from '@angular/core';
import {BasicFormComponent} from '../common/basic.form.component';

import {Pager} from "../common/pagination.component";
import {NzModalService} from "ng-zorro-antd";


// 部门管理
@Component({
  // templateUrl: '/runtime/bizdomainlist.htm'
  template: `
      <tis-page-header title="业务线" [needRefesh]='false'>
          <button nz-button nzType="primary"><i class="fa fa-plus" aria-hidden="true"></i>添加</button>
      </tis-page-header>
      <tis-page [rows]="bizline"  [spinning]="this.formDisabled">
          <tis-col title="#" width="5">
              <ng-template let-rr='r'>{{rr.dptId}}</ng-template>
          </tis-col>
          <tis-col title="业务线名称">
              <ng-template let-rr='r'>
                  {{rr.fullName}}
              </ng-template>
          </tis-col>
          <tis-col title="部门名称" width="25">
              <ng-template let-rr='r'>{{rr.name}}</ng-template>
          </tis-col>

          <tis-col title="创建时间" width="24">
              <ng-template let-rr='r'>
                  {{rr.gmtCreate|dateformat}}
              </ng-template>
          </tis-col>

          <tis-col title="操作">
              <ng-template let-app='r'>
                  <a href="javascript:void(0)"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></a>
                  <a href="javascript:void(0)"><i class="fa fa-trash" aria-hidden="true"></i> </a>
              </ng-template>
          </tis-col>
      </tis-page>
  `
})
export class DepartmentListComponent extends BasicFormComponent implements OnInit {
  bizline: any[] = [];
  // pager: Pager = new Pager();

  constructor(tisService: TISService, modalService: NzModalService) {
    super(tisService, modalService);
  }

  ngOnInit(): void {
    this.httpPost('/runtime/bizdomainlist.ajax',
      'action=bizline_action&emethod=bizData')
      .then((r) => {
        if (r.success) {
          this.bizline = r.bizresult;
        }
      });
  }
}
