import {Component, Input} from "@angular/core";
import {DataTypeDesc, DataTypeMeta} from "../tis.plugin";

@Component({
  selector: "jdbc-type",
  template: `
    <!--          {{u | json}}-->
    <!--      {{u.type.type}}-->
    <nz-form-item>
      <ng-container [ngSwitch]="!!_type">
        <nz-space *ngSwitchCase="true">
          <nz-select  *nzSpaceItem nzShowSearch class="type-select" [disabled]="disable"
                     [nzDropdownMatchSelectWidth]="false" [(ngModel)]="_type.type"
                     nzPlaceHolder="请选择" (ngModelChange)="typeChange(_type)">
            <nz-option [nzValue]="tp.type.type" [nzLabel]="tp.type.typeName"
                       *ngFor="let tp of this._supportTypes"></nz-option>
          </nz-select>

          <ng-container
            *ngTemplateOutlet="assistType;context:{typemeta:getColTypeMeta(_type.type),type:_type};">
          </ng-container>

          <ng-template #assistType let-typemeta="typemeta" let-colSizeFeedback="type.columnSizeFeedback"
                       let-decimalDigitsFeedback="type.decimalDigitsFeedback">
            <ng-container *ngIf="typemeta.containColSize">

              <nz-form-control *nzSpaceItem [nzValidateStatus]="colSizeFeedback?.validateStatus"
                               [nzHasFeedback]="colSizeFeedback?.hasFeedback"
                               [nzErrorTip]="colSizeFeedback?.error">

                <nz-input-number [disabled]="disable" nz-tooltip nzTooltipTitle="Column Size"

                                 [(ngModel)]="_type.columnSize"
                                 [nzMin]="typemeta.colsSizeRange.min"
                                 [nzMax]="typemeta.colsSizeRange.max"></nz-input-number>
              </nz-form-control>

            </ng-container>
            <ng-container *ngIf="typemeta.containDecimalRange">
              <nz-form-control *nzSpaceItem [nzValidateStatus]="decimalDigitsFeedback?.validateStatus"
                               [nzHasFeedback]="decimalDigitsFeedback?.hasFeedback"
                               [nzErrorTip]="decimalDigitsFeedback?.error">
                <nz-input-number [disabled]="disable" nz-tooltip nzTooltipTitle="Decimal Digits Size"

                                 [(ngModel)]="_type.decimalDigits"
                                 [nzMin]="typemeta.decimalRange.min"
                                 [nzMax]="typemeta.decimalRange.max"></nz-input-number>
              </nz-form-control>

            </ng-container>

          </ng-template>
        </nz-space>
        <span *ngSwitchCase="false">
               <nz-tag nzColor="warning">
        <span nz-icon nzType="exclamation-circle"></span>
        <span>请选择目标列</span>
      </nz-tag>
            </span>
      </ng-container>
    </nz-form-item>

  `,
  styles: [`
    .type-select{
     width: 13em;
    }
    nz-form-item {
      margin: 0px;
    }
  `]
})
export class JdbcTypeComponent {
  @Input()
  set typeMetas(val: Map<number, DataTypeMeta>) {
    if (!val) {
      throw new Error("param typeMetas can not be null");
    }
    this._typeMetas = val;
    this._supportTypes = Array.from(val.values());
  }


  @Input()
  disable: boolean;
  _typeMetas: Map<number, DataTypeMeta> = new Map()
  _supportTypes: Array<DataTypeMeta> = [];
  _type: DataTypeDesc;
  @Input()
  set type(t: DataTypeDesc) {
    // if (!t) {
    //   throw new Error("instance of DataTypeDesc can not be null");
    // }
    this._type = t;
  }

  getColTypeMeta(type: number): DataTypeMeta {
    let typeMeta: DataTypeMeta = this._typeMetas.get(type);

    if (!typeMeta) {
      throw new Error(`type:${type} can not find typeMeta in typeMap:${Array.from(this._typeMetas.values()).map((type) => type.type.typeName + '_' + type.type.type).join(",")}`)
    }
    return typeMeta;
  }


  typeChange(type: DataTypeDesc) {
    // console.log(type);

    let meta: DataTypeMeta = this._typeMetas.get(type.type)
    if (meta.containColSize) {
      type.columnSize = meta.type.columnSize;
    }
    if (meta.containDecimalRange) {
      type.decimalDigits = meta.type.decimalDigits;
    }
  }

}
