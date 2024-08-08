import {AfterContentInit, Component, Input, OnDestroy} from "@angular/core";
import {BasicTuplesViewComponent} from "./basic.tuples.view.component";
import {
  DataTypeMeta,
  ErrorFeedback,
  ItemPropVal,
  KEY_DOC_FIELD_SPLIT_METAS,
  ReaderColMeta,
  RowAssist,
  SynchronizeMcolsResult,
  TuplesPropertyType
} from "../tis.plugin";
import {TISService} from "../tis.service";
import {NzModalService} from "ng-zorro-antd/modal";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {TuplesProperty} from "../plugin/type.utils";
import {NextObserver} from "rxjs";

const KEY_COLUMN_SIZE = "columnSize";
const KEY_DECIMAL_DIGITS = "decimalDigits";
const KEY_FEEDBAKC = "Feedback";

export class MongoColsTabletView implements NextObserver<any>, TuplesProperty {
  viewType(): TuplesPropertyType {
    return TuplesPropertyType.MongoCols;
  }

  /**
   *
   * @param _elementKeys ReaderColMeta 中包含哪些keys
   * @param _dbLatestMcols
   * @param _mcols
   * @param _typeMetas
   */
  constructor(private _elementKeys: Array<string>, private _dbLatestMcols: Array<ReaderColMeta>, private _mcols: Array<ReaderColMeta>, private _typeMetas: Array<DataTypeMeta>) {
    if (!_mcols) {
      throw new Error("param _mcols can not be null");
    }
    let index = 0;
    // console.log(this._mcols);
    // console.log(this._dbLatestMcols);
    this._mcols.forEach((c: ReaderColMeta) => {
      c.index = ++index;
      c.ip = new ItemPropVal();
      // @ts-ignore
      c.extraProps = c.extraProps | {}

      RowAssist.setDocFieldSplitMetas(c
        , RowAssist.getDocFieldSplitMetas(c).map((r) => new RowAssist(r.name, r.jsonPath, r.type)));
    });

    // 删除字段测试
    // let tmp = [];
    // this._dbLatestMcols.forEach((cm) => {
    //     if (cm.name !== "member_price") {
    //         tmp.push(cm);
    //     }
    // });
    // this._dbLatestMcols = tmp;
    if (_dbLatestMcols) {
      index = 0;
      this._dbLatestMcols.forEach((c) => {
        c.index = ++index;
        c.ip = new ItemPropVal();
        // @ts-ignore
        c.extraProps = c.extraProps | {}
        RowAssist.setDocFieldSplitMetas(c
          , RowAssist.getDocFieldSplitMetas(c).map((r) => new RowAssist(r.name, r.jsonPath, r.type)));
      });
    }

  }

  next(errorContent: any): void {
    // console.log(errorContent);
  }


  public get isContainDBLatestMcols(): boolean {
    return !!this._dbLatestMcols;
  }

  public get mcols(): Array<ReaderColMeta> {
    return this._mcols;
  }

