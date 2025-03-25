import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from "@angular/core";
import {
  DataTypeMeta,
  Descriptor,
  EXTRA_PARAM_DATAX_NAME,
  HeteroList,
  Item,
  ItemPropVal,
  PluginType,
  ReaderColMeta,
  SavePluginEvent,
  TuplesPropertyType
} from "../tis.plugin";
import {TISService} from "../tis.service";
import {NzModalService} from "ng-zorro-antd/modal";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {DataxAddStep4Component, ISubDetailTransferMeta} from "../../base/datax.add.step4.component";
import {PluginsComponent} from "../plugins.component";
import {BasicTuplesViewComponent, UdfDesc} from "./basic.tuples.view.component";
import {TuplesProperty} from "../plugin/type.utils";
import {BasicFormComponent} from "../basic.form.component";

/**
 * serverSide mapper: com.qlangtech.tis.plugin.datax.transformer.RecordTransformer
 */
export interface RecordTransformer extends ReaderColMeta {
  /**
   * udf relevant，server side plugin: com.qlangtech.tis.plugin.datax.transformer.UDFDefinition
   */
  udf: Item;
  udfError: string;
  udfDescLiteria: Array<UdfDesc>;

  /**
   * target column relevant, server side plugin: com.qlangtech.tis.plugin.datax.transformer.TargetColumn
   */
  // target: Item;
  // targetError: string;
  // targetDescLiteria: Array<UdfDesc>;
}

export class TransformerRuleTabletView implements TuplesProperty {

  /**
   *
   * @param _mcols 目标表已经设定的转换规则集合
   * @param _typeMetas 可用的jdbc类型集合
   * @param _sourceTabCols 目标表可选的列
   */
  constructor(public selectedTab: string, private _mcols: Array<RecordTransformer>, private _typeMetas: Array<DataTypeMeta>
  ) {
    this._mcols.forEach((t) => {
      if (!t.ip) {
        t.ip = new ItemPropVal();
      }
    });
  }

  viewType(): TuplesPropertyType {
    return TuplesPropertyType.TransformerRules;
  }

  get mcols(): Array<ReaderColMeta> {
    return this._mcols;
  }

  get typeMetas(): Array<DataTypeMeta> {
    return this._typeMetas;
  }


}

