/**
 *   Licensed to the Apache Software Foundation (ASF) under one
 *   or more contributor license agreements.  See the NOTICE file
 *   distributed with this work for additional information
 *   regarding copyright ownership.  The ASF licenses this file
 *   to you under the Apache License, Version 2.0 (the
 *   "License"); you may not use this file except in compliance
 *   with the License.  You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ContentChildren,
    Directive,
    EventEmitter,
    Input,
    OnInit,
    Output,
    QueryList,
    TemplateRef,
    ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";

import {SavePluginEvent, TisResponseResult} from "./tis.plugin";
import {NzTableSize} from "ng-zorro-antd/table";
import {NzModalService} from 'ng-zorro-antd/modal';
import {openParamsCfg, TargetPluginCfg} from "./plugins.component";
import {NzDrawerService} from "ng-zorro-antd/drawer";
import {TISService} from "./tis.service";
import {HttpParams} from "@angular/common/http";

export class Pager {

    public static goTo(router: Router, route: ActivatedRoute, page: number, reset: boolean, extraParam?: any): void {
        let params = {page: page};
        if (extraParam) {
            for (let key in extraParam) {
                params[key] = extraParam[key];
            }
        }
        router.navigate([], {
            relativeTo: route,
            queryParams: params,
            queryParamsHandling: reset ? null : 'merge'
        });
    }

    public static go(router: Router, route: ActivatedRoute, page: number, extraParam?: any): void {
        Pager.goTo(router, route, page, false, extraParam);
    }

    public static create(result: TisResponseResult): Pager {
        let biz = result.bizresult;
        if (biz) {
            return new Pager(biz.curPage, biz.totalPage, biz.totalCount, biz.pageSize, biz.payload);
        } else {
            return new Pager();
        }
    }

    constructor(public page = 0, public allPage = 0, public totalCount = 0, public pageSize = 10, private _payload = []) {

    }

    public get payload(): Array<any> {
        if (!this._payload) {
            return [];
        }
        return this._payload;
    }

    get curPage(): number {
        if (this.page < 1) {
            return 1;
        }
        if (this.allPage > 0 && this.page > this.allPage) {
            return this.allPage;
        }
        return this.page;
    }

    public get pageEnum(): number[] {
        let result: number[] = [];

        // let curPage = this.curPage;
        let startIndex = this.startIndex;

        let endIndex = this.endIndex;

        for (let i = startIndex; i <= endIndex; i++) {
            result.push(i);
        }

        return result;
    }

    private get startIndex(): number {

        let answer = this.curPage - 2;
        let tailOffset = this.curPage + 2;
        if (tailOffset > this.allPage) {
            answer -= (tailOffset - this.allPage);
        }
        return answer < 1 ? 1 : answer;
    }

    private get endIndex(): number {
        let answer = this.startIndex + 4;
        return (answer > this.allPage) ? this.allPage : answer;
    }

}

@Component({
    selector: 'page-header',
    template: `
        <ng-content></ng-content>`
})
export class TisPageHeader implements AfterContentInit, AfterViewInit {
    ngAfterContentInit(): void {
    }

    ngAfterViewInit(): void {
    }
}

@Directive({
    selector: 'page-row-assist'
})
export class TisPageRowAssist implements AfterContentInit, AfterViewInit {
    @ContentChild(TemplateRef, {static: false}) rowAssistTempate: TemplateRef<any>;

    constructor(private viewContainerRef: ViewContainerRef) {
    }

    ngAfterContentInit(): void {
    }

    ngAfterViewInit(): void {
    }
}

@Directive({selector: 'tis-col'})
export class TisColumn implements AfterContentInit, AfterViewInit {
    @Input('field') field: string;
    @Input('title') title: string;
    @Input('width') width = -1;
    @ContentChild(TemplateRef, {static: false}) contentTempate: TemplateRef<any>;

    // @Input('searchable') searchable = false;
    searcherData = '';
    @Output() search = new EventEmitter<{ query: string, reset: boolean }>();

    get searchable(): boolean {
        return this.search.observers.length > 0;
    }

    constructor(private viewContainerRef: ViewContainerRef) {
    }

    public startSearch(): void {
        this.search.emit({query: this.searcherData, reset: false});
    }

    public resetSearch(): void {
        this.searcherData = '';
        this.search.emit({query: '', reset: true});
    }

    ngAfterContentInit(): void {

    }

    ngAfterViewInit(): void {

    }

    get fieldDefined(): boolean {
        return !(typeof (this.field) === 'undefined');
    }
}

@Directive({
    selector: '[tis-th]'
})
export class ThDirective implements OnInit {
    @Input('key-meta') keyMeta: TisColumn;

    constructor(private viewContainerRef: ViewContainerRef) {
    }

    ngOnInit(): void {
        if (this.keyMeta.width > 0) {
            this.viewContainerRef.element.nativeElement.width = this.keyMeta.width + '%';
        }
    }
}

export interface RowsManageCfg {
    enable: boolean;
    idFieldName?: string;
    targetResType?: 'BuildHistoricalRecord' | 'SystemErrorRecord';
}

@Directive({
    selector: '[tis-td-content]'
})
export class TdContentDirective implements OnInit {
    @Input('row') row: any;
    @Input('key-meta') keyMeta: TisColumn;

    constructor(private viewContainerRef: ViewContainerRef) {
    }

    ngOnInit(): void {
        if (this.keyMeta.contentTempate) {
            this.viewContainerRef.createEmbeddedView(this.keyMeta.contentTempate, {'r': this.row});
        }
    }
}


// implements OnInit, AfterContentInit
@Component({
    selector: 'tis-page',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    template: `
        <div class="tis-table-container">
            <nz-table #tabrows [nzBordered]="bordered"
                      [nzTitle]="enableRowsManage || _pageHeader ? tableHeaderTpl : null" [nzData]="rows"
                      [nzSize]="this.tabSize"
                      [nzShowPagination]="showPagination" [nzLoading]="isSpinning" [(nzPageIndex)]="pager.page"
                      (nzPageIndexChange)="searchData()"
                      [nzFrontPagination]="false" [nzTotal]="pager.totalCount" [nzPageSize]="pager.pageSize">
                <thead>
                <tr>
                    <th *ngIf="enableRowsManage" class="checkbox-column" [nzChecked]="isAllChecked"
                        [nzIndeterminate]="isIndeterminate"
                        (nzCheckedChange)="onAllChecked($event)"></th>
                    <th *ngFor="let k of cls" tis-th [key-meta]='k' [nzCustomFilter]="k.searchable">{{k.title}}
                        <i *ngIf="k.searchable"
                           nz-th-extra
                           class="ant-table-filter-icon"
                           nz-icon
                           nz-dropdown
                           #dropdown="nzDropdown"
                           nzType="search"
                           [nzDropdownMenu]="menu"
                           [class.ant-table-filter-open]="dropdown.nzVisible"
                           nzTrigger="click"
                           nzPlacement="bottomRight"
                           [nzClickHide]="false"
                           nzTableFilter
                        ></i>
                        <nz-dropdown-menu nzPlacement="bottomRight" nzTableFilter #menu="nzDropdownMenu">
                            <div class="search-box">
                                <input type="text" nz-input [placeholder]="k.title" [(ngModel)]="k.searcherData"/>
                                <button nz-button nzSize="small" nzType="primary" (click)="k.startSearch()"
                                        class="search-button">
                                    查询
                                </button>
                                <button nz-button nzSize="small" (click)="k.resetSearch()">重置</button>
                            </div>
                        </nz-dropdown-menu>
                    </th>
                </tr>
                </thead>
                <tbody>
                <ng-container *ngFor="let r of tabrows.data; let i = index">
                    <tr [class.row-deleting]="r._deleted">
                        <td *ngIf="enableRowsManage" class="checkbox-column">
                            <label nz-checkbox [(ngModel)]="r._checked" (ngModelChange)="onItemChecked(r)"></label>
                        </td>
                        <ng-template ngFor let-k [ngForOf]="cls">
                            <td *ngIf="k.fieldDefined">
                                {{r[k.field]}}
                            </td>
                            <td *ngIf="!k.fieldDefined">
                                <ng-template tis-td-content [row]='r' [key-meta]='k'></ng-template>
                            </td>
                        </ng-template>
                    </tr>
                    <tr *ngIf="this.containTpl && r.openAssist" [nzExpand]="  r.openAssist">

                        <ng-container *ngTemplateOutlet="this._rowAssist.rowAssistTempate;context:{r:r}"></ng-container>

                    </tr>
                </ng-container>
                </tbody>
            </nz-table>
        </div>

        <ng-template #tableHeaderTpl>
            <div class="table-header-with-actions">
                <!-- 左侧：批量操作区 -->
                <div *ngIf="enableRowsManage" class="batch-actions-area">
                    <!-- 未选中：小图标提示 -->
                    <div *ngIf="selectedCount === 0" class="batch-hint" nz-tooltip
                         nzTooltipTitle="选择项目后可批量操作">
                        <i nz-icon nzType="setting" nzTheme="outline"></i>
                        <span class="hint-text">批量操作</span>
                    </div>

                    <!-- 已选中：完整操作栏 -->
                    <div *ngIf="selectedCount > 0" class="batch-actions-expanded">
                        <span class="selected-count">已选中 {{selectedCount}} 项</span>
                        <button nz-button nzDanger nzSize="small" (click)="onBatchDelete()">
                            <i nz-icon nzType="delete"></i> 删除
                        </button>
                    </div>
                </div>

                <!-- 右侧：原有的page-header内容 -->
                <div class="page-header-content">
                    <ng-content select="page-header"></ng-content>
                </div>
            </div>
        </ng-template>
    `,
    styles: [`.more {
        color: #999;
        padding: 5px;
        font-family: \\5b8b\\4f53, arial, san-serif;
    }

    .ant-table-filter-icon {
        cursor: pointer;
    }

    .search-box {
        padding: 8px;
        background-color: white;
        border: 1px solid #a6a6a6;
        border-radius: 4px;
    }

    .search-box input {
        width: 188px;
        margin-bottom: 8px;
        display: block;
    }

    .search-box button {
        width: 90px;
    }

    .search-button {
        margin-right: 8px;
    }

    .curr-page {
        color: deeppink;
        font-weight: 300;
    }

    .tis-table-container {
        position: relative;
    }

    /* 表格header布局 */
    .table-header-with-actions {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 2px 0;
    }

    .batch-actions-area {
        flex-shrink: 0;
    }

    .page-header-content {
        flex: 1;
        display: flex;
        align-items: center;
    }

    /* 未选中状态：小提示 */
    .batch-hint {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 12px;
        background: #f5f5f5;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        color: #8c8c8c;
        font-size: 13px;
        cursor: help;
        transition: all 0.3s ease;
    }

    .batch-hint:hover {
        background: #e6f7ff;
        border-color: #91d5ff;
        color: #1890ff;
    }

    .batch-hint i {
        font-size: 14px;
    }

    .hint-text {
        font-weight: 500;
    }

    /* 已选中状态：完整操作栏 */
    .batch-actions-expanded {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        padding: 6px 16px;
        background: linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 100%);
        border: 1px solid #91d5ff;
        border-radius: 6px;
        animation: expandIn 0.3s ease;
    }

    @keyframes expandIn {
        from {
            opacity: 0;
            transform: scale(0.9);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }

    .batch-actions-expanded .selected-count {
        color: #1890ff;
        font-size: 14px;
        font-weight: 500;
    }

    .batch-actions-expanded button {
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    /* 强制设置checkbox列宽度 - ViewEncapsulation.None 使样式全局生效 */
    tis-page .checkbox-column,
    tis-page th.checkbox-column,
    tis-page td.checkbox-column {
        width: 40px !important;
        min-width: 40px !important;
        max-width: 40px !important;
        padding: 4px 8px !important;
        text-align: center !important;
    }

    tis-page .checkbox-column .ant-checkbox-wrapper {
        margin: 0 !important;
    }

    tis-page .ant-table thead > tr > th.checkbox-column,
    tis-page .ant-table tbody > tr > td.checkbox-column {
        width: 40px !important;
        min-width: 40px !important;
        max-width: 40px !important;
    }

    /* 删除动画效果 */
    @keyframes deleteRow {
        0% {
            opacity: 1;
            transform: translateX(0);
            background-color: #fff;
        }
        20% {
            opacity: 1;
            transform: translateX(0);
            background-color: #ffebee;
        }
        100% {
            opacity: 0;
            transform: translateX(100%);
            background-color: #ffcdd2;
        }
    }

    tis-page .ant-table tbody > tr.row-deleting {
        animation: deleteRow 1000ms ease-in-out forwards;
    }

    tis-page .ant-table tbody > tr.row-deleting > td {
        border-bottom: none !important;
    }

    /* 防止动画时出现横向滚动条 */
    tis-page .ant-table {
        overflow: hidden;
    }
    `]
})
export class PaginationComponent implements AfterContentInit, OnInit {
    @ContentChildren(TisColumn) cols: QueryList<TisColumn>;
    @ContentChildren(TisPageRowAssist) rowAssists: QueryList<TisPageRowAssist>;
    @ContentChildren(TisPageHeader) pageHeader: QueryList<TisPageHeader>;


    @Input('rows') rows: any[] = [];
    @Input() showPagination = true;
    @Input('spinning') isSpinning = false;
    @Input() bordered = false;
    @Input() tabSize: NzTableSize;
    private _cls: TisColumn[] = [];
    _pageHeader: TisPageHeader;
    _rowAssist: TisPageRowAssist;
    @Output('go-page') pageEmitter = new EventEmitter<number>();
    p: Pager = new Pager();
    // 是否支持对列表行选中进行操作
    @Input("enable-rows-manage") _enableRowsManage: RowsManageCfg = {enable: false};

    @Input('pager') set pager(p: Pager) {
        this.p = p;
        // 重置选中状态当切换页面时
        if (this.enableRowsManage) {
            this.clearAllSelection();
        }
    }

    // 批量操作相关属性
    selectedRows: Set<any> = new Set();
    isAllChecked = false;
    isIndeterminate = false;

    // 批量删除事件
    @Output('batch-delete') batchDeleteEmitter = new EventEmitter<any[]>();

    constructor(private modal: NzModalService, private cdr: ChangeDetectorRef, private drawerService: NzDrawerService, private tisService: TISService) {
    }

    get enableRowsManage(): boolean {
        return this._enableRowsManage && this._enableRowsManage.enable;
    }

    get containTpl(): boolean {
        return this._rowAssist && !!this._rowAssist.rowAssistTempate;
    }

    get selectedCount(): number {
        return this.selectedRows.size;
    }

    ngOnInit(): void {
        // 初始化选中状态
        if (this.enableRowsManage && this.rows) {
            this.rows.forEach(row => {
                row._checked = false;
            });
        }
    }

    get pager(): Pager {
        return this.p;
    }

    get cls(): TisColumn[] {
        return this._cls;
    }

    getPage(pNumber: number): void {
        this.pager.page = pNumber;
        this.pageEmitter.emit(pNumber);
    }

    ngAfterContentInit() {
        this._cls = this.cols.toArray();
        this._pageHeader = this.pageHeader.first;
        this._rowAssist = this.rowAssists.first;
    }

    searchData() {
        // console.log(this.pager);
        this.getPage(this.pager.page);
    }

    search() {
    }

    // 选择管理方法
    onAllChecked(checked: boolean): void {
        this.isAllChecked = checked;
        this.isIndeterminate = false;

        if (!this.rows) return;

        this.rows.forEach(row => {
            row._checked = checked;
            if (checked) {
                this.selectedRows.add(row);
            } else {
                this.selectedRows.delete(row);
            }
        });
        // 手动触发变更检测
        this.cdr.markForCheck();
    }

    onItemChecked(row: any): void {
        if (row._checked) {
            this.selectedRows.add(row);
        } else {
            this.selectedRows.delete(row);
        }

        this.updateCheckAllState();
        // 手动触发变更检测
        this.cdr.markForCheck();
    }

    updateCheckAllState(): void {
        if (!this.rows || this.rows.length === 0) {
            this.isAllChecked = false;
            this.isIndeterminate = false;
            return;
        }

        const checkedCount = this.rows.filter(r => r._checked).length;
        this.isAllChecked = checkedCount === this.rows.length;
        this.isIndeterminate = checkedCount > 0 && checkedCount < this.rows.length;
    }

    clearAllSelection(): void {
        this.selectedRows.clear();
        this.isAllChecked = false;
        this.isIndeterminate = false;
        if (this.rows) {
            this.rows.forEach(row => {
                row._checked = false;
            });
        }
        // 手动触发变更检测
        this.cdr.markForCheck();
    }

    onBatchDelete(): void {
        const selectedCount = this.selectedRows.size;
        if (selectedCount === 0) return;
        if (!this._enableRowsManage.enable) {
            throw new Error("_enableRowsManage.enable must be true");
        }
        let savePluginOpt = new SavePluginEvent();
        // savePluginOpt.postPayload = {"aaaa": 1111};
        let targetDesc = new TargetPluginCfg('DeleteItems', "noStore");
        targetDesc.pluginDialogOpts = {
            saveBtnLabel: '执行删除' //
            , shallLoadSavedItems: false
            , opt: savePluginOpt
            // , savePluginEventCreator: () => savePluginOpt
        }
        let pluginInitialParams = new HttpParams();
        for (let row of this.selectedRows) {
            pluginInitialParams = pluginInitialParams.append("targetId", row[this._enableRowsManage.idFieldName]);
        }
        pluginInitialParams = pluginInitialParams.append("targetResType", this._enableRowsManage.targetResType);
        targetDesc.pluginInitialParams = pluginInitialParams;
        openParamsCfg(targetDesc, '', this.drawerService, this.tisService, "批量删除").then((result) => {
            if (result.saveSuccess) {
                let deleteIds: Array<string> = result.biz();
              //  console.log(deleteIds);
                if (!deleteIds || deleteIds.length === 0) {
                    return;
                }

                // 将deleteIds统一转为字符串Set，用于快速查找和类型安全比较
                const deleteIdSet = new Set(deleteIds);
                console.log(deleteIdSet);
                // 第一步：标记要删除的记录，触发动画
                const rowsToDelete = this.rows.filter(row => {
                    const rowId = String(row[this._enableRowsManage.idFieldName]);
                    const include = deleteIdSet.has(rowId);
                    console.log([include, this._enableRowsManage.idFieldName, rowId]);
                    return include;
                });

                rowsToDelete.forEach(row => {
                    row._deleted = true;
                });
                console.log(rowsToDelete);
                // 触发变更检测，启动删除动画
                this.cdr.markForCheck();

                // 第二步：等待动画完成后从数组中移除记录
                setTimeout(() => {
                    // 从rows数组中移除已删除的记录
                    this.rows = this.rows.filter(row => {
                        const rowId = String(row[this._enableRowsManage.idFieldName]);
                        return !deleteIdSet.has(rowId);
                    });

                    // 更新分页统计信息
                    if (this.pager.totalCount) {
                        this.pager.totalCount -= deleteIds.length;
                    }

                    // 清空选中状态
                    this.clearAllSelection();

                    // 触发变更检测，更新视图
                    this.cdr.markForCheck();
                }, 1000); // 动画时长为1000ms
            }
        });


        // let opt = new SavePluginEvent();
        // opt.serverForward = "coredefine:datax_action:trigger_fullbuild_task";
        //
        // let pluginDesc: Descriptor = null;
        //
        // PluginsComponent.openPluginDialog({
        //         saveBtnLabel: '执行删除' //
        //         , shallLoadSavedItems: false //
        //         , savePluginEventCreator: () => {
        //             return opt;
        //         }
        //     }
        //     , this.tisService, pluginDesc
        //     , {name: 'noStore', require: true}
        //     , `批量删除`
        //     , (_, biz) => {
        //         let rr: TisResponseResult = {
        //             success: biz.success,
        //             bizresult: biz
        //         }
        //        // this.processTriggerResult(this.getProcessStrategy(true), Promise.resolve(rr));
        //
        //     });

    }
}









