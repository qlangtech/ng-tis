import {
  AfterContentInit,
  AfterViewInit, ChangeDetectionStrategy,
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
  ViewContainerRef
} from '@angular/core';
import {TisResponseResult} from "../service/tis.service";
import {ActivatedRoute, Router} from "@angular/router";

export class Pager {

  public static go(router: Router, route: ActivatedRoute, page: number): void {
    router.navigate([], {
      relativeTo: route,
      queryParams: {page: page},
      queryParamsHandling: "merge"
    });
  }

  public static create(result: TisResponseResult): Pager {
    let biz = result.bizresult;
    return new Pager(biz.curPage, biz.totalPage, biz.totalCount, biz.pageSize);
  }

  constructor(public page = 0, public allPage = 0, public totalCount = 0, public pageSize = 10) {

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

@Directive({selector: 'tis-col'})
export class TisColumn implements AfterContentInit, AfterViewInit {
  @Input('field') field: string;
  @Input('title') title: string;
  @Input('width') width = -1;
  @ContentChild(TemplateRef, {static: false}) contentTempate: TemplateRef<any>;

  constructor(private viewContainerRef: ViewContainerRef) {
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
  template: `


      <nz-table #tabrows [nzData]="rows" [nzLoading]="isSpinning" [(nzPageIndex)]="pager.page"
                (nzPageIndexChange)="searchData()"
                [nzFrontPagination]="false" [nzTotal]="pager.totalCount" [nzPageSize]="pager.pageSize">
          <thead>
          <tr>
              <th *ngFor="let k of cls" tis-th [key-meta]='k'>{{k.title}}</th>
          </tr>
          </thead>
          <tbody>
          <tr *ngFor="let r of tabrows.data">
              <ng-template ngFor let-k [ngForOf]="cls">
                  <td *ngIf="k.fieldDefined">
                      {{r[k.field]}}
                  </td>
                  <td *ngIf="!k.fieldDefined">
                      <ng-template tis-td-content [row]='r' [key-meta]='k'></ng-template>
                  </td>
              </ng-template>
          </tr>
          </tbody>
      </nz-table>
      <!--
      <nav *ngIf="pager && pager.allPage>1" aria-label="翻页导航">
          <ul class="pagination pagination-sm ">
              <li class="page-item" style="color:#999999"> 第{{pager.page}}/{{pager.allPage}}页 &nbsp;</li>
              <li [class.disabled]="pager.page === 1" class="page-item">
                  <a class="page-link" href="javascript:void(0)"
                     tabindex="-1" (click)="getPage(pager.page-1)">上一页</a></li>
              <li *ngIf="pager.page>2" class="page-item more">...</li>
              <li class="page-item" *ngFor="let p of pager.pageEnum">
                  <a href="javascript:void(0)" [class.curr-page]="p===pager.page" (click)="getPage(p)"
                     class="page-link">{{p}}</a></li>
              <li *ngIf="pager.page<(pager.allPage-2)" class="page-item more">...</li>
              <li class="page-item" [class.disabled]="pager.page >= pager.allPage">
                  <a class="page-link" href="javascript:void(0)" (click)="getPage(pager.page+1)">下一页</a></li>
          </ul>
      </nav> -->
  `,
  styles: [`.more {
      color: #999;
      padding: 5px;
      font-family: \\5b8b\\4f53, arial, san-serif;
  }

  .curr-page {
      color: deeppink;
      font-weight: 300;
  }`]
})
export class PaginationComponent implements AfterContentInit, OnInit {
  @ContentChildren(TisColumn) cols: QueryList<TisColumn>;
  @Input('rows') rows: any[] = [];
  @Input('spinning') isSpinning = false;
  private _cls: TisColumn[] = [];
  @Output('go-page') pageEmitter = new EventEmitter<number>();
  p: Pager = new Pager();

  @Input('pager') set pager(p: Pager) {
    this.p = p;
  }

  ngOnInit(): void {

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
  }

  searchData() {
    // console.log(this.pager);
    this.getPage(this.pager.page);
  }
}









