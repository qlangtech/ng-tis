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
import {DataTypeMeta, ReaderColMeta} from "./tis.plugin";



@Component({
  selector:"db-schema-editor",
  template: `
    <tis-page [rows]="colsMeta" [tabSize]="'small'" [bordered]="true" [showPagination]="false">
      <tis-col title="Index" field="index" width="7">
      </tis-col>
      <tis-col title="Name" width="40">
        <ng-template let-u='r'>
          <nz-form-item>
            <nz-form-control [nzValidateStatus]="u.ip.validateStatus"
                             [nzHasFeedback]="u.ip.hasFeedback"
                             [nzErrorTip]="u.ip.error">
              <input nz-input [(ngModel)]="u.name"/>
            </nz-form-control>
          </nz-form-item>
        </ng-template>
      </tis-col>
      <tis-col title="Type">
        <ng-template let-u='r'>
          <nz-space>
            <nz-select *nzSpaceItem class="type-select" [(ngModel)]="u.type.type"
                       nzPlaceHolder="请选择">
              <nz-option [nzValue]="tp.type.type" [nzLabel]="tp.type.typeName"
                         *ngFor="let tp of this.typeMetas"></nz-option>
            </nz-select>
            <ng-container
              *ngTemplateOutlet="assistType;context:{typemeta:this.typeMap.get(u.type.type)}">
            </ng-container>
            <ng-template #assistType let-typemeta="typemeta">
              <ng-container *ngIf="typemeta.containColSize">
                <nz-input-number nz-tooltip nzTooltipTitle="Column Size" *nzSpaceItem
                                 [(ngModel)]="u.type.columnSize"
                                 [nzMin]="typemeta.colsSizeRange.min"
                                 [nzMax]="typemeta.colsSizeRange.max"></nz-input-number>
              </ng-container>
              <ng-container *ngIf="typemeta.containDecimalRange">
                <nz-input-number nz-tooltip nzTooltipTitle="Decimal Digits Size" *nzSpaceItem
                                 [(ngModel)]="u.type.decimalDigits"
                                 [nzMin]="typemeta.decimalRange.min"
                                 [nzMax]="typemeta.decimalRange.max"></nz-input-number>
              </ng-container>

            </ng-template>
          </nz-space>
        </ng-template>
      </tis-col>
      <tis-col title="主键">
        <ng-template let-u='r'>
          <nz-switch
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
      nz-form-item {
        margin: 0px;
      }
    `
  ]
})
export class SchemaEditComponent extends BasicFormComponent implements AfterContentInit, OnDestroy {

  @Input()
  colsMeta: Array<ReaderColMeta> = [];
  @Input()
  typeMetas: Array<DataTypeMeta> = [];

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

  ngAfterContentInit() {
  }

  ngOnDestroy() {

  }

}
