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
import {Component, OnInit} from '@angular/core';
import {BasicFormComponent} from '../common/basic.form.component';

import {Pager} from "../common/pagination.component";
import {NzModalRef, NzModalService, NzNotificationService} from "ng-zorro-antd";
import {DepartmentAddComponent} from "./department.add.component";


// 部门管理
@Component({
  // templateUrl: '/runtime/bizdomainlist.htm'
  template: `
      <tis-page-header title="业务线" >
          <button nz-button nzType="primary" (click)="openAddDptDialog()"><i class="fa fa-plus" aria-hidden="true"></i>添加</button>
      </tis-page-header>
      <tis-page [rows]="bizline" [spinning]="this.formDisabled">
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
                  {{rr.gmtCreate|date : "yyyy/MM/dd HH:mm:ss"}}
              </ng-template>
          </tis-col>

          <tis-col title="操作">
              <ng-template let-dpt='r'>
                  <button nz-button nz-dropdown nzShape="circle" [nzDropdownMenu]="menu"
                          nzPlacement="bottomLeft"><i nz-icon nzType="more" nzTheme="outline"></i></button>
                  <nz-dropdown-menu #menu="nzDropdownMenu">
                      <ul nz-menu>
                          <li nz-menu-item (click)="editDpt(dpt)"><i nz-icon nzType="edit" nzTheme="outline"></i>更新</li>
                          <li nz-menu-item (click)="deleteDpt(dpt)"><i nz-icon nzType="delete" nzTheme="outline"></i>删除</li>
                      </ul>
                  </nz-dropdown-menu>
              </ng-template>
          </tis-col>
      </tis-page>
  `
})
export class DepartmentListComponent extends BasicFormComponent implements OnInit {
  bizline: any[] = [];

  // pager: Pager = new Pager();

  constructor(tisService: TISService, modalService: NzModalService, notification: NzNotificationService) {
    super(tisService, modalService, notification);
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

  openAddDptDialog() {
    let ref: NzModalRef<DepartmentAddComponent> = this.openDialog(DepartmentAddComponent, {nzTitle: "添加部门"})
    ref.afterClose.subscribe((r) => {
      if (r) {
        this.bizline = [r].concat(this.bizline);
      }
    });
  }

  editDpt(dpt) {
    let ref: NzModalRef<DepartmentAddComponent> = this.openDialog(DepartmentAddComponent, {nzTitle: "更新部门"})
    ref.getContentComponent().model = dpt;
    ref.afterClose.subscribe((r) => {
      Object.assign(dpt, r);
    });
  }

  deleteDpt(dpt) {

    this.modalService.confirm({
      nzTitle: '删除',
      nzContent: `是否要删除部门'${dpt.fullName}'`,
      nzOkText: '执行',
      nzCancelText: '取消',
      nzOnOk: () => {
        this.httpPost('/runtime/addapp.ajax'
          , "action=department_action&emethod=deleteDepartment&dptid=" + dpt.dptId)
          .then((r) => {
            this.processResult(r);
            if (r.success) {
              this.successNotify(`已经成功删除部门${dpt.fullName}`);
              let indexOf = this.bizline.indexOf(dpt);
              if (indexOf > -1) {
                this.bizline.splice(indexOf, 1);
              }
              //  this.router.navigate(["."], {relativeTo: this.route});
            }
          });
      }
    });
  }
}
