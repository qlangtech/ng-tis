import {
    AfterContentInit,
    Component,
    ComponentFactoryResolver, ComponentRef, Input,
    OnDestroy, Type,
    ViewChild,
    ViewContainerRef
} from "@angular/core";
import {BasicFormComponent} from "./basic.form.component";
import {TISService} from "./tis.service";
import {NzModalService} from "ng-zorro-antd/modal";
import {DataTypeDesc, DataTypeMeta, ReaderColMeta, TabletView} from "./tis.plugin";
import {NzNotificationService} from "ng-zorro-antd/notification";


@Component({
    selector: "db-schema-editor",
    template: `
        <tis-page [rows]="colsMeta" [tabSize]="'small'" [bordered]="true" [showPagination]="false">
            <page-row-assist>
                <ng-template let-u='r'>
                    <p class="row-assist">
                        <tis-page [rows]="u?.docFieldSplitMetas" [tabSize]="'small'" [bordered]="true"
                                  [showPagination]="false">
                            <page-header>
                                <button nz-button nzSize="small" (click)="addMongoDocumentSplitter(u)"><span nz-icon
                                                                                                             nzType="plus"
                                                                                                             nzTheme="outline"></span>添加
                                </button>
                            </page-header>
                            <tis-col title="新字段">
                                <ng-template let-uu='r'>
                                    <nz-form-item>
<!--                                        [nzValidateStatus]="uu.ip.validateStatus"-->
<!--                                        [nzHasFeedback]="uu.ip.hasFeedback"-->
<!--                                        [nzErrorTip]="uu.ip.error"-->
                                        <nz-form-control >
                                            <input nz-input [(ngModel)]="uu.name" [disabled]="uu.disable"/>
                                        </nz-form-control>
                                    </nz-form-item>
                                </ng-template>
                            </tis-col>
                            <tis-col title="Json路径">

<!--                                [nzValidateStatus]="uu.ip.validateStatus"-->
<!--                                [nzHasFeedback]="uu.ip.hasFeedback"-->
<!--                                [nzErrorTip]="uu.ip.error"-->

                                <ng-template let-uu='r'>
                                    <nz-form-item>
                                        <nz-form-control>
                                            <input nz-input [(ngModel)]="uu.jsonPath" [disabled]="uu.disable"/>
                                        </nz-form-control>
                                    </nz-form-item>
                                </ng-template>
                            </tis-col>
                            <tis-col title="Jdbc类型">
                                <ng-template let-uu='r'>
                                    <ng-container *ngTemplateOutlet="jdbcTypeTemplate;context:{u:uu}"></ng-container>
                                </ng-template>
                            </tis-col>

                            <tis-col title="操作">
                                <ng-template let-uu='r'>
                                    <button nz-button nzSize="small" nzType="link" (click)="deleteDocFieldSplitRow(uu,u)">删除
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
                                    <span [ngClass]="{'text-delete':u.disable}"> {{u.name}}</span>
                                </ng-container>
                                <ng-container *ngSwitchCase="false">
                                    <input nz-input [(ngModel)]="u.name" [disabled]="u.disable"/>
                                </ng-container>
                            </ng-container>
                        </nz-form-control>
                    </nz-form-item>
                </ng-template>
            </tis-col>
            <tis-col title="Mongo Type">
                <ng-template let-u='r'>
                    {{ u.mongoFieldType}}
                    <nz-switch *ngIf="u.mongoDocType" nzSize="small" [(ngModel)]="u.openAssist"
                    ></nz-switch>
                </ng-template>
            </tis-col>
            <tis-col title="Type">
                <ng-template let-u='r'>
                    <ng-container *ngTemplateOutlet="jdbcTypeTemplate;context:{u:u}"></ng-container>
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


        <ng-template #jdbcTypeTemplate let-u='u'>
            <nz-space>
                <nz-select *nzSpaceItem nzShowSearch class="type-select" [disabled]="u.disable"
                           nzDropdownMatchSelectWidth="true" [(ngModel)]="u.type.type"
                           nzPlaceHolder="请选择" (ngModelChange)="typeChange(u.type)">
                    <nz-option [nzValue]="tp.type.type" [nzLabel]="tp.type.typeName"
                               *ngFor="let tp of this.typeMetas"></nz-option>
                </nz-select>

                <ng-container
                        *ngTemplateOutlet="assistType;context:{typemeta:this.typeMap.get(u.type.type),u:u};">
                </ng-container>

                <ng-template #assistType let-typemeta="typemeta" let-u="u">
                    <ng-container *ngIf="typemeta.containColSize">
                        <nz-input-number [disabled]="u.disable" nz-tooltip nzTooltipTitle="Column Size"
                                         *nzSpaceItem
                                         [(ngModel)]="u.type.columnSize"
                                         [nzMin]="typemeta.colsSizeRange.min"
                                         [nzMax]="typemeta.colsSizeRange.max"></nz-input-number>
                    </ng-container>
                    <ng-container *ngIf="typemeta.containDecimalRange">
                        <nz-input-number [disabled]="u.disable" nz-tooltip nzTooltipTitle="Decimal Digits Size"
                                         *nzSpaceItem
                                         [(ngModel)]="u.type.decimalDigits"
                                         [nzMin]="typemeta.decimalRange.min"
                                         [nzMax]="typemeta.decimalRange.max"></nz-input-number>
                    </ng-container>

                </ng-template>
            </nz-space>
        </ng-template>

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
export class SchemaEditComponent extends BasicFormComponent implements AfterContentInit, OnDestroy {

    @Input()
    dbLatestColsMeta: Array<ReaderColMeta> = [];

    @Input()
    colsMeta: Array<ReaderColMeta> = [];
    @Input()
    typeMetas: Array<DataTypeMeta> = [];

    @Input()
    pkSetDisable = false;

    @Input()
    nameEditDisable = false;

    view: TabletView;


    @Input()
    public set tabletView(view: TabletView) {

        this.colsMeta = view.mcols;
        this.typeMetas = view.typeMetas;
        this.view = view;
    }

    private _typeMap: Map<number, DataTypeMeta>
    get typeMap(): Map<number, DataTypeMeta> {
        if (!this._typeMap) {
            if (this.typeMetas.length > 0) {
                this._typeMap = new Map();
                for (let type of this.typeMetas) {
                    this._typeMap.set(type.type.type, type);
                }
            }
        }
        return this._typeMap;
    }

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

    typeChange(type: DataTypeDesc) {
        // console.log(type);

        let meta: DataTypeMeta = this.typeMap.get(type.type)
        if (meta.containColSize) {
            type.columnSize = meta.type.columnSize;
        }
        if (meta.containDecimalRange) {
            type.decimalDigits = meta.type.decimalDigits;
        }
    }


    addMongoDocumentSplitter(u: ReaderColMeta | any) {

        let rowAssist: Array<RowAssist> = u.docFieldSplitMetas;
        if (!rowAssist) {
            rowAssist = [];
        }
        rowAssist.push(new RowAssist("", '', this.typeMap.get(-1).type))
        u.docFieldSplitMetas = [...rowAssist];
    }

    deleteDocFieldSplitRow(mongoDocSplit: RowAssist, colMeta: ReaderColMeta) {
        let rowAssist: Array<RowAssist> = (<any>colMeta).docFieldSplitMetas
        if (!rowAssist) {
            throw new Error("rowAssist can not be null");
        }
        const index = rowAssist.indexOf(mongoDocSplit);

        if (index > -1) {
            rowAssist.splice(index, 1);
            (<any>colMeta).docFieldSplitMetas = [...rowAssist];
        }
    }
}

class RowAssist {
    constructor(public name: string, public jsonPath: string, public type: DataTypeDesc) {
    }
}

// interface DataTypeDesc {
//   "columnSize": number,
//   "decimalDigits": number,
//   //"s": "12,32,",
//   "type": number,
//   //"typeDesc": "varchar(32)",
//   "typeName": string,
//   // "unsigned": false,
//   // "unsignedToken": ""
// }
