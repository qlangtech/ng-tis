import {Component} from "@angular/core";
import {TISService} from "../service/tis.service";
import {NgbModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";
import {TriggerDumpComponent} from "./trigger_dump.component";
// import {SolrCfgEditComponent} from "../corecfg/solrcfg.edit.component";
import {SchemaXmlEditComponent} from "../corecfg/schema-xml-edit.component";
import {PojoComponent} from "./pojo.component";
import {SyncConfigComponent} from "./sync.cfg.component";
import {CopyOtherCoreComponent} from "./copy.other.core.component";
import {SnapshotChangeLogComponent} from "./snapshot.change.log";
import {ActivatedRoute, Router} from "@angular/router";
import {AppFormComponent, CurrentCollection} from "../common/basic.form.component";

// 这个类专门负责router
@Component({
  template: `
      <ul class="nav">
          <li class="nav-item">
              <a class="nav-link" routerLink="./query">查询</a>
          </li>
          <li class="nav-item dropdown">
          </li>
          <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" data-toggle="dropdown"
                 href="#" role="button" aria-haspopup="true" aria-expanded="false"> 增量启停</a>
              <div class="dropdown-menu">
                  <a class="dropdown-item" href="#" onclick="return incrResumePause(true)">暂停</a>
                  <a class="dropdown-item" href="#" onclick="return incrResumePause(false)">启动</a>
              </div>
          </li>
          <li class="nav-item">
              <a class="nav-link" href="javascript:void(0)" (click)=" openTriggerFullDumpDialog()">触发全量Dump</a>
          </li>
          <li class="nav-item">
              <a class="nav-link" href="javascript:void(0)" (click)="openPojoDialog()">POJO</a>
          </li>

          <li class="nav-item">
              <a class="nav-link" href="javascript:void(0)" (click)="openCopyOtherIndexDialog()">从其他索引拷贝配置</a>
          </li>
          <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true"
                 aria-expanded="false">
                  索引构建 <span class="caret"></span>
              </a>
              <ul class="dropdown-menu">

                  <a class="dropdown-item" target="_blank"
                     href="/trigger/buildindexmonitor.htm?serviceName=">查看索引Build结果</a>
                  <li role="separator" class="divider"></li>
                  <li>
                      <a href='#'>全量构建日志</a>
                  </li>
                  <li>
                      <a href='#'>增量统计日志</a>
                  </li>
                  <li>
                      <a href='#'>增量实时日志</a>
                  </li>
              </ul>
          </li>
      </ul>
      <div class="container-fluid">
          <div class="row">
              <div class="col-12">
                  <tis-msg [result]="result"></tis-msg>
                  <div *ngIf="config">
                      <div class="note3" style="margin-top:0">
                          <div class="alert alert-warning" role="alert" *ngIf="!config.currentSnapshotEqual2Neweast">
                              <strong>注意:</strong>此配置版本不是最新版本 <a routerLink="./snapshotset" class="alert-link">切换</a>
                          </div>
                          当前版本<a routerLink="./snapshotset">更改</a>
                          <strong>Ver:</strong>{{config.publishSnapshotId}}<a href="#" title="{{config.snapshot.createUserName}}">
                          <img src="/runtime/imgs/note.jpg" border="0"></a>

                          <a href='javascript:void(0)'
                             (click)="openSchemaDialog(  config.publishSnapshotId  ,true)">[schema.xml]</a>&nbsp;
                          <a href='javascript:void(0)'
                             (click)="openSolrConfigDialog(config.publishSnapshotId ,true)">[solr.xml]</a>


                          <a style="font-size:8px" href="#" onclick="check_synchronize()">同步?</a>
                          <div class="btn-group btn-group-sm" role="group">
                              <button id="btnGroupDrop1" type="button"
                                      class="btn btn-secondary dropdown-toggle"
                                      data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                  <i class="fa fa-cog" aria-hidden="true"></i>引擎配置更新
                              </button>
                              <div class="dropdown-menu" aria-labelledby="btnGroupDrop1">
                                  <a class="dropdown-item" href="javascript:void(0)" (click)="pushConfigAndEffect()">同步&生效</a>
                                  <a class="dropdown-item" href="javascript:void(0)" (click)="pushConfig()">仅同步</a>
                              </div>
                          </div>
                          <button type="button" class="btn btn-secondary btn-sm" (click)="openSnapshotVerChangeLog()">
                              <i class="fa fa-history" aria-hidden="true"></i>变更历史
                          </button>
                          <button type="button" class="btn btn-secondary btn-sm" (click)="openSyncConfigDialog()">
                              <i class="fa fa-cloud-upload" aria-hidden="true"></i> 配置同步到线上
                          </button>

                      </div>

                  </div>

                  <br/>
                  <div class="card w-75 " *ngIf="instanceDirDesc">
                      <div class="card-block">
                          <h4 class="card-title">副本目录信息</h4>
                          <p class="card-text">{{instanceDirDesc.desc}}</p>
                      </div>
                  </div>
                  <br/>
                  <div class="card w-75 " *ngIf="instanceDirDesc">
                      <div class="card-block">
                          <h4 class="card-title">
                              <i class="fa fa-cogs" aria-hidden="true"></i>索引构建</h4>
                          <div class="card-text">
                              <button nz-button nz-dropdown [nzDropdownMenu]="menu4">
                                  全量<i nz-icon nzType="down"></i>
                              </button>
                              <nz-dropdown-menu #menu4="nzDropdownMenu">
                                  <ul nz-menu>
                                      <li nz-menu-item (click)="triggerFullBuild()">立即触发</li>
                                      <li nz-menu-item>自动触发设置</li>
                                      <li nz-menu-item (click)="gotoFullBuildHistory()">构建历史</li>
                                  </ul>
                              </nz-dropdown-menu>
                              <div class="btn-group">
                                  <button type="button" class="btn btn-secondary dropdown-toggle"
                                          data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                      全量
                                  </button>
                                  <div class="dropdown-menu">
                                      <a class="dropdown-item" href="javascript:void(0)" (click)="triggerFullBuild()">立即触发</a>
                                      <a class="dropdown-item" href="#">自动触发设置</a>
                                      <a class="dropdown-item" routerLink="./full_build_history">构建历史</a>
                                  </div>
                              </div>
                              <div class="btn-group">
                                  <button type="button" class="btn btn-secondary dropdown-toggle"
                                          data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                      增量
                                  </button>
                                  <div class="dropdown-menu">
                                      <a class="dropdown-item" href="#">启停控制</a>
                                      <a class="dropdown-item" href="#">执行状态</a>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  `
})
export class CorenodemanageComponent extends AppFormComponent {
// http://localhost:8080/coredefine/corenodemanage.ajax?action=core_action&emethod=get_view_data
  app: any;
  config: any;
  instanceDirDesc: any;

  constructor(tisService: TISService, modalService: NgbModal
    , route: ActivatedRoute, private router: Router) {
    super(tisService, route, modalService);
  }

  protected initialize(app: CurrentCollection): void {
    this.httpPost('/coredefine/corenodemanage.ajax', 'action=core_action&emethod=get_view_data')
      .then((r) => {
        if (r.success) {
          this.app = r.bizresult.app;
          this.config = r.bizresult.config;
          this.instanceDirDesc = r.bizresult.instanceDirDesc;
          this.paintToplog(null, r.bizresult.topology);
        }
      });
  }

  private paintToplog(g: any, data: any): void {

  }

  public jsonString(v: any): string {
    return JSON.stringify(v);
  }

  // 立刻触发全量索引构建
  public triggerFullBuild(): void {

    this.httpPost('/coredefine/corenodemanage.ajax'
      , 'event_submit_do_trigger_fullbuild_task=y&action=core_action')
      .then((d) => {
        if (d.success) {
          if (d.bizresult) {
            let msg: any = [];
            msg.push({
              'content': '全量索引构建已经触发'
              , 'link': {'content': '状态日志', 'href': './buildprogress/' + d.bizresult.taskid}
            });

            this.processResult({success: true, 'msg': msg});
          } else {
            alert("重复触发了");
          }
        } else {
          this.processResult(d);
        }
      });


    // let msg: any = [];
    // msg.push({
    //   'content': '全量索引构建已经触发'
    //   , 'link': {'content': '查看构建状态', 'href': './buildprogress/' + 123}
    // });
    //
    // this.processResultWithTimeout({'success': true, 'msg': msg}, 10000);


  }


// 打开模态对话框
  public openModal(): void {

  }

  // 配置同步到线上
  public openSyncConfigDialog(): void {
    // this.modalService.open(SyncConfigComponent, {size: 'lg'});
    this.openLargeDialog(SyncConfigComponent);
  }

  // 变更历史
  public openSnapshotVerChangeLog(): void {
    // this.modalService.open(SnapshotChangeLogComponent, {windowClass: 'schema-edit-modal'});
    this.openNormalDialog(SnapshotChangeLogComponent);
  }

  // 从其他索引拷贝索引配置
  public openCopyOtherIndexDialog(): void {
    // this.modalService.open(CopyOtherCoreComponent, {size: 'lg'});
    this.openLargeDialog(CopyOtherCoreComponent);
  }

  public openTriggerFullDumpDialog(): void {
    // 打开触发全量构建对话框
    //   const modalRef = this.modalService.open(TriggerDumpComponent);
    this.openNormalDialog(TriggerDumpComponent);

  }

  // 打开Schema编辑页面
  public openSchemaDialog(snapshotId: number, editable: boolean): void {
    var modalRef: NgbModalRef =
      this.openLargeDialog(SchemaXmlEditComponent);
    modalRef.componentInstance.snapshotid = snapshotId;

  }

  // 打开Pojo编辑页面
  public openPojoDialog(): void {
    // var modalRef: NgbModalRef = this.modalService.open(PojoComponent, {windowClass: 'schema-edit-modal'});

    this.openNormalDialog(PojoComponent);

  }


  public pushConfigAndEffect(): void {

    this.httpPost('/coredefine/corenodemanage.ajax'
      , 'action=core_action&needReload=true&emethod=update_schema_all_server').then((r) => {
      this.processResult(r);
    });
  }

  public pushConfig(): void {
    this.httpPost('/coredefine/corenodemanage.ajax'
      , 'action=core_action&needReload=false&emethod=update_schema_all_server').then((r) => {
      this.processResult(r);
    });
  }

  // 打开solr编辑页面
  public openSolrConfigDialog(snapshotId: number, editable: boolean): void {
    // let modalRef: NgbModalRef
    //   =  // this.modalService.open(SolrCfgEditComponent, {windowClass: 'schema-edit-modal'});
    // this.openNormalDialog(SolrCfgEditComponent);
    // modalRef.componentInstance.snapshotid = snapshotId;
  }

  public openGlobalParametersDialog() {


  }

  // closeResult: string;
  //
  // public opendialog(content: any): void {
  //
  //   this.modalService.open(content).result.then((result) => {
  //     this.closeResult = `Closed with: ${result}`;
  //   }, (reason) => {
  //     this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
  //   });
  //   console.info("haha");
  // }
  //
  // private getDismissReason(reason: any): string {
  //   if (reason === ModalDismissReasons.ESC) {
  //     return 'by pressing ESC';
  //   } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
  //     return 'by clicking on a backdrop';
  //   } else {
  //     return `with: ${reason}`;
  //   }
  // }
  gotoFullBuildHistory() {
    // <a class="dropdown-item" routerLink="./full_build_history"></a>
    this.router.navigate(["/offline/wf/build_history/45"]);
  }
}
