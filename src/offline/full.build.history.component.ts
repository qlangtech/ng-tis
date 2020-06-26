import {ChangeDetectorRef, Component, OnInit} from "@angular/core";
import {TISService} from "../service/tis.service";
import {BasicFormComponent} from "../common/basic.form.component";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {Pager} from "../common/pagination.component";
import {ActivatedRoute, Params, Router} from "@angular/router";

// const breadcrumbArry = ['数据流', '/offline/wf', 'totalpay', '/offline/wf_update/totalpay'];

@Component({
  // templateUrl: '/coredefine/full_build_history.htm'
  template: `
      <tis-page-header title="构建历史" [showBreadcrumb]="!tisService.currentApp" [breadcrumb]="breadcrumb" [result]="result" [needRefesh]='true' (refesh)="refesh()">
          <button (click)="triggerFullBuild()" nz-button nzType="primary">触发构建</button> &nbsp;
      </tis-page-header>
      <tis-page [rows]="buildHistory" [pager]="pager" (go-page)="gotoPage($event)">
          <tis-col title="ID" width="10">
              <ng-template let-rr="r">
                  <a [routerLink]="['./', rr.id]">#{{rr.id}}</a>
              </ng-template>
          </tis-col>
          <tis-col title="状态" width="10">
              <ng-template let-rr='r'>
                  <i [ngClass]="rr.stateClass" [ngStyle]="{'color':rr.stateColor}" aria-hidden="true"></i>
                  {{rr.literalState}}
              </ng-template>
          </tis-col>
          <tis-col title="阶段描述" width="24">
              <ng-template let-rr='r'>
                  {{rr.startPhase}}->{{rr.endPhase}}
              </ng-template>
          </tis-col>

          <tis-col title="耗时" width="24">
              <ng-template let-rr='r'>
                  {{rr.consuming}}
              </ng-template>
          </tis-col>
          <tis-col title="触发方式" width="10">
              <ng-template let-rr='r'>{{rr.triggerType}}</ng-template>
          </tis-col>
          <tis-col title="数据流" width="14">
              <ng-template let-rr='r'>union</ng-template>
          </tis-col>
          <tis-col title="操作">
              <ng-template let-app='r'>
                  <a href="javascript:void(0)"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></a>
              </ng-template>
          </tis-col>
      </tis-page>
  `
})
export class FullBuildHistoryComponent extends BasicFormComponent implements OnInit {
  pager: Pager = new Pager(1, 1, 0);
  buildHistory: any[] = [];
  wfid: number;

  breadcrumb: string[];

  // get breadcrumb(): string[] {
  //   return ['数据流', '/offline/wf', 'totalpay', '/offline/wf_update/totalpay'];
  // }

  constructor(tisService: TISService, modalService: NgbModal
    , private router: Router, private route: ActivatedRoute
    , private cd: ChangeDetectorRef
  ) {
    super(tisService, modalService);
    cd.detach();
  }


  ngOnInit(): void {
    this.route.params
      .subscribe((params: Params) => {
        this.wfid = parseInt(params['wfid'], 10);
        this.gotoPage(1);
      });
  }

// 刷新列表
  public refesh():
    void {
    this.ngOnInit();
  }

  public triggerFullBuild(): void {

    let msg: any = [];
    msg.push({
      'content': '全量索引构建已经触发'
      , 'link': {'content': '查看构建状态', 'href': '../buildprogress/' + 123}
    });

    this.processResultWithTimeout({'success': true, 'msg': msg}, 10000);
  }

  public gotoPage(p: number) {
    this.httpPost('/coredefine/full_build_history.ajax'
      , `emethod=get_full_build_history&action=core_action&page=${p}&wfid=${this.wfid}&getwf=${!this.breadcrumb}`).then((r) => {
      if (r.success) {
        if (!this.breadcrumb) {
          let wfname = r.bizresult.payload[0];
          this.breadcrumb = ['数据流', '/offline/wf', wfname, `/offline/wf_update/${wfname}`];
        }
        this.pager = new Pager(r.bizresult.curPage, r.bizresult.totalPage);
        this.buildHistory = r.bizresult.rows;
      }
      this.cd.reattach();
    });
  }
}
