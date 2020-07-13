import {Component, Input, OnInit, ViewChild, ViewContainerRef} from "@angular/core";
import {TISService} from "../service/tis.service";

import {NgbActiveModal, NgbModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";
import {SchemaXmlEditComponent} from "../corecfg/schema-xml-edit.component";
// import {SolrCfgEditComponent} from "../corecfg/solrcfg.edit.component";
import {CompareEachOtherComponent} from "../corecfg/compare.eachother.component";
import {BasicFormComponent, CurrentCollection} from "../common/basic.form.component";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {Location} from "@angular/common";

declare var jQuery: any;

/// <reference path="./ty" />

@Component({
  selector: 'snapshot-list',
  template: `
      <div id="msgbox"></div>
      <tis-page-header [showBreadcrumb]="false">
          <button nz-button nzType="primary" (click)="doselectrevsion()">
              <i class="fa fa-exchange" aria-hidden="true"></i>切换版本
          </button>
      </tis-page-header>
      <form method="post" id="contentform" action="/runtime/jarcontent/snapshotset.htm">

          <input type="hidden" name="appname" value=""/>
          <input type="hidden" name="groupid" value=""/>
          <input type="hidden" name="action" value="snapshot_revsion_action"/>
          <input type="hidden" name="event_submit_do_select_revsion" value="y"/>
          <nz-table id="snapshottable" #dataList width="100%" [nzData]="snapshotList">
              <thead>
              <tr>
                  <th width="100px">版本</th>
                  <th width="80px">选择</th>
                  <th width="50px">
                      <button id="btnCompare" nz-button nzType="link" nzSize="large" (click)="twoSnapshotCompare()"><i nz-icon nzType="diff" nzTheme="outline"></i></button>
                  </th>
                  <th width="200px">时间</th>
                  <th width="200px">日志</th>
                  <th>详细</th>
                  <th>parent</th>
              </tr>
              </thead>
              <tbody id="snapshottablebody">
              <tr *ngFor=" let s of dataList.data" [class.checked]="isSelectedSnapshot(s.snId)" (mouseenter)="rowMouseEnter(s)">
                  <td align="right" class="snapshotid">
                      <i *ngIf="isSelectedSnapshot(s.snId)" style="font-weight:900; font-size: x-large ; color:green;" nz-icon nzType="check" nzTheme="outline"></i> <span>{{s.snId}}</span></td>
                  <td align="center">
                      <input type="radio" name="currVer" [(ngModel)]="sSnapshotid"
                             [value]="s.snId"/>
                  </td>
                  <td align="center">
                      <input class="compare" type="checkbox"
                             [checked]="s.compareChecked" (click)="compareClick(s)"
                             name="comparesnapshotid" value="{{s.snId}}"/>
                  </td>

                  <td> {{s.createTime | dateformat}}</td>
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
          <div id="memobox"></div>
      </form>
  `,
  styles: [`
      .checked {
          border: 4px solid blue;
          background-color: pink;
      } `]
})
// 索引配置文件
export class SnapshotsetComponent extends BasicFormComponent implements OnInit {

  @ViewChild('snapshotListContainer', {static: false}) snapshotListContainer: ViewContainerRef;
  snapshotList: any[] = [];
  private currCompareCheckedOrder = 0;
  // 页面中form表单使用的snapshotid
  private selSnapshotid: number;
  public publishSnapshotid: number;

  constructor(tisService: TISService
    , modalService: NgbModal, private router: Router, private route: ActivatedRoute
    , private location: Location) {
    super(tisService, modalService);
  }


  public set sSnapshotid(val: string) {
    this.selSnapshotid = +(val);
  }

  public get sSnapshotid(): string {
    return '' + this.selSnapshotid;
  }

  ngOnInit() {

    this.route.params
      .subscribe((params: Params) => {
        this.currentApp = new CurrentCollection(0, params['name']);
        this.httpPost('/runtime/jarcontent/snapshotset.ajax'
          , 'action=snapshot_revsion_action&event_submit_do_get_snapshot_list=y')
          .then(result => this.processSnapshotList(result));

      });

  }

  // 切换版本
  public doselectrevsion(): void {

    let modalRef: NgbModalRef = this.openNormalDialog(SnapshotchangeDialogComponent); // this.modalService.open()
    modalRef.componentInstance.selectedSnapshotid = this.selSnapshotid;
    modalRef.result.then((snid: number) => {
      if (snid === this.selSnapshotid) {
        this.publishSnapshotid = snid;
      }
    }, () => {
// regected
    });
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

  // 比较两个snapshot版本差异
  twoSnapshotCompare(): void {

    let checkedSnapshot: any[] = this.snapshotList.filter(s => s.compareChecked);
    if (checkedSnapshot.length > 2) {
      // 异常情况
      return;
    }
    if (checkedSnapshot.length < 2) {
      // 异常情况
      return;
    }
    let compareSnapshotId: number[] = [];
    checkedSnapshot.forEach(s => compareSnapshotId.push(s.snId));

    let modalRef: NgbModalRef
      = // this.modalService.open(CompareEachOtherComponent, {windowClass: 'schema-edit-modal'});
      this.openNormalDialog(CompareEachOtherComponent);

    modalRef.componentInstance.compareSnapshotId = compareSnapshotId;
  }


  private processSnapshotList(result: any) {

    this.snapshotList = result.bizresult.snapshotList
    this.selSnapshotid = result.bizresult.snapshotid;

    // 这个Snapshotid 只有在执行了选择新Snapshot生效才会变化
    this.publishSnapshotid = this.selSnapshotid;


    // console.info(this.snapshotList);
  }

  isSelectedSnapshot(snid: number): boolean {
    return this.publishSnapshotid === snid;
  }


  // 打开Schema编辑页面
  public openSchemaDialog(snapshotId: number, editable: boolean): void {
    let modalRef: NgbModalRef = // this.modalService.open(SchemaEditComponent, {windowClass: 'schema-edit-modal'});
      this.openLargeDialog(SchemaXmlEditComponent);
    modalRef.componentInstance.snapshotid = snapshotId;


  }

  // 返回
  public goback(): void {
    this.router.navigate(['../'], {relativeTo: this.route});
    // this.location.back();
  }

  // 打开solr编辑页面
  // public openSolrConfigDialog(snapshotId: number, editable: boolean): void {
  //   let modalRef: NgbModalRef = // this.modalService.open(
  //      // SolrCfgEditComponent, {windowClass: 'schema-edit-modal'});
  //   this.openLargeDialog(SolrCfgEditComponent);
  //   modalRef.componentInstance.snapshotid = snapshotId;
  // }


  rowMouseEnter(s: any) {
    // console.log(s);
  }
}

@Component({
  // templateUrl: '/runtime/jarcontent/snapshotchange.htm'
  template: `
      <fieldset [disabled]='formDisabled'>
          <div class="modal-header">
              <h4 class="modal-title">提交：切换版本理由是什么？</h4>
              <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss('Cross click')">
                  <span aria-hidden="true">&times;</span>
              </button>
          </div>
          <div class="modal-body">
              <tis-msg [result]="result"></tis-msg>
              <form #changeVersionForm>
                  <input type="hidden" name="appname" value=""/>
                  <input type="hidden" name="action" value="snapshot_revsion_action"/>
                  <input type="hidden" name="event_submit_do_select_revsion" value="y"/>
                  <input type="hidden" name="selectedSnapshotid" value="{{selectedSnapshotid}}"/>
                  <textarea class='form-control' name="memo"></textarea>
              </form>
          </div>
          <div class="modal-footer" >
              <button nz-button  nzType="primary"   (click)="doselectrevsion(changeVersionForm)">切换&并推送到引擎</button>
              <button nz-button (click)="doPushConfig2Engine()">推送到引擎</button>
          </div>
      </fieldset>
  `
})
// 切换版本对话框
export class SnapshotchangeDialogComponent extends BasicFormComponent {
  @Input() public selectedSnapshotid: number;

  constructor(tisService: TISService, public activeModal: NgbActiveModal, modalService: NgbModal) {
    super(tisService, modalService);
  }

  public doPushConfig2Engine(): void {


    this.httpPost('/coredefine/corenodemanage.ajax', 'action=core_action&emethod=update_schema_all_server&needReload=false')
    .then(result => {
      this.processResult(result);
      if (result.success) {
        setTimeout(() => {
          this.activeModal.close(this.selectedSnapshotid);
        }, 2000);
      }
    });
  }

  // 提交form文档
  public doselectrevsion(form: any): void {


    this.httpPost('/runtime/jarcontent/snapshotset.ajax'
      , jQuery(form).serialize()).then(result => {
      this.processResult(result);
      if (result.success) {
        setTimeout(() => {
          this.activeModal.close(this.selectedSnapshotid);
        }, 2000);
      }
    });
  }

}