@Component({
  selector: "transformer-rules",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!--*ngIf="transformerUDFdescriptors.length>0"-->
    <tis-page [rows]="transformerRules" [tabSize]="'small'"
              [bordered]="true"
              [showPagination]="false">
      <page-row-assist>
        <ng-template let-u='r'>
          <p class="row-assist">
            <!--class: RowAssist-->


          </p>
        </ng-template>
      </page-row-assist>
      <page-header *ngIf="!readonly">
        <nz-space>
          <button *nzSpaceItem nz-button nzSize="small" nz-tooltip
                  nzTooltipTitle="添加一个新的处理器"
                  nzType="primary" (click)="addRule()"><span nz-icon nzType="appstore-add"
                                                             nzTheme="outline"></span>添加
          </button>

          <button *nzSpaceItem nz-button [disabled]="!deleteBtnDisable" nzDanger nzSize="small" nz-tooltip
                  nzTooltipTitle="从列表中删除一个已有的处理器"
                  nzType="default" (click)="deleteRule()"><span nz-icon nzType="delete"
                                                                nzTheme="outline"></span>删除
          </button>
        </nz-space>
      </page-header>

      <tis-col *ngIf="!readonly" title="选择" width="5">
        <ng-template let-u='r'>
          <nz-form-control>
            <label nz-checkbox nzSize="small" [(ngModel)]="u.disable"></label>
          </nz-form-control>
        </ng-template>
      </tis-col>

      <tis-col title="处理器" width="35">
        <ng-template let-u='r'>
          <div [ngClass]="{'ant-form-item-has-error':!!u.udfError}">
            <tis-plugin-add-btn [disabled]="this.readonly" [ngClass]="{'ant-input':!!u.udfError}" [btnSize]="'small'"
                                (addPlugin)="tarnsformerSet(u,$event)"
                                (primaryBtnClick)="updateTransformerRule(u)"
                                (afterPluginAddClose)="afterPluginAddClose()"
                                [extendPoint]="transformerExtendPoint"
                                [descriptors]="this.transformerUDFdescriptors" [initDescriptors]="false">
              <span nz-icon nzType="edit" nzTheme="outline"></span>

              <ng-container [ngSwitch]="!!u.udf && !!u.udf.dspt">
                <span *ngSwitchCase="true">{{u.udf.dspt.displayName}}</span>
                <span *ngSwitchDefault>设置</span>
              </ng-container>
            </tis-plugin-add-btn>
            <span *ngIf="u.udfError" style="color: red;">{{u.udfError}}</span>

          </div>
        </ng-template>
      </tis-col>


      <tis-col title="描述">
        <ng-template let-u='r'>
          <div class="item-block item-block-absolute" *ngIf="u.udfDescLiteria">
            <h4><span nz-icon style="font-weight: bold" [nzType]="u.udf.dspt.endtype"
                      nzTheme="fill"></span>&nbsp;{{u.udf.dspt.displayName}}:</h4>
            <udf-desc-literia [descAry]="u.udfDescLiteria"></udf-desc-literia>

            <div *ngIf="!readonly" class="absolute-btn-element">
              <button nz-button nzType="default" (click)="updateTransformerRule(u)" nzSize="small"><span nz-icon
                                                                                                         nzType="edit"
                                                                                                         nzTheme="outline"></span>编辑
              </button>
            </div>
          </div>
        </ng-template>
      </tis-col>
    </tis-page>
  `
  , styles: [
    `
      .item-block-absolute {
        position: relative;
      }

      .absolute-btn-element {
        position: absolute; /* 设置为absolute以实现绝对定位 */
        top: 5px; /* 距离容器顶部50像素 */
        right: 20px; /* 距离容器左侧50像素 */
        width: 50px;
        height: 100px;
      }


      .container {
        display: flex;
        flex-wrap: nowrap;
        padding: 8px;
      }

      .add-item {
        flex: 0 0 auto;
        padding: 8px;
        display: block;
      }

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
export class TransformerRulesComponent extends BasicTuplesViewComponent implements OnInit//implements AfterContentInit, OnDestroy
{

  @Input()
  readonly: boolean = false;

  @Output()
  tabletViewChange = new EventEmitter<TransformerRuleTabletView>();

  transformerExtendPoint = 'com.qlangtech.tis.plugin.datax.transformer.UDFDefinition';


  transformerUDFdescriptors: Array<Descriptor> = [];

  //sourceTabCols: Array<CMeta> = [];

  transformerRules: Array<RecordTransformer>
  // transformerRules :
  transformerRulesView: TransformerRuleTabletView;

  constructor(tisService: TISService, modalService: NzModalService, notification: NzNotificationService, private cd: ChangeDetectorRef) {
    super(tisService, modalService, notification);

  }


  get deleteBtnDisable(): boolean {

    for (let t of this.transformerRules) {
      if (t.disable) {
        return true;
      }
    }
    return false;
  }

  @Input()
  set error(errors: Array<any>) {
    if (!Array.isArray(errors)) {
      return;
    }
    // console.log(errors);
    // KEY_DOC_FIELD_SPLIT_METAS
    let err: { name: string, };

    this.transformerRules.forEach((rule) => {
      rule.ip.error = null;
      rule.udfError = null;
    });

    for (let idx = 0; idx < errors.length; idx++) {
      let colMeta: RecordTransformer = this.transformerRules[idx];
      if (!colMeta) {
        continue;
      }
      err = errors[idx];
      for (let key in err) {
        switch (key) {
          case "target": {
            colMeta.ip.error = err[key];
            break;
          }
          case "udf": {
            colMeta.udfError = err[key];
            break;
          }
          default:
            console.log(key);
          // throw new Error("error key:" + key);
        }
      }

    }
  }

  @Input()
  set colsMeta(colsMeta: Array<ReaderColMeta>) {
    this.transformerRules = <Array<RecordTransformer>>colsMeta;
  }

  @Input()
  public set tabletView(view: TuplesProperty) {
    super.tabletView = (view);
    // console.log(view);
    this.transformerRulesView = <TransformerRuleTabletView>view;
    // this.sourceTabCols = transformerRules.sourceTabCols;
    // console.log(this.sourceTabCols);
    //  this.cd.detectChanges();
  }

  ngOnInit(): void {
    this.initializeTransformersAndDesciptors(true);

  }

  initializeTransformersAndDesciptors(initializeRules: boolean) {
    let m: PluginType = {
      name: "transformerUDF",
      require: true,
      extraParam: this.tisService.selectedTab ? this.tisService.selectedTab.dataXReaderTargetName : (EXTRA_PARAM_DATAX_NAME + this.tisService.currentApp.name),
      descFilter:
        {
          localDescFilter: (desc: Descriptor) => true
        }
    };

    let meta = <ISubDetailTransferMeta>{id: this.transformerRulesView.selectedTab};

    /**
     * 获取UDF Transformer
     */
    DataxAddStep4Component.processSubFormHeteroList(this, m, meta, null)
      .then((hlist: HeteroList[]) => {

        hlist.forEach((h) => {
          this.transformerUDFdescriptors = Array.from(h.descriptors.values());
          if (initializeRules) {
            this.transformerRules.forEach((rule) => {
              let desc = h.descriptors.get(rule.udf.impl);
              if (!desc) {
                console.log(h.descriptors);
                throw new Error("desc impl:" + rule.udf.impl + " relevant desc can not be null");
              }

              let udf: any = rule.udf;

              let newUdf: Item = Object.assign(new Item(desc), {vals: udf.vals});
              newUdf.wrapItemVals();
              // rule.udfDescLiteria =
              rule.udf = newUdf;
              rule.udfDescLiteria = <Array<UdfDesc>>udf.literia
            });
          }
        })
        this.cd.detectChanges();
      });


    this.cd.detectChanges();
  }

  updateTransformerRule(rtransformer: RecordTransformer) {

    let udfItem = rtransformer.udf;
    if (!udfItem) {
      return;
    }
    // console.log(udfItem);
    //console.log(udfItem);
    TransformerRulesComponent.openTransformerRuleDialog(this, udfItem.dspt, udfItem).then((biz) => {
      rtransformer.udf = biz.item;
      rtransformer.udfError = null;
      rtransformer.udfDescLiteria = biz.descLiteria;
    }).finally(this.freshController);
  }


  private freshController = () => {
    let basicCpt = this;
    //console.log("finally");
    basicCpt.transformerRules = [...basicCpt.transformerRules];
    basicCpt.transformerUDFdescriptors = [...basicCpt.transformerUDFdescriptors];
    // basicCpt.targetColumnDescriptors = [...basicCpt.targetColumnDescriptors];
    basicCpt.cd.detectChanges();

  }


  tarnsformerSet(rtransformer: RecordTransformer, desc: Descriptor) {
    //console.log([rtransformer, desc]);
    TransformerRulesComponent.openTransformerRuleDialog(this, desc).then((biz) => {
      // console.log(biz);
      rtransformer.udf = biz.item;
      rtransformer.udfError = null;
      rtransformer.udfDescLiteria = biz.descLiteria;
    }).finally(this.freshController);

  }

  static openTransformerRuleDialog(basicCpt: BasicFormComponent, desc: Descriptor, item?: Item)
    : Promise<{ item: Item, descLiteria: Array<UdfDesc> }> {
    let opt = new SavePluginEvent();
    // opt.serverForward = "coredefine:datax_action:trigger_fullbuild_task";

    // const basicCpt: TransformerRulesComponent = this;

    let p = new Promise<{ item: Item, descLiteria: Array<UdfDesc> }>(function (resolve, reject) {
      // rtransformer.udf.dspt.displayName
      PluginsComponent.openPluginDialog({
          // saveBtnLabel: '触发构建',
          item: item,
          shallLoadSavedItems: false, savePluginEventCreator: () => {
            return opt;
          }
        }
        , basicCpt, desc
        , {name: 'noStore', require: true}
        , `设置 ${desc.displayName}`
        , (_, biz) => {
          //  console.log(biz);

          let newUdf: Item = Object.assign(new Item(desc), {vals: biz});
          newUdf.wrapItemVals();

          //  console.log([biz,newUdf]);
          // rtransformer.udf = newUdf;
          // rtransformer.udfError = null;
          // rtransformer.udfDescLiteria = <Array<string>>biz.literia;

          resolve({item: newUdf, descLiteria: <Array<UdfDesc>>biz.literia});


        });
    });

    return p;
  }

  targetColChange(rule: ReaderColMeta, newColName: string) {
    // console.log(event);
    // let cmeta: CMeta = this.sourceTabCols.find((c) => c.name === newColName);
    // if (cmeta) {
    //   rule.ip.error = null;
    //   rule.type = cmeta.type;
    // }
  }

  /**
   * 添加一个规则
   */
  addRule() {

    let rule = <RecordTransformer>{};
    this.transformerRules.push(rule);
    this.transformerRules = [...this.transformerRules];
    this.emitNewTransformerRuleTabletView();
  }

  private emitNewTransformerRuleTabletView() {
    this.tabletViewChange.emit(new TransformerRuleTabletView(this.transformerRulesView.selectedTab, this.transformerRules, this._view.typeMetas));
  }

  deleteRule() {
    let newRules: Array<RecordTransformer> = [];
    this.transformerRules.forEach((rule) => {
      if (!rule.disable) {
        newRules.push(rule);
      }
    })

    this.transformerRules = newRules;
    this.emitNewTransformerRuleTabletView();
  }

  afterPluginAddClose() {
    this.initializeTransformersAndDesciptors(false);
  }
}
