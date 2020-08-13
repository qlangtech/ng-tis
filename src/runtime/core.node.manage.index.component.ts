import {Component, OnInit, ViewChild} from '@angular/core';
import {TISService} from '../service/tis.service';
import {RouterOutlet, ActivatedRoute, Params, Router} from '@angular/router';
import 'rxjs/add/operator/switchMap';
import {BasicFormComponent, CurrentCollection} from '../common/basic.form.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {NzModalService} from "ng-zorro-antd";


@Component({
  template: `
      <my-navigate [core]="app"></my-navigate>
      <nz-layout class="main-layout">
          <nz-sider [nzWidth]="150" [nzTheme]="'light'">
              <ul nz-menu nzMode="inline" >
                  <li nz-menu-item>
                      <a  routerLink="./">
                          <i class="fa fa-tachometer fa-2x" aria-hidden="true"></i>主控台</a>
                  </li>
                  <li nz-menu-item >
                      <a  routerLink="./query">
                          <i class="fa fa-search fa-2x" aria-hidden="true"></i>查询</a>
                  </li>
                  <li nz-menu-item >
                      <a  routerLink="./snapshotset"><i class="fa fa-history fa-2x" aria-hidden="true"></i>配置变更</a>
                  </li>

                  <li nz-menu-item >
                      <a  routerLink="./plugin"><i class="fa fa-plug fa-2x" aria-hidden="true"></i>插件配置</a>
                  </li>

                  <li nz-menu-item >
                      <a  routerLink="./incr_build">
                          <i aria-hidden="true" class="fa fa-truck fa-2x"></i>实时通道</a>
                  </li>

                  <li nz-menu-item >
                      <a  (click)="gotoFullbuildView()"><i aria-hidden="true" class="fa fa-cog fa-2x"></i>全量构建</a>
                  </li>
                  <li nz-menu-item >
                      <a  routerLink="./monitor"><i class="fa fa-bar-chart fa-2x" aria-hidden="true"></i>监控</a>
                  </li>

                  <li nz-menu-item >
                      <a  routerLink="./membership"><i class="fa fa-users fa-2x" aria-hidden="true"></i>权限</a>
                  </li>

                  <li nz-menu-item >
                      <a  routerLink="./operationlog"><i class="fa fa-pencil fa-2x" aria-hidden="true"></i>操作历史</a>
                  </li>
              </ul>
          </nz-sider>
          <nz-content>
              <router-outlet></router-outlet>
          </nz-content>
      </nz-layout>
      <ng-template #zeroTrigger>
          <i nz-icon nzType="menu-fold" nzTheme="outline"></i>
      </ng-template>

  `,
  styles: [`
      a:link {
          color: black;
      }

      a:visited {
          color: black;
      }

      a:hover {
          color: #0275d8;
      }

      .main-layout {
          height: 92vh;
      }

      nz-content {
          margin: 0 20px 0 10px;
      }
  `]
})
export class CorenodemanageIndexComponent extends BasicFormComponent implements OnInit {
  app: CurrentCollection = new CurrentCollection(0, '');


  constructor(tisService: TISService, private router: Router, private route: ActivatedRoute, modalService: NzModalService) {
    super(tisService, modalService);
  }

  ngOnInit(): void {
    this.route.params
      .subscribe((params: Params) => {
        this.app = new CurrentCollection(0, params['name']);
        this.currentApp = this.app;
      });
   // this.router.isActive()
    // this.route.
  }

// 控制页面上的 业务线选择是否要显示
  // get appSelectable(): boolean {
  //  // return this.tisService.isAppSelectable();
  // }


  gotoFullbuildView() {
    let url = `/offline/datasource.ajax`;
    this.httpPost(url, 'action=offline_datasource_action&event_submit_do_get_workflowId=y').then((r) => {
      this.router.navigate(['./build_history', r.bizresult.workflowId], {relativeTo: this.route});
    });
  }
}
