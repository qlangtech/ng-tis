import {AfterContentInit, ChangeDetectionStrategy, Component, Input, OnDestroy} from "@angular/core";
import {BasicTuplesViewComponent} from "./basic.tuples.view.component";
import {DataTypeDesc, DataTypeMeta, ItemPropVal, ReaderColMeta, TuplesPropertyType, Item, CMeta} from "../tis.plugin";
import {TuplesProperty} from "../plugin/type.utils";



@Component({
    selector: "table-join-match-condition",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div>
            <nz-space>
                <button *nzSpaceItem nz-button nzSize="small" nz-tooltip
                        nzTooltipTitle="添加一条新的拥有类型的新字段"
                        nzType="primary" (click)="addMatchCondition()"><span nz-icon nzType="appstore-add"
                                                                             nzTheme="outline"></span>添加
                </button>
            </nz-space>
        </div>
        <ul class="match-condition-list">
            <li *ngFor="let u of matchConditionList; let i = index" class="match-condition-item">
                <div class="form-row">
                    <nz-form-item class="form-item-inline">
                        <nz-form-control [nzValidateStatus]="u.primaryTableCol.ip.validateStatus"
                                         [nzHasFeedback]="u.primaryTableCol.ip.hasFeedback"
                                         [nzErrorTip]="u.primaryTableCol.ip.error">
                            <nz-select nzShowSearch nzAllowClear
                                       nzPlaceHolder="Select a Column"
                                       [(ngModel)]="u.primaryTableCol.name"
                                       (ngModelChange)="targetColChange(u,$event)">
                                <nz-option nzLabel="请选择" [nzValue]="''"></nz-option>
                                <nz-option [nzLabel]="col.name" [nzValue]="col.name"
                                           *ngFor="let col of this.primaryTableCols"></nz-option>
                            </nz-select>
                        </nz-form-control>
                    </nz-form-item>

                    <div class="equal-text"> <strong>is equal to</strong></div>

                    <nz-form-item class="form-item-inline">
                        <nz-form-control [nzValidateStatus]="u.dimensionTableCol.ip.validateStatus"
                                         [nzHasFeedback]="u.dimensionTableCol.ip.hasFeedback"
                                         [nzErrorTip]="u.dimensionTableCol.ip.error">
                            <nz-select nzShowSearch nzAllowClear
                                       nzPlaceHolder="Select a Column"
                                       [(ngModel)]="u.dimensionTableCol.name"
                                       (ngModelChange)="targetColChange(u,$event)">
                                <nz-option nzLabel="请选择" [nzValue]="''"></nz-option>
                                <nz-option [nzLabel]="col.name" [nzValue]="col.name"
                                           *ngFor="let col of this.dimensionTableCols"></nz-option>
                            </nz-select>
                        </nz-form-control>
                    </nz-form-item>

                    <button nz-button nzDanger nzSize="small" nz-tooltip
                            nzTooltipTitle="删除此条件"
                            nzType="default" class="delete-btn"
                            (click)="removeMatchCondition(i)">
                        <span nz-icon nzType="delete" nzTheme="outline"></span>
                    </button>
                </div>
            </li>
        </ul>
    `
    , styles: [
        `
            .match-condition-list {
                list-style: none;
                padding: 0;
                margin: 16px 0 0 0;
            }

            .match-condition-item {
                margin-bottom: 12px;
            }

            .form-row {
                display: flex;
                align-items: flex-start;
                gap: 12px;
            }

            .form-item-inline {
                margin-bottom: 0;
                flex-shrink: 0;
            }

            .form-item-inline nz-select {
                display: inline-block;
                width: 200px;
                min-width: 180px;
                max-width: 300px;
            }

            .equal-text {
                padding: 4px 8px;
                display: flex;
                align-items: center;
                height: 32px;
                color: rgba(0, 0, 0, 0.45);
                white-space: nowrap;
            }

            .delete-btn {
                margin-left: auto;
                flex-shrink: 0;
            }
        `
    ]
})
export class TableJoinMatchConditionComponent extends BasicTuplesViewComponent implements AfterContentInit, OnDestroy {

    /**
     * 条件集合
     */
    matchConditionList: Array<MatchCondition> = [];

    set colsMeta(colsMeta: Array<ReaderColMeta>) {
        // this.matchConditionList = colsMeta as Array<MatchField>;
    }

    @Input()
    public set tabletView(view: TuplesProperty) {
        // console.log(view);
        this.colsMeta = view.mcols;
        // this.typeMetas = BasicTuplesViewComponent.type2Map(view.typeMetas);
        let v = view as MatchConditionList;
        this._view = v;
        this.matchConditionList = v._matchConditionList;

        // console.log([ this.typeMetas, view.typeMetas]);
        //
    }

    get primaryTableCols(): Array<CMeta> {
        return (this._view as MatchConditionList).primaryTableCols;
    }

    get dimensionTableCols(): Array<CMeta> {
        return (this._view as MatchConditionList).dimensionTableCols;
    }

    ngAfterContentInit(): void {
    }

    addMatchCondition() {
        let primaryTableCol = new MatchField();
        primaryTableCol.ip = new ItemPropVal();
        let dimensionTableCol = new MatchField();
        dimensionTableCol.ip = new ItemPropVal();
        let matchCondition = new MatchCondition(primaryTableCol, dimensionTableCol);
        this.matchConditionList.push(matchCondition);
    }

    removeMatchCondition(index: number) {
        if (index < 0 || index >= this.matchConditionList.length) {
            return;
        }
        this.matchConditionList.splice(index, 1);
    }

    targetColChange(u: MatchCondition, $event: any) {

    }
}

export class MatchCondition {
    private _primaryTableCol: MatchField;
    private _dimensionTableCol: MatchField;

    constructor(primaryTableCol: MatchField, dimensionTableCol: MatchField) {
        this._primaryTableCol = primaryTableCol;
        this._dimensionTableCol = dimensionTableCol;
    }

    get primaryTableCol(): MatchField {
        return this._primaryTableCol;
    }

    get dimensionTableCol(): MatchField {
        return this._dimensionTableCol;
    }
}

export class MatchField implements ReaderColMeta {

    disable: boolean;
    index: number;
    ip: ItemPropVal;
    name: Item | string;
    openAssist: boolean;
    type: string | DataTypeDesc;
    /**
     * target column relevant, server side plugin: com.qlangtech.tis.plugin.datax.transformer.TargetColumn
     */
    // target: Item;
    // targetError: string;
    // targetDescLiteria: Array<UdfDesc>;
}

/**
 * 对应的表和表join的关联的多条关联关系
 */
export class MatchConditionList implements TuplesProperty {

    _matchConditionList: Array<MatchCondition> = [];


    /**
     *
     * @param _primaryTableCols 主表可选列
     * @param _dimensionTableCols 维表列
     */
    constructor(private _primaryTableCols: Array<CMeta>, private _dimensionTableCols: Array<CMeta>) {
        let primaryTableCol = new MatchField();
        primaryTableCol.ip = new ItemPropVal();
        primaryTableCol.name = null;

        let dimensionTableCol = new MatchField();
        dimensionTableCol.ip = new ItemPropVal();
        let matchCondition = new MatchCondition(primaryTableCol, dimensionTableCol);
        this._matchConditionList.push(matchCondition);
        // this.primaryTableCols.push("a", "b", "c");
        // this.dimensionTableCols.push("b", "c", "d");
    }

    get primaryTableCols(): Array<CMeta> {
        return this._primaryTableCols;
    }

    get dimensionTableCols(): Array<CMeta> {
        return this._dimensionTableCols;
    }

    /**
     * 以下属性没有作用
     */
    typeMetas: Array<DataTypeMeta> = [];
    mcols: Array<MatchField> = [];

    viewType(): TuplesPropertyType {
        return TuplesPropertyType.TableJoinMatchCondition;
    }

}

