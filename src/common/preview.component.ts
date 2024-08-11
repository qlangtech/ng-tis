import {AppFormComponent, CurrentCollection} from "./basic.form.component";
import {TISService} from "./tis.service";
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from "@angular/core";
import {getTableMapper, ITableAlias} from "./plugin/type.utils";
import {ActivatedRoute} from "@angular/router";
import {NzModalService} from "ng-zorro-antd/modal";
import {NzNotificationService} from "ng-zorro-antd/notification";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template #previewHeaderTpl>
      <div>
        <nz-radio-group [(ngModel)]="_targetTable" (ngModelChange)="targetTabChange($event)" nzButtonStyle="solid"
                        nzSize="small">
          <label nz-radio-button [nzValue]="tab.from" *ngFor="let tab of this.selectableTabs"><span nz-icon
                                                                                                    nzType="table"
                                                                                                    nzTheme="outline"></span>{{tab.from}}
          </label>
        </nz-radio-group>

        <div class="pager-controler">
          <nz-button-group nzSize="small">
            <nz-input-group nzSize="small" nzPrefix="Page Size:">
              <nz-select style="width: 4em;text-align: right" nzSize="small"
                         [ngModelOptions]="{standalone: true}"
                         [(ngModel)]="_pageSize">
                <nz-option nzLabel="15" [nzValue]="15"></nz-option>
                <nz-option nzLabel="30" [nzValue]="30"></nz-option>
                <nz-option nzLabel="90" [nzValue]="90"></nz-option>
              </nz-select>
            </nz-input-group>

            <button nz-button nzType="default"
                    [disabled]=" !this._targetTable || !(!this.headerCursor && !this.tailerCursor)"
                    (click)="targetTabChange(this._targetTable)">
              <span nz-icon nzType="redo"></span>
              reset
            </button>
            <button nz-button nzType="default" [disabled]="!this.headerCursor" (click)="preiousPage()">
              <span nz-icon nzType="left"></span>
              上一页
            </button>
            <button nz-button nzType="default" [disabled]="!this.tailerCursor" (click)="nextPage()">
              下一页
              <span nz-icon nzType="right"></span>
            </button>

          </nz-button-group>
        </div>
      </div>
    </ng-template>
    <nz-table  [nzLoading]="this.formDisabled" #fixedTable [nzData]="listOfData" [nzTitle]="previewHeaderTpl"
              [nzBordered]="true" nzTableLayout="auto"  [nzScroll]="{x:'100vw',y: this.drawerHeight+ 'px'}"
              [nzSize]="'small'" [nzShowPagination]="false" [nzFrontPagination]="false">
      <thead>
      <tr>
        <th [nzWidth]="col.key.length+'em'" *ngFor="let col of rowHeader">{{col.key}}</th>
      </tr>
      </thead>
      <tbody>
      <tr *ngFor="let row of fixedTable.data">
        <td nzEllipsis *ngFor="let col of rowHeader let idx = index">
          <ng-container [ngSwitch]="row[idx] !== null">
            <span *ngSwitchCase="true" nz-tooltip [nzTooltipTitle]="col.blob ? null :row[idx]">
              {{ col.blob ? '<' + 'blob' + '>' : row[idx] }}
            </span>
            <span *ngSwitchCase="false" class="null-val">
            {{'<' + 'null' + '>'}}
           </span>
          </ng-container>


        </td>
      </tr>
      </tbody>
    </nz-table>

  `
  , styles: [
    ` .null-val {
      color: #cccccc;
    }

    .pager-controler {
      float: right;
    }`
  ]
})
export class PreviewComponent extends AppFormComponent implements OnInit {

  listOfData: Array<Array<any>> = [];
  rowHeader: Array<ColHeader> = [];
  _targetTable: string;
  _pageSize: number = 15;

  /**
   *  "headerCursor":[
   *    {
   * 			"val":"100822153628746930757481343300ae",
   * 			"numeric":false,
   * 			"key":"order_id"
   * 		}
   *  ],
   */
  headerCursor: Array<OffsetVal>;
  tailerCursor: Array<OffsetVal>;


  selectableTabs: Array<ITableAlias> = []
  drawerHeight: number;

  constructor(tisService: TISService, route: ActivatedRoute, modalService: NzModalService
    , notification: NzNotificationService, private cd: ChangeDetectorRef //, private drawerRef: NzDrawerRef<{  }>
  ) {
    super(tisService, route, modalService, notification);
  }

  ngOnInit(): void {
    // console.log([window.self.innerHeight,this.drawerRef.nzHeight]);
    this.drawerHeight = window.self.innerHeight * 0.7;
    getTableMapper(this, this.tisService.currentApp.appName)
      .then((result) => {
        // console.log(result);
        this.selectableTabs = [...result];
      }).finally(() => {
      //this._pageSize = 10;
      this.cd.detectChanges();
    });
  }

  targetTabChange(targetTable: string) {
    this.getTablePreview(targetTable, null);
  }

  private getTablePreview(targetTable: string, pagePointer: PagePointer) {
    let url = '/coredefine/corenodemanage.ajax?' //
      + 'action=datax_action&emethod=preview_table_rows&table=' + targetTable + "&pageSize=" + this._pageSize;
    this.jsonPost(url, pagePointer)
      .then((r) => {
        if (r.success) {
          let biz = r.bizresult;
          this.listOfData = biz.rows;
          this.rowHeader = <Array<ColHeader>>biz.header;

          this.tailerCursor = <Array<OffsetVal>>biz.tailerCursor;
          this.headerCursor = <Array<OffsetVal>>biz.headerCursor;

        }
      }, () => {
        this.formDisabled = false;
      }).finally(() => {
      this.cd.detectChanges();
    });
  }

  protected initialize(app: CurrentCollection): void {
  }

  preiousPage() {
    // let last: Array<any> = this.listOfData[0];
    // let lastRow = {};
    // for (let idx = 0; idx < this.rowHeader.length; idx++) {
    //   lastRow[this.rowHeader[idx]] = last[idx];
    // }
    // console.log(lastRow);
    this.getTablePreview(this._targetTable, {nextPage: false, offsetPointer: this.headerCursor});
  }

  nextPage() {
    //let last: Array<any> = this.listOfData[this.listOfData.length - 1];
    // let lastRow = {};
    // for (let idx = 0; idx < this.rowHeader.length; idx++) {
    //   lastRow[this.rowHeader[idx]] = last[idx];
    // }
    // console.log(lastRow);
    this.getTablePreview(this._targetTable, {nextPage: true, offsetPointer: this.tailerCursor});
  }
}

type PagePointer = {
  nextPage: boolean;
  offsetPointer: Array<OffsetVal>;
}

type ColHeader = {
  blob: boolean;
  key: string;

}

type OffsetVal = {
  val: string;
  numeric: boolean
  key: string;
}
