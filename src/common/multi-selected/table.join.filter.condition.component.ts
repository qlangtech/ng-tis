import {AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy} from "@angular/core";
import {BasicTuplesViewComponent} from "./basic.tuples.view.component";
import {DataTypeDesc, DataTypeMeta, ItemPropVal, ReaderColMeta, TuplesPropertyType, Item, CMeta} from "../tis.plugin";
import {TuplesProperty} from "../plugin/type.utils";
import {TISService} from "../tis.service";
import {NzModalService} from "ng-zorro-antd/modal";
import {NzNotificationService} from "ng-zorro-antd/notification";

@Component({
    selector: "table-join-filter-condition",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ul class="filter-condition-list">
            <li *ngFor="let u of filterConditionList; let i = index" class="filter-condition-item">
                <div class="form-row">
                    <!-- Table Type Selection -->
                    <nz-form-item class="form-item-inline">

                        <nz-form-control [nzValidateStatus]="u.tableType.ip.validateStatus"
                                         [nzHasFeedback]="u.tableType.ip.hasFeedback"
                                         [nzErrorTip]="u.tableType.ip.error">
                            <nz-select nzShowSearch nzAllowClear
                                       nzPlaceHolder="选择表类型"
                                       [(ngModel)]="u.tableType.name"
                                       (ngModelChange)="tableTypeFieldChange(u,$event)">
                                <nz-option [nzLabel]="opt.label" [nzValue]="opt.val"
                                           *ngFor="let opt of this.tableTypes"></nz-option>
                            </nz-select>
                        </nz-form-control>
                    </nz-form-item>

                    <!-- Column Name Selection -->
                    <nz-form-item class="form-item-inline">
                        <nz-form-control [nzValidateStatus]="u.columnName.ip.validateStatus"
                                         [nzHasFeedback]="u.columnName.ip.hasFeedback"
                                         [nzErrorTip]="u.columnName.ip.error">
                            <nz-select nzShowSearch nzAllowClear
                                       nzPlaceHolder="选择列"
                                       [(ngModel)]="u.columnName.name"
                                       (ngModelChange)="fieldChange(u,$event)">
                                <nz-option [nzLabel]="col.name" [nzValue]="col.name"
                                           *ngFor="let col of getColumnsForTable(u.tableType.name)"></nz-option>
                            </nz-select>
                        </nz-form-control>
                    </nz-form-item>

                    <!-- Operator Selection -->
                    <nz-form-item class="form-item-inline operator-select">
                        <nz-form-control [nzValidateStatus]="u.operator.ip.validateStatus"
                                         [nzHasFeedback]="u.operator.ip.hasFeedback"
                                         [nzErrorTip]="u.operator.ip.error">
                            <nz-select nzShowSearch nzAllowClear
                                       nzPlaceHolder="运算符"
                                       [(ngModel)]="u.operator.name"
                                       (ngModelChange)="fieldChange(u,$event)">
                                <nz-option [nzLabel]="opt.label" [nzValue]="opt.val"
                                           *ngFor="let opt of this.operators"></nz-option>
                            </nz-select>
                        </nz-form-control>
                    </nz-form-item>

                    <!-- Value Type Selection -->
                    <nz-form-item class="form-item-inline value-type-select">
                        <nz-form-control [nzValidateStatus]="u.valueType.ip.validateStatus"
                                         [nzHasFeedback]="u.valueType.ip.hasFeedback"
                                         [nzErrorTip]="u.valueType.ip.error">
                            <nz-select nzShowSearch nzAllowClear
                                       nzPlaceHolder="值类型"
                                       [(ngModel)]="u.valueType.name"
                                       (ngModelChange)="fieldChange(u,$event)">
                                <nz-option [nzLabel]="opt.label" [nzValue]="opt.val"
                                           *ngFor="let opt of this.valueTypes"></nz-option>
                            </nz-select>
                        </nz-form-control>
                    </nz-form-item>

                    <!-- Value Input -->
                    <nz-form-item class="form-item-inline value-input">
                        <nz-form-control [nzValidateStatus]="u.value.ip.validateStatus"
                                         [nzHasFeedback]="u.value.ip.hasFeedback"
                                         [nzErrorTip]="u.value.ip.error">
                            <input nz-input
                                   nzPlaceHolder="输入值"
                                   [(ngModel)]="u.value.name"
                                   (ngModelChange)="fieldChange(u,$event)"/>
                        </nz-form-control>
                    </nz-form-item>

                    <button nz-button nzDanger nzSize="small" nz-tooltip
                            nzTooltipTitle="删除此过滤条件"
                            nzType="default" class="delete-btn"
                            (click)="removeFilterCondition(i)">
                        <span nz-icon nzType="delete" nzTheme="outline"></span>
                    </button>
                </div>
            </li>
        </ul>
        <div>
            <button nz-button nzSize="small" nz-tooltip
                    nzTooltipTitle="添加一条新的过滤条件"
                    nzType="default" (click)="addFilterCondition()">
                <span nz-icon nzType="appstore-add" nzTheme="outline"></span>添加
            </button>
        </div>
    `
    , styles: [
        `
            .filter-condition-list {
                list-style: none;
                padding: 0;
                margin: 2px 0 0 0;
            }

            .filter-condition-item {
                margin-bottom: 12px;
            }

            .form-row {
                display: flex;
                align-items: flex-start;
                gap: 8px;
                flex-wrap: wrap;
            }

            .form-item-inline {
                margin-bottom: 0;
                flex-shrink: 0;
            }

            .form-item-inline nz-select {
                display: inline-block;
                width: 150px;
                min-width: 120px;
            }

            .operator-select nz-select {
                width: 100px;
                min-width: 80px;
            }

            .value-type-select nz-select {
                width: 120px;
                min-width: 100px;
            }

            .value-input input {
                width: 180px;
                min-width: 150px;
            }

            .delete-btn {
                margin-left: auto;
                flex-shrink: 0;
            }
        `
    ]
})
export class TableJoinFilterConditionComponent extends BasicTuplesViewComponent implements AfterContentInit, OnDestroy {

    /**
     * 过滤条件集合
     */
    filterConditionList: Array<FilterCondition> = [];

    /**
     * 表类型选项
     */
    tableTypes: Array<Option> = [];

    /**
     * 运算符选项
     */
    operators: Array<Option> = [];

    /**
     * 值类型选项
     */
    valueTypes: Array<Option> = [];

    constructor(tisService: TISService, modalService: NzModalService, notification: NzNotificationService, private cdr: ChangeDetectorRef) {
        super(tisService, modalService, notification);
    }

    set colsMeta(colsMeta: Array<ReaderColMeta>) {
        // Not used in this component

    }

    /**
     * @see FilterConditionList
     * @param view
     */
    @Input()
    public set tabletView(view: TuplesProperty) {
        this.colsMeta = view.mcols;
        let v = view as FilterConditionList;
        this._view = v;
        this.filterConditionList = v._filterConditionList;


        // Set dropdown options from metadata
        this.tableTypes = v.tableTypes || [];
        this.operators = v.operators || [];
        this.valueTypes = v.valueTypes || [];
    }

    get primaryTableCols(): Array<CMeta> {
        return (this._view as FilterConditionList).primaryTableCols;
    }

    get dimensionTableCols(): Array<CMeta> {
        return (this._view as FilterConditionList).dimensionTableCols;
    }

    /**
     * Get columns based on selected table type
     */
    getColumnsForTable(tableType: string): Array<CMeta> {
        if (tableType === 'primary') {
            return this.primaryTableCols;
        } else if (tableType === 'dimension') {
            return this.dimensionTableCols;
        }
        return [];
    }

    ngAfterContentInit(): void {
    }

    addFilterCondition() {
        let filterCondition = new FilterCondition();
        this.filterConditionList.push(filterCondition);
    }

    removeFilterCondition(index: number) {
        if (index < 0 || index >= this.filterConditionList.length) {
            return;
        }
        this.filterConditionList.splice(index, 1);
    }

    tableTypeFieldChange(u: FilterCondition, $event: any) {
        delete u.columnName.name;
        delete u.operator.name;
        delete u.valueType.name;
        delete u.value.name;
        this.cdr.detectChanges();
    }

    fieldChange(u: FilterCondition, $event: any) {
        // Handle field change if needed

    }

    @Input()
    set error(errors: Array<any>) {
        if (!Array.isArray(errors)) {
            return;
        }

        let err: { [name: string]: any };
        for (let idx = 0; idx < errors.length; idx++) {
            let fc: FilterCondition = this.filterConditionList[idx];
            if (!fc) {
                continue;
            }
            err = errors[idx];
            for (let key in err) {
                switch (key) {
                    case "tableType": {
                        fc.tableType.ip.error = err[key];
                        break;
                    }
                    case "columnName": {
                        fc.columnName.ip.error = err[key];
                        break;
                    }
                    case "operator": {
                        fc.operator.ip.error = err[key];
                        break;
                    }
                    case "valueType": {
                        fc.valueType.ip.error = err[key];
                        break;
                    }
                    case "value": {
                        fc.value.ip.error = err[key];
                        break;
                    }
                    default:
                        console.log(key);
                }
            }
        }
    }


}

interface Option {
    label: string;
    val: string;
}

/**
 * Filter condition model
 */
export class FilterCondition {
    tableType: FilterField = new FilterField();
    columnName: FilterField = new FilterField();
    operator: FilterField = new FilterField();
    valueType: FilterField = new FilterField();
    value: FilterField = new FilterField();

    constructor() {
        this.tableType.ip = new ItemPropVal();
        this.columnName.ip = new ItemPropVal();
        this.operator.ip = new ItemPropVal();
        this.valueType.ip = new ItemPropVal();
        this.value.ip = new ItemPropVal();
    }
}

/**
 * Filter field model
 */
export class FilterField implements ReaderColMeta {
    disable: boolean;
    index: number;
    ip: ItemPropVal;
    name: Item | string;
    openAssist: boolean;
    type: string | DataTypeDesc;
    // value: string;
}

/**
 * Filter condition list model
 */
export class FilterConditionList implements TuplesProperty {

    _filterConditionList: Array<FilterCondition> = [];

    /**
     * Dropdown options
     */
    tableTypes: Array<Option> = [];
    operators: Array<Option> = [];
    valueTypes: Array<Option> = [];

    constructor(
        private _primaryTableCols: Array<CMeta>,
        private _dimensionTableCols: Array<CMeta>,
        filterConditionList: Array<FilterCondition>,
        tableTypes?: Array<Option>,
        operators?: Array<Option>,
        valueTypes?: Array<Option>
    ) {
        if (filterConditionList.length < 1) {
            // filterConditionList.push(new FilterCondition());
        }
        this._filterConditionList = filterConditionList;
        this.tableTypes = tableTypes || [];
        //  console.log(this.tableTypes)
        this.operators = operators || [];
        this.valueTypes = valueTypes || [];
    }

    get primaryTableCols(): Array<CMeta> {
        return this._primaryTableCols;
    }

    get dimensionTableCols(): Array<CMeta> {
        return this._dimensionTableCols;
    }

    /**
     * Unused properties (required by interface)
     */
    typeMetas: Array<DataTypeMeta> = [];
    mcols: Array<FilterField> = [];

    viewType(): TuplesPropertyType {
        return TuplesPropertyType.TableJoinFilterCondition;
    }
}