  /**
   * 数据库中可能添加了新的字段，或者已经删除了某列
   */
  public synchronizeMcols(): SynchronizeMcolsResult {
    // return this._mcols;
    let syncResult: SynchronizeMcolsResult;

    if (this._dbLatestMcols) {
     // console.log(this._dbLatestMcols);
      let result = [];
      syncResult = new SynchronizeMcolsResult(result);
      let lastestCol: ReaderColMeta;
      let col: ReaderColMeta;
      let idxCol = 0;
      outter: for (let i = 0; i < this._dbLatestMcols.length; i++) {
        lastestCol = this._dbLatestMcols[i];
        if (idxCol < this._mcols.length) {
          col = this._mcols[idxCol];
          if (lastestCol.name === col.name) {
            col.index = i + 1;
            result.push(col);
            idxCol++;
          } else {
            let find = -1;
            if ((find = this.findRemain(lastestCol, idxCol + 1)) < 0) {
              // 说明 lastestCol 是数据库中新增的
              syncResult.newAddCols.push(<string>lastestCol.name);
            } else {
              // 说明 col 已经在数据库中被删除了，那应该跳过了
              syncResult.deletedCols.push(<string>col.name);
              idxCol = find;
              lastestCol = this._mcols[idxCol++];
            }
            lastestCol.index = i + 1;
            result.push(lastestCol);
            // 需要遍历需要的所有
          }
          continue outter;
        }else {
          lastestCol.index = i + 1;
          syncResult.newAddCols.push(<string>lastestCol.name);
          result.push(lastestCol);
        }
      }
      delete this._dbLatestMcols
      // 需要将最新引用设置上，不然表单提交时无法将最新的表单内容提交到服务端
      //console.log(result);
      this._mcols = result;
      return syncResult;
    } else {
      return new SynchronizeMcolsResult(this._mcols);
    }
  }


  private findRemain(target: ReaderColMeta, startIdxCol: number): number {
    let find = -1;
    for (let idx = startIdxCol; idx < this._mcols.length; idx++) {
      if (target.name === this._mcols[idx].name) {
        return (find = idx);
      }
    }

    return find;
  }

  public get typeMetas(): Array<DataTypeMeta> {
    return this._typeMetas;
  }

  elementContainKey(testElementKey: string): boolean {
    return this._elementKeys.indexOf(testElementKey) > -1;
  }
}

