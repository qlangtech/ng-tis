import {AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy} from "@angular/core";
import {BasicTuplesViewComponent} from "./basic.tuples.view.component";
import {ReaderColMeta} from "../tis.plugin";
import {TuplesProperty} from "../plugin/type.utils";
import {TISService} from "../tis.service";
import {NzModalService} from "ng-zorro-antd/modal";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {MultiSingleValue} from "../../base/common/ontology.common";

@Component({
  selector: "multi-select-single-val",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="enum-val-list">
      <li *ngFor="let item of enumValList; let i = index" class="enum-val-item">
        <nz-form-item class="enum-form-item">
          <nz-form-control [nzValidateStatus]="getItemError(i) ? 'error' : ''"
                           [nzHasFeedback]="!!getItemError(i)"
                           [nzErrorTip]="getItemError(i)">
            <input nz-input
                   placeholder="输入枚举值"
                   [(ngModel)]="item.enumVal"
                   class="enum-input"/>
          </nz-form-control>
        </nz-form-item>
        <button nz-button nzDanger nzSize="small" nzType="default"
                nz-tooltip nzTooltipTitle="删除此枚举值"
                class="delete-btn"
                (click)="removeItem(i)">
          <span nz-icon nzType="delete" nzTheme="outline"></span>
        </button>
      </li>
    </ul>
    <div>
      <button nz-button nzSize="small" nzType="default"
              nz-tooltip nzTooltipTitle="添加一个枚举值"
              (click)="addItem()">
        <span nz-icon nzType="plus" nzTheme="outline"></span>添加
      </button>
    </div>
  `,
  styles: [`
    .enum-val-list {
      list-style: none;
      padding: 0;
      margin: 2px 0 0 0;
    }

    .enum-val-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 8px;
    }

    .enum-form-item {
      margin-bottom: 0;
      flex: 1;
    }

    .enum-input {
      width: 100%;
      max-width: 300px;
    }

    .delete-btn {
      flex-shrink: 0;
      margin-top: 1px;
    }
  `]
})
export class MultiSelectSingleValComponent extends BasicTuplesViewComponent implements AfterContentInit, OnDestroy {

  enumValList: Array<{ enumVal: string }> = [];
  private _errors: Array<string> = [];

  constructor(tisService: TISService, modalService: NzModalService, notification: NzNotificationService,
              private cdr: ChangeDetectorRef) {
    super(tisService, modalService, notification);
  }

  @Input()
  public set tabletView(view: TuplesProperty) {
    this._view = view;
    let v = view as MultiSingleValue;
    this.enumValList = v._mcols || [];
    this.cdr.detectChanges();
  }

  set colsMeta(colsMeta: ReaderColMeta[]) {
    // not used
  }

  @Input()
  set error(errors: any) {
    if (Array.isArray(errors)) {
      this._errors = errors;
    } else if (typeof errors === 'string') {
      this._errors = [errors];
    } else {
      this._errors = [];
    }
    this.cdr.detectChanges();
  }

  getItemError(index: number): string {
    return this._errors[index] || '';
  }

  addItem() {
    this.enumValList.push({enumVal: ''});
    this.cdr.detectChanges();
  }

  removeItem(index: number) {
    if (index >= 0 && index < this.enumValList.length) {
      this.enumValList.splice(index, 1);
      this.cdr.detectChanges();
    }
  }

  ngAfterContentInit(): void {
  }
}