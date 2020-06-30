import {TISService} from '../service/tis.service';
import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {BasicFormComponent} from '../common/basic.form.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Pager} from '../common/pagination.component';


// 全局配置文件
@Component({
  template: `
      <form>
          <tis-page-header title="索引实例">
              <tis-header-tool>
                  <button nz-button nzType="primary" (click)="gotAddIndex()"><i class="fa fa-plus" aria-hidden="true"></i>添加</button>
              </tis-header-tool>
          </tis-page-header>
          <tis-page [rows]="pageList" [pager]="pager" [spinning]="formDisabled" (go-page)="gotoPage($event)">
              <tis-col title="索引名称" width="14">
                  <ng-template let-app='r'>
                      <a [routerLink]="['/c',app.projectName]">{{app.projectName}}</a>
                  </ng-template>
              </tis-col>
              <tis-col title="接口人" width="14" field="recept"></tis-col>
              <tis-col title="归属部门" field="dptName">
                  <ng-template let-app='r'>
   <span style="color:#999999;" [ngSwitch]="app.dptName !== null">
   <i *ngSwitchCase="true">{{app.dptName}}</i>
   <i *ngSwitchDefault>未设置</i></span>
                  </ng-template>
              </tis-col>
              <tis-col title="创建时间" width="20">
                  <ng-template let-app='r'> {{app.createTime | dateformat}}</ng-template>
              </tis-col>

              <tis-col title="操作">
                  <ng-template let-app='r'>
                      <a href="javascript:void(0)"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></a>
                  </ng-template>
              </tis-col>
          </tis-page>
      </form>
  `
})
export class ApplistComponent extends BasicFormComponent implements OnInit {

  // allrowCount: number;
  pager: Pager = new Pager(1, 1);
  pageList: any[];

  constructor(tisService: TISService, private router: Router, modalService: NgbModal
  ) {
    // this.tisService.setAppSelectable(true);
    super(tisService, modalService);
  }


  ngOnInit(): void {
    this.gotoPage(1);
  }

  public gotoPage(p: number) {
    this.httpPost('/runtime/applist.ajax'
      , 'emethod=get_apps&action=app_view_action&page=' + p)
      .then((r) => {
        if (r.success) {
          this.pager = new Pager(r.bizresult.curPage, r.bizresult.totalPage, r.bizresult.totalCount, r.bizresult.pageSize);
          this.pageList = r.bizresult.rows;
        }
      });
  }


  // 跳转到索引维护页面
  public gotoAppManage(app: { appId: number }): void {

    this.httpPost('/runtime/changedomain.ajax'
      , 'event_submit_do_change_app_ajax=y&action=change_domain_action&selappid=' + app.appId)
      .then(result => {
        this.router.navigate(['/corenodemanage']);
      });

  }

  public gotAddIndex(): void {
    this.router.navigate(['/base/appadd']);
  }
}