@Component({
  selector: "db-schema-editor",
  template: `

    <tis-page [rows]="_colsMeta" [tabSize]="'small'" [bordered]="true" [showPagination]="false">
      <page-row-assist>
        <ng-template let-u='r'>
          <p class="row-assist">
            <!--class: RowAssist-->
            <tis-page [rows]="u?.docFieldSplitMetas" [tabSize]="'small'" [bordered]="true"
                      [showPagination]="false">
              <page-header>
                <button nz-button nzSize="small" (click)="addMongoDocumentSplitter(u)">
                                    <span nz-icon
                                          nzType="plus"
                                          nzTheme="outline"></span>添加
                </button>
              </page-header>
              <tis-col title="新字段">
                <ng-template let-uu='r'>
                  <nz-form-item>
                    <nz-form-control [nzValidateStatus]="uu.getIp('name').validateStatus"
                                     [nzHasFeedback]="uu.getIp('name').hasFeedback"
                                     [nzErrorTip]="uu.getIp('name').error">
                      <input nz-input [(ngModel)]="uu.name" [disabled]="uu.disable"/>
                    </nz-form-control>
                  </nz-form-item>
                </ng-template>
              </tis-col>
              <tis-col title="Json路径">
                <ng-template let-uu='r'>
                  <nz-form-item>
                    <nz-form-control [nzValidateStatus]="uu.getIp('jsonPath').validateStatus"
                                     [nzHasFeedback]="uu.getIp('jsonPath').hasFeedback"
                                     [nzErrorTip]="uu.getIp('jsonPath').error">
                      <input nz-input [(ngModel)]="uu.jsonPath" [disabled]="uu.disable"/>
                    </nz-form-control>
                  </nz-form-item>
                </ng-template>
              </tis-col>
              <tis-col title="Jdbc类型">
                <ng-template let-uu='r'>
                  <!--                  <ng-container *ngTemplateOutlet="jdbcTypeTemplate;context:{u:uu}"></ng-container>-->
                  <jdbc-type [type]="uu.type" [typeMetas]="this.typeMetas" [disable]="uu.disable"></jdbc-type>
                </ng-template>
              </tis-col>

              <tis-col title="操作">
                <ng-template let-uu='r'>
                  <button nz-button nzSize="small" nzType="link"
                          (click)="deleteDocFieldSplitRow(uu,u)">删除
                  </button>
                </ng-template>
              </tis-col>
            </tis-page>

          </p>
        </ng-template>
      </page-row-assist>
      <page-header>
        <button [disabled]="!view!.isContainDBLatestMcols" nz-button nzSize="small" nz-tooltip
                nzTooltipTitle="数据表中可能添加了新的字段，或者删除了某列，将以下Schema定义与数据库最新Schema进行同步"
                (click)="syncTabSchema()" nzType="primary"><span nz-icon nzType="reload"
                                                                 nzTheme="outline"></span>sync
        </button>

      </page-header>
      <tis-col title="Index" width="15">
        <ng-template let-u='r'>
          <nz-form-control>
            {{u.index}}
            <nz-switch nzSize="small"
                       [(ngModel)]="u.disable"
                       [nzCheckedChildren]="checkedTemplate"
                       [nzUnCheckedChildren]="unCheckedTemplate"
            ></nz-switch>
            <ng-template #checkedTemplate><span nz-icon nzType="close"></span></ng-template>
            <ng-template #unCheckedTemplate><span nz-icon nzType="check"></span></ng-template>

          </nz-form-control>
        </ng-template>
      </tis-col>
      <tis-col title="Name" width="40">
        <ng-template let-u='r'>
          <nz-form-item>

            <nz-form-control [nzValidateStatus]="u.ip.validateStatus"
                             [nzHasFeedback]="u.ip.hasFeedback"
                             [nzErrorTip]="u.ip.error">
              <ng-container [ngSwitch]="nameEditDisable">
                <ng-container *ngSwitchCase="true">
                                    <span nz-input
                                          [ngClass]="{'text-delete':u.disable,'ant-input':true}"> {{u.name}}</span>
                </ng-container>
                <ng-container *ngSwitchCase="false">
                  <input nz-input [(ngModel)]="u.name" [disabled]="u.disable"/>
                </ng-container>
              </ng-container>
            </nz-form-control>
          </nz-form-item>
        </ng-template>
      </tis-col>
      <tis-col *ngIf="view.elementContainKey('mongoFieldType')" title="Mongo Type">
        <ng-template let-u='r'>
          {{ u.mongoFieldType}}
          <nz-switch *ngIf="u.mongoDocType" nzSize="small" [(ngModel)]="u.openAssist"
          ></nz-switch>
        </ng-template>
      </tis-col>
      <tis-col title="Type">
        <ng-template let-u='r'>
          <!--          <ng-container *ngTemplateOutlet="jdbcTypeTemplate;context:{u:u}"></ng-container>-->
          <jdbc-type [type]="u.type" [typeMetas]="this.typeMetas" [disable]="u.disable"></jdbc-type>
        </ng-template>
      </tis-col>
      <tis-col title="主键" *ngIf="!pkSetDisable">
        <ng-template let-u='r'>
          <nz-switch [disabled]="u.type.disabled"
                     [(ngModel)]="u.pk"
                     [nzCheckedChildren]="checkedTemplate"
                     [nzUnCheckedChildren]="unCheckedTemplate"
          ></nz-switch>
          <ng-template #checkedTemplate><span nz-icon nzType="check"></span></ng-template>
          <ng-template #unCheckedTemplate><span nz-icon nzType="close"></span></ng-template>
        </ng-template>
      </tis-col>
    </tis-page>

  `
  , styles: [
    `
      .row-assist {
        margin: 8px 0px 8px 0px;
      }

      .type-select {
        min-width: 14em;
      }

      .text-delete {
        text-decoration: line-through;
      }

      nz-form-item {
        margin: 0px;
      }
    `
  ]
})
export class SchemaEditComponent extends BasicTuplesViewComponent implements AfterContentInit, OnDestroy {

  @Input()
  dbLatestColsMeta: Array<ReaderColMeta> = [];

  // @Input()
  // colsMeta: Array<ReaderColMeta> = [];
  // @Input()
  // typeMetas: Array<DataTypeMeta> = [];

