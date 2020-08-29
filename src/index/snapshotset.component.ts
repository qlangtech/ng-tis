import {Component, Input, OnInit, ViewChild, ViewContainerRef} from "@angular/core";
import {TISService} from "../service/tis.service";

import {NgbActiveModal, NgbModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";
import {SchemaXmlEditComponent} from "../corecfg/schema-xml-edit.component";
// import {SolrCfgEditComponent} from "../corecfg/solrcfg.edit.component";
import {CompareEachOtherComponent} from "../corecfg/compare.eachother.component";
import {BasicFormComponent, CurrentCollection} from "../common/basic.form.component";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {Location} from "@angular/common";
import {NzModalRef, NzModalService, NzNotificationService} from "ng-zorro-antd";
import {Pager} from "../common/pagination.component";

declare var jQuery: any;

/// <reference path="./ty" />

@Component({
  selector: 'snapshot-list',
  template: `
      <tis-page-header [showBreadcrumb]="showBreadcrumb" [title]="'索引配置模版'">
      </tis-page-header>
      <form method="post" id="contentform" action="/runtime/jarcontent/snapshotset.htm">

          <input type="hidden" name="appname" value=""/>
          <input type="hidden" name="groupid" value=""/>
          <input type="hidden" name="action" value="snapshot_revsion_action"/>
          <input type="hidden" name="event_submit_do_select_revsion" value="y"/>
          <nz-table id="snapshottable" #dataList width="100%" [nzData]="snapshotList" [(nzPageIndex)]="pager.page"
                    (nzPageIndexChange)="searchData()"
                    [nzFrontPagination]="false" [nzTotal]="pager.totalCount" [nzPageSize]="pager.pageSize">
              <thead>
              <tr>
                  <th width="100px">版本</th>
                  <th width="200px">时间</th>
                  <th width="100px">
                      区别比较
                  </th>
                  <th width="20%">日志</th>
                  <th>详细</th>
                  <th>parent</th>
              </tr>
              </thead>
              <tbody id="snapshottablebody">
              <tr *ngFor=" let s of dataList.data" [class.checked]="isSelectedSnapshot(s.snId)" (mouseenter)="rowMouseEnter(s, true)" (mouseleave)="rowMouseEnter(s, false)">
                  <td align="right" class="snapshotid">
                      <i *ngIf="isSelectedSnapshot(s.snId)" style="font-weight:900; font-size: x-large ; color:green;" nz-icon nzType="check" nzTheme="outline"></i>
                      <span>{{s.snId}}</span>
                      <div *ngIf="this.mouseEnteredSnapshot && this.mouseEnteredSnapshot.snId === s.snId" class="control-bar">
                          <button nz-button nzType="primary" (click)="openSelectrevsion(s)">
                              <i nz-icon nzType="select" nzTheme="outline"></i>切换版本
                          </button> &nbsp;
                          <button id="btnCompare" nz-button nzType="default" *ngIf="canSnapshotCompare" (click)="twoSnapshotCompare()"><i nz-icon nzType="diff" nzTheme="outline"></i>比较</button> &nbsp;
                          <button nz-button (click)="doPushConfig2Engine()" *ngIf="!this.showBreadcrumb && isSelectedSnapshot(s.snId)" [nzLoading]="this.formDisabled"><i nz-icon nzType="cloud-upload" nzTheme="outline"></i> 推送到引擎</button>
                      </div>
                  </td>
                  <td> {{s.createTime | dateformat}}</td>
                  <td align="center">
                      <input class="compare" type="checkbox"
                             [checked]="s.compareChecked" (click)="compareClick(s)"
                             name="comparesnapshotid" value="{{s.snId}}"/>
                  </td>
                  <td>
                      <nz-tag [nzColor]="'blue'">{{s.createUserName}}</nz-tag>
                      {{s.memo}}</td>
                  <td>
                      <snapshot-linker [snapshot]="s"></snapshot-linker>
                  </td>
                  <td>{{s.preSnId}}</td>
              </tr>

              </tbody>
          </nz-table>
      </form>

      <nz-modal
              [(nzVisible)]="openSelectrevsionVisible"
              [nzTitle]="'提交：切换版本理由是什么？'"
              [nzContent]="modalContent"
              [nzFooter]="modalFooter"
              (nzOnCancel)="this.openSelectrevsionVisible = false"
      >
          <ng-template #modalContent>
              <tis-msg [result]="result"></tis-msg>
              <textarea nz-input name="memo" [(ngModel)]="snapshotChangeMemo" [nzAutosize]="{ minRows: 3, maxRows: 5 }"></textarea>
          </ng-template>
          <ng-template #modalFooter>
              <button nz-button nzType="primary" *ngIf="this.showBreadcrumb" (click)="doselectrevsion(targetSnapshot,true)">保存</button>
              <button nz-button nzType="primary" *ngIf="!this.showBreadcrumb" (click)="doselectrevsion(targetSnapshot)" [nzLoading]="this.formDisabled">切换&并推送到引擎</button>
          </ng-template>
      </nz-modal>
  `,
  styles: [`
      .control-bar {
          position: absolute;
          top: 0px;
          left: 0px;
          display: inline-block;
          width: 400px;
          text-align: left;
      }

      .snapshotid {
          position: relative;
      }

      .checked {
          border: 4px solid blue;
          background-color: pink;
      } `]
})
// 索引配置文件
export class SnapshotsetComponent extends BasicFormComponent implements OnInit {
  pager: Pager = new Pager(1, 1);
  showBreadcrumb: boolean;
  @ViewChild('snapshotListContainer', {static: false}) snapshotListContainer: ViewContainerRef;
  snapshotList: any[] = [];
  private currCompareCheckedOrder = 0;
  // 页面中form表单使用的snapshotid
  // private selSnapshotid: number;
  public publishSnapshotid: number;
  openSelectrevsionVisible = false;
  snapshotChangeMemo: string;
  mouseEnteredSnapshot: any;
  targetSnapshot: { snId: number };

  constructor(tisService: TISService
    , modalService: NzModalService, private router: Router, private route: ActivatedRoute
    , notification: NzNotificationService) {
    super(tisService, modalService, notification);
  }

  ngOnInit() {
    this.showBreadcrumb = this.showBreadCrumb(this.route);

    let sn = this.route.snapshot;
    if (!!sn.data['template']) {
      this.currentApp = new CurrentCollection(0, "search4template");
    } else {
      this.currentApp = new CurrentCollection(0, sn.params['name']);
    }

    this.route.queryParams.subscribe((param) => {
      let page = param["page"];
      this.httpPost('/runtime/jarcontent/snapshotset.ajax'
        , `action=snapshot_revsion_action&event_submit_do_get_snapshot_list=y&page=${page}`)
        .then(result => this.processSnapshotList(result));
    });

  }

  // 切换版本
  public openSelectrevsion(snapshot: any): void {
    this.targetSnapshot = snapshot;
    this.openSelectrevsionVisible = true;
  }


  // 点击下一个checkbox触发
  public compareClick(ss: any): void {
    let checkedSnapshot: any[] = this.snapshotList.filter(s => s.compareChecked);
    let maxOrder = 0;
    if (checkedSnapshot.length > 1) {
      checkedSnapshot.forEach(s => {
        if (s.compareCheckedOrder > maxOrder) {
          maxOrder = s.compareCheckedOrder;
        }
      });
      checkedSnapshot.forEach(s => {
        if (s.compareCheckedOrder !== maxOrder) {
          s.compareChecked = false;
        }
      });
    }
    ss.compareChecked = true;
    ss.compareCheckedOrder = this.currCompareCheckedOrder++;
  }

  get canSnapshotCompare(): boolean {
    let checkedSnapshot: any[] = this.snapshotList.filter(s => s.compareChecked);
    return checkedSnapshot.length === 2;
  }

  // 比较两个snapshot版本差异
  twoSnapshotCompare(): void {

    let checkedSnapshot: any[] = this.snapshotList.filter(s => s.compareChecked);
    if (checkedSnapshot.length > 2) {
      // 异常情况
      return;
    }
    if (checkedSnapshot.length < 2) {
      // 异常情况
      this.notification.error("错误", "请选择两个版本进行比较", {nzDuration: 5000});
      return;
    }
    let compareSnapshotId: number[] = [];
    checkedSnapshot.forEach(s => compareSnapshotId.push(s.snId));
    let modalRef: NzModalRef = this.modalService.create({
      nzWidth: "70%",
      nzContent: CompareEachOtherComponent,
      nzFooter: null,
    });
    // let cpt = modalRef.getInstance().getContentComponentRef().instance;
    // cpt.compareSnapshotId = compareSnapshotId;
    modalRef.afterOpen.subscribe(() => {
      modalRef.getContentComponent().compareSnapshotId = compareSnapshotId;
    })
  }


  private processSnapshotList(result: any) {

    this.pager = Pager.create(result);
    this.snapshotList = result.bizresult.rows;
    // 这个Snapshotid 只有在执行了选择新Snapshot生效才会变化
    let payload = result.bizresult.payload;
    if (payload && payload.length > 0) {
      this.publishSnapshotid = payload[0];
    }
    // console.info(this.snapshotList);
  }

  isSelectedSnapshot(snid: number): boolean {
    return this.publishSnapshotid === snid;
  }

  // 返回
  public goback(): void {
    this.router.navigate(['../'], {relativeTo: this.route});
    // this.location.back();
  }


  public doPushConfig2Engine(): void {


    this.httpPost('/coredefine/corenodemanage.ajax', 'action=core_action&emethod=update_schema_all_server&needReload=false')
      .then(result => {
        this.processResult(result);
        if (result.success) {
          setTimeout(() => {
            // this.activeModal.close(this.selectedSnapshotid);
            this.openSelectrevsionVisible = false;
          }, 2000);
        }
      });
  }

  // 提交form文档
  public doselectrevsion(mouseEnteredSnapshot: any, justSave?: boolean): void {
    if (!mouseEnteredSnapshot || !mouseEnteredSnapshot.snId) {
      throw new Error(`mouseEnteredSnapshot can not be null`);
    }
    this.httpPost('/runtime/jarcontent/snapshotset.ajax'
      , "action=snapshot_revsion_action&event_submit_do_select_revsion=y&selectedSnapshotid="
      + mouseEnteredSnapshot.snId + "&memo=" + this.snapshotChangeMemo + "&justSave=" + justSave
    ).then(result => {
      this.processResult(result);
      if (result.success) {
        this.publishSnapshotid = mouseEnteredSnapshot.snId;
        setTimeout(() => {
          this.openSelectrevsionVisible = false;
        }, 2000);
      }
    });
  }


  rowMouseEnter(s: any, enter: boolean) {
    // console.log(`enter:${enter}`);
    if (enter) {
      this.mouseEnteredSnapshot = s;
    } else {
      this.mouseEnteredSnapshot = null;
    }
  }


  searchData() {
    Pager.go(this.router, this.route, this.pager.page);
  }
}
