import {Component, Injectable, Input} from "@angular/core";
import {BasicFormComponent} from "../basic.form.component";
import {DataTypeMeta, ReaderColMeta} from "../tis.plugin";
import {TISService} from "../tis.service";
import {NzModalService} from "ng-zorro-antd/modal";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {TuplesProperty} from "../plugin/type.utils";

export interface Pair {
  name: string;
  value: string | Array<UdfDesc>
}

export interface UdfDesc {
  pairs: Array<Pair>
}

@Component({
  selector: "udf-desc-literia",
  template: `

      <ng-container *ngTemplateOutlet="udfDescLiteriaTemplate;context:{descAry:descAry}"></ng-container>

      <ng-template #udfDescLiteriaTemplate let-descAry="descAry" let-pairs="pairs">
          <ng-container *ngFor="let literia of descAry">

              <ul class="desc-literia" [ngClass]="{'pairs':pairs}">
                  <li *ngFor="let pair of literia.pairs"><strong class="pair-key">{{pair.name}}:</strong>
                      <ng-container [ngSwitch]=" isArray( pair.value)">
                          <span class="pair-val" *ngSwitchCase="false">"{{pair.value}}"</span>
                          <div *ngSwitchCase="true">
                              <ng-container
                                      *ngTemplateOutlet="udfDescLiteriaTemplate;context:{descAry:pair.value,pairs:true}"></ng-container>
                          </div>
                      </ng-container>
                  </li>
              </ul>

          </ng-container>

      </ng-template>

  `,
  styles: [`
    .pair-key {
      font-size: 14px;
    }

    .pair-val {
      display: inline-block;
      margin-left: 5px;
      color: #04b604;
      font-size: 14px;
    }

    .desc-literia {
      margin: 0px 0px 0px 10px;
      padding: 0px;
    }

    .desc-literia li {
      display: inline-block;
      margin: 0px 10px 0px 0px;
      list-style-type: none;
    }

    .pairs li {
      float: left;
    }
  `]
})
export class UdfDescLiteria {

  @Input()
  descAry: Array<UdfDesc>


  isArray(val: any): boolean {
    return Array.isArray(val);
  }
}

@Injectable()
export abstract class BasicTuplesViewComponent extends BasicFormComponent {


  /**
   * 显示的列表信息（Mongodb列，Transformer规则）
   */
  // @Input()
  abstract set colsMeta(colsMeta: Array<ReaderColMeta>) ;

  /**
   * 支持的所有类型枚举
   */
  @Input()
  typeMetas: Map<number, DataTypeMeta> = new Map();

  _view: TuplesProperty;

  constructor(tisService: TISService, modalService: NzModalService, notification: NzNotificationService) {
    super(tisService, modalService, notification);
  }

  @Input()
  public set tabletView(view: TuplesProperty) {
    //
    this.colsMeta = view.mcols;
    this.typeMetas = BasicTuplesViewComponent.type2Map(view.typeMetas);
    this._view = view;
   // console.log([ this.typeMetas, view.typeMetas]);
    //
  }

  // private _typeMap: Map<number, DataTypeMeta>
  static type2Map(typeMetas: Array<DataTypeMeta>): Map<number, DataTypeMeta> {
    if (typeMetas && typeMetas.length > 0) {
      let result = new Map<number, DataTypeMeta>();
      for (let type of typeMetas) {
        result.set(type.type.type, type);
      }
      return result;
    } else {
      throw new Error("this.typeMetas can not be empty");
    }
  }
}