  @Input()
  pkSetDisable = false;

  _colsMeta: Array<ReaderColMeta> = [];
  @Input()
  set colsMeta(colsMeta: Array<ReaderColMeta>) {
    this._colsMeta = colsMeta;
  }

  @Input()
  public set tabletView(view: TuplesProperty) {
    super.tabletView = view;
  }

  get view(): MongoColsTabletView {
    return <MongoColsTabletView>this._view;
  }

  @Input()
  set error(errors: Array<any>) {
    if (!Array.isArray(errors)) {
      return;
    }
    // KEY_DOC_FIELD_SPLIT_METAS
    let err: { name: string, };

    for (let idx = 0; idx < errors.length; idx++) {
      let colMeta: ReaderColMeta = this.colsMeta[idx];
      if (!colMeta) {
        continue;
      }
      err = errors[idx];
      for (let key in err) {
        switch (key) {
          case "name":
            colMeta.ip.error = err[key];
            break;
          case KEY_COLUMN_SIZE:
          case KEY_DECIMAL_DIGITS:
            colMeta.type[key + KEY_FEEDBAKC] = new ErrorFeedback(err[key]);
            break;
          case KEY_DOC_FIELD_SPLIT_METAS:
            let splitMetasErrors: Array<any> = err[key];
            //        console.log(splitMetasErrors);
            let metaErr = null;
            let splitMetas: Array<RowAssist> = RowAssist.getDocFieldSplitMetas(colMeta);
            let ra: RowAssist = null;
            for (let idxMeta = 0; idxMeta < splitMetasErrors.length; idxMeta++) {
              ra = splitMetas[idxMeta];
              metaErr = splitMetasErrors[idxMeta];
              for (let errKey in metaErr) {
                switch (errKey) {
                  case KEY_COLUMN_SIZE:
                  case KEY_DECIMAL_DIGITS:
                    ra.type[errKey + KEY_FEEDBAKC] = new ErrorFeedback(metaErr[errKey]);
                    break;
                  default:
                    ra.getIp(errKey).error = metaErr[errKey];
                }
                // console.log([ra,idxMeta]);
              }
            }

            break;
          default:
            throw new Error("error key:" + key);
        }
      }

    }
  }

  @Input()
  nameEditDisable = false;

  constructor(tisService: TISService, modalService: NzModalService, notification: NzNotificationService) {
    super(tisService, modalService, notification);
  }

  syncTabSchema() {
    let syncResult = this.view.synchronizeMcols();
    this.colsMeta = syncResult.syncCols;

    if (syncResult.hasAnyDiff) {
      this.successNotify(syncResult.differSummary);
    } else {
      this.warnNotify("与数据库最新表结构没有区别");
    }
  }

  ngAfterContentInit() {

  }

  ngOnDestroy() {

  }


  addMongoDocumentSplitter(u: ReaderColMeta) {

    let rowAssist: Array<RowAssist> = RowAssist.getDocFieldSplitMetas(u);//.docFieldSplitMetas;

    if (!this.typeMetas) {
      throw new Error("typeMetas can not be null");
    }
    rowAssist.push(new RowAssist("", '', this.typeMetas.get(-1).type))
//        u.docFieldSplitMetas = [...rowAssist];

    RowAssist.setDocFieldSplitMetas(u, rowAssist);
  }


  deleteDocFieldSplitRow(mongoDocSplit: RowAssist, colMeta: ReaderColMeta) {
    let rowAssist: Array<RowAssist> = (<any>colMeta).docFieldSplitMetas
    if (!rowAssist) {
      throw new Error("rowAssist can not be null");
    }
    const index = rowAssist.indexOf(mongoDocSplit);

    if (index > -1) {
      rowAssist.splice(index, 1);
      //   (<any>colMeta).docFieldSplitMetas = [...rowAssist];
      RowAssist.setDocFieldSplitMetas(colMeta, rowAssist)
    }
  }
}
