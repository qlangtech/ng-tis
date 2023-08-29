import {
    AfterContentInit,
    Component,
    ComponentFactoryResolver, ComponentRef, Input,
    OnDestroy, Type,
    ViewChild,
    ViewContainerRef
} from "@angular/core";
import {BasicFormComponent} from "./basic.form.component";
import {ActivatedRoute} from "@angular/router";
import {TISService} from "./tis.service";
import {NzModalService} from "ng-zorro-antd/modal";
import {DataTypeMeta, ReaderColMeta, TabletView} from "./tis.plugin";


@Component({
    selector: "db-schema-editor",
    template: `
        <tis-page [rows]="colsMeta" [tabSize]="'small'" [bordered]="true" [showPagination]="false">
            <page-header>
                <button  [disabled]="!view!.isContainDBLatestMcols" nz-button nzSize="small" nz-tooltip
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
            <tis-col title="Type">
                <ng-template let-u='r'>
                    <nz-space>
                        <nz-select *nzSpaceItem nzShowSearch class="type-select" [disabled]="u.disable" [(ngModel)]="u.type.type"
                                   nzPlaceHolder="请选择" (ngModelChange)="typeChange(u.type)">
                            <nz-option [nzValue]="tp.type.type" [nzLabel]="tp.type.typeName"
                                       *ngFor="let tp of this.typeMetas"></nz-option>
                        </nz-select>
                        <ng-container
                                *ngTemplateOutlet="assistType;context:{typemeta:this.typeMap.get(u.type.type)}">
                        </ng-container>
                        <ng-template #assistType let-typemeta="typemeta">
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

    constructor(private route: ActivatedRoute, tisService: TISService, modalService: NzModalService) {
        super(tisService, modalService);
    }

    syncTabSchema() {
        this.colsMeta = this.view.synchronizeMcols();
        // console.log(this.view);
        //
        // for(this.view.mcols){
        //
        // }
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


}

interface DataTypeDesc {
    "columnSize": number,
    "decimalDigits": number,
    //"s": "12,32,",
    "type": number,
    //"typeDesc": "varchar(32)",
    "typeName": string,
    // "unsigned": false,
    // "unsignedToken": ""
}
