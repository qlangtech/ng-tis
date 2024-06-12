import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from "@angular/core";
import {BasicTuplesViewComponent, UdfDesc} from "./basic.tuples.view.component";
import {
  CMeta,
  DataTypeDesc,
  DataTypeMeta,
  Descriptor,
  EXTRA_PARAM_DATAX_NAME,
  HeteroList,
  Item,
  ItemPropVal,
  PluginMeta,
  ReaderColMeta,
  TuplesPropertyType
} from "../tis.plugin";
import {TISService} from "../tis.service";
import {NzModalService} from "ng-zorro-antd/modal";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {TuplesProperty} from "../plugin/type.utils";
import {DataxAddStep4Component, ISubDetailTransferMeta} from "../../base/datax.add.step4.component";
import {TransformerRulesComponent} from "./transformer.rules.component";


export interface JdbcTypeProp extends ReaderColMeta {

  /**
   * target column relevant, server side plugin: com.qlangtech.tis.plugin.datax.transformer.TargetColumn
   */
 // target: Item | string;
  nameError: string;
  nameDescLiteria: Array<UdfDesc>;
}

export class JdbcTypePropsProperty implements TuplesProperty {

  /**
   * _mcols 中的属性映射到plugn bean中是否为非collection的
   * @param _mcols
   * @param isCollection
   * @param _typeMetas
   * @param tabColsMapper 已经存在的表的（名称->jdbc）映射
   * @param dftType 默认字段类型
   */
  constructor(private _mcols: Array<JdbcTypeProp>, public isCollection: boolean//
    , private _typeMetas: Array<DataTypeMeta> //
    , private tabColsMapper: Map<string, CMeta> //
    , public dftType: DataTypeDesc) {
    if (!this.isCollection) {
      if (_mcols.length < 1) {
        _mcols.push(<JdbcTypeProp>{});
      }
    }

    this._mcols.forEach((t) => {
      if (!t.ip) {
        t.ip = new ItemPropVal();
      }
    });

  }

  public getTabColInExistMapper(colName: string): CMeta {
    return this.tabColsMapper.get(colName);
  }

  public viewType(): TuplesPropertyType {
    return TuplesPropertyType.JdbcTypeProps;
  }

  get mcols(): Array<JdbcTypeProp> {
    return this._mcols;
  }

  set mcols(value: Array<JdbcTypeProp>) {
    this._mcols = value;
  }

  get typeMetas(): Array<DataTypeMeta> {
    return this._typeMetas;
  }


  set typeMetas(value: Array<DataTypeMeta>) {
    this._typeMetas = value;
  }
}

@Component({
  selector: "jdbc-type-props",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container [ngSwitch]="_jdbcTypeProps.isCollection">
      <ng-container *ngSwitchCase="false">
        <div class="jdbc-type-single-father" *ngFor="let u of this._jdbcTypeProps.mcols">

          <div [ngClass]="{'ant-form-item-has-error':!!u.nameError}">
            <tis-plugin-add-btn [ngClass]="{'ant-input':!!u.nameError}" [btnSize]="'small'"
                                (addPlugin)="setTargetColumn(u,$event)"
                                (primaryBtnClick)="updateTargetColumn(u)"
                                [extendPoint]="targetColumnExtendPoint"
                                [descriptors]="this.targetColumnDescriptors" [initDescriptors]="false">
              <span nz-icon nzType="edit" nzTheme="outline"></span>

              <ng-container [ngSwitch]="!!u.name">
                <span *ngSwitchCase="true">{{u.name.dspt.displayName}}</span>
                <span *ngSwitchDefault>设置</span>
              </ng-container>
              <span nz-icon nzType="down"></span>
            </tis-plugin-add-btn>
            <span *ngIf="u.nameError" style="color: red;">{{u.nameError}}</span>
<!--            <nz-tag nzColor="default" *ngIf="u.nameDescLiteria">-->
<!--              &nbsp;-->
<!--              <ng-container *ngFor="let literia of u.nameDescLiteria">-->
<!--                <span>{{literia}}</span><br/>-->
<!--              </ng-container>-->
<!--            </nz-tag>-->
            <udf-desc-literia [descAry]="u.nameDescLiteria"></udf-desc-literia>

          </div>
          <div>
            <jdbc-type [disable]="u.disable" [type]="u.type" [typeMetas]="this.typeMetas"></jdbc-type>
          </div>
        </div>
      </ng-container>
      <tis-page *ngSwitchCase="true" [rows]="_jdbcTypeProps.mcols" [tabSize]="'small'" [bordered]="true"
                [showPagination]="false">
        <page-header>
          <nz-space>
            <button *nzSpaceItem nz-button nzSize="small" nz-tooltip
                    nzTooltipTitle="数据表中可能添加了新的字段，或者删除了某列，将以下Schema定义与数据库最新Schema进行同步"
                    nzType="primary" (click)="addJdbcCol()"><span nz-icon nzType="appstore-add"
                                                                  nzTheme="outline"></span>添加
            </button>

            <button *nzSpaceItem nz-button nzDanger nzSize="small" nz-tooltip
                    nzTooltipTitle="数据表中可能添加了新的字段，或者删除了某列，将以下Schema定义与数据库最新Schema进行同步"
                    nzType="default" (click)="deleteJdbcCol()"><span nz-icon nzType="delete"
                                                                     nzTheme="outline"></span>删除
            </button>
          </nz-space>

        </page-header>

        <tis-col title="Index" width="3">
          <ng-template let-u='r'>
            <nz-form-control>
              <label nz-checkbox nzSize="small" [(ngModel)]="u.disable"></label>
            </nz-form-control>
          </ng-template>
        </tis-col>

        <tis-col title="Name" width="48">
          <ng-template let-u='r'>
            <nz-form-control>
              <nz-form-item>
                <nz-form-control [nzValidateStatus]="u.ip.validateStatus"
                                 [nzHasFeedback]="u.ip.hasFeedback"
                                 [nzErrorTip]="u.ip.error">
                  <input nz-input placeholder="column name" [(ngModel)]="u.name"/>

                </nz-form-control>
              </nz-form-item>
            </nz-form-control>
          </ng-template>
        </tis-col>

        <tis-col title="Type">
          <ng-template let-u='r'>
            <nz-form-control>
              <jdbc-type  [type]="u.type" [typeMetas]="this.typeMetas"></jdbc-type>
            </nz-form-control>
          </ng-template>
        </tis-col>

      </tis-page>
    </ng-container>



  `
  , styles: [
    `
      .jdbc-type-single-father {
        display: flex;
      }

      .jdbc-type-single-father div {
        width: 50%;
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
export class JdbcTypePropsComponent extends BasicTuplesViewComponent implements OnInit {

  _jdbcTypeProps: JdbcTypePropsProperty;

  targetColumnExtendPoint = 'com.qlangtech.tis.plugin.datax.transformer.TargetColumn';
  targetColumnPluginMeta: PluginMeta =
    {
      name: "target-column",
      require: true
      , extraParam: EXTRA_PARAM_DATAX_NAME + "mysql_mysql"
      , descFilter:
        {
          localDescFilter: (desc: Descriptor) => true
        }
    }
  targetColumnDescriptors: Array<Descriptor> = [];

  constructor(tisService: TISService, modalService: NzModalService, notification: NzNotificationService, private cd: ChangeDetectorRef) {
    super(tisService, modalService, notification);
  }



  private openJdbcTypePropAssistDialog(prop: JdbcTypeProp, desc: Descriptor, item?: Item) {
    let basicCpt = this;
    TransformerRulesComponent.openTransformerRuleDialog(basicCpt, desc, item)
      .then((biz) => {

        prop.name = biz.item;
        prop.nameError = null;
        prop.nameDescLiteria = biz.descLiteria;
        if (!prop.name.pk) {
          throw new Error("target relevant pk prop can not be null");
        }

        let existCol = this._jdbcTypeProps.getTabColInExistMapper(prop.name.pk.primary);
        if (existCol) {
          prop.type = existCol.type;
        } else {
          prop.type = this._jdbcTypeProps.dftType;
        }

      }).finally(() => {

      console.log("finally");
      // basicCpt.transformerRules = [...basicCpt.transformerRules];
      // basicCpt.transformerUDFdescriptors = [...basicCpt.transformerUDFdescriptors];
      basicCpt.targetColumnDescriptors = [...basicCpt.targetColumnDescriptors];
      basicCpt.cd.detectChanges();

    });
  }

  setTargetColumn(prop: JdbcTypeProp, desc: Descriptor) {
    this.openJdbcTypePropAssistDialog(prop, desc);
  }

  updateTargetColumn(prop: JdbcTypeProp) {

    let target = <Item>prop.name;
    if (!target) {
      return;
    }

    console.log(target);
    this.openJdbcTypePropAssistDialog(prop, target.dspt, target);
    // TransformerRulesComponent.openTransformerRuleDialog(this, target.dspt, target)
    //   .then((biz) => {
    //
    //     rtransformer.target = biz.item;
    //     rtransformer.targetError = null;
    //     rtransformer.targetDescLiteria = biz.descLiteria;
    //   }).finally(this.freshController);
  }


  ngOnInit(): void {
    let meta = <ISubDetailTransferMeta>{id: 'emp_photo'};
    /**
     * 获取Target Cols
     */
    DataxAddStep4Component.processSubFormHeteroList(this, this.targetColumnPluginMeta, meta, null)
      .then((hlist: HeteroList[]) => {
        // this.openSubDetailForm(meta, pluginMeta, hlist);
        // console.log(hlist);

        hlist.forEach((h) => {

          this.targetColumnDescriptors = Array.from(h.descriptors.values());

          if(!this._jdbcTypeProps.isCollection){
            this._jdbcTypeProps.mcols.forEach((rule) => {
            let nameProp :Item = <Item> rule.name;
              let desc = h.descriptors.get(nameProp.impl);
              if (!desc) {
                console.log(h.descriptors);
                throw new Error("desc impl:" + nameProp.impl + " relevant desc can not be null");
              }

              let target: any = nameProp;

              let newName: Item = Object.assign(new Item(desc), {vals: target});
              newName.wrapItemVals();
              // rule.udfDescLiteria =
              rule.name = newName;
              rule.nameDescLiteria = <Array<UdfDesc>>target.literia
            });
          }

          // console.log(   this.transformerRules);
        });
        this.cd.detectChanges();
      });
  }

  @Input()
  public set tabletView(view: TuplesProperty) {
    super.tabletView = (view);
    console.log(view);
    this._jdbcTypeProps = <JdbcTypePropsProperty>view;
    // this.sourceTabCols = transformerRules.sourceTabCols;
    // console.log(this.sourceTabCols);
    //  this.cd.detectChanges();
  }

  set colsMeta(colsMeta: Array<ReaderColMeta>) {
  }

  addJdbcCol() {
    let rule = <JdbcTypeProp>{name: null, ip: new ItemPropVal(),type: this._jdbcTypeProps.dftType};

    this._jdbcTypeProps.mcols.push(rule);
    this._jdbcTypeProps.mcols = [...this._jdbcTypeProps.mcols];

  }

  deleteJdbcCol() {
    let jdbcProps: Array<JdbcTypeProp> = [];
    this._jdbcTypeProps.mcols.forEach((p) => {
      if (!p.disable) {
        jdbcProps.push(p);
      }
    })

    this._jdbcTypeProps.mcols = jdbcProps;
  }

  @Input()
  set error(errors: Array<any>) {
    if (!Array.isArray(errors)) {
      return;
    }
    console.log(errors);
    // KEY_DOC_FIELD_SPLIT_METAS
    let err: { name: string, };

   let fields :Array<JdbcTypeProp> =  this._jdbcTypeProps.mcols;
    fields.forEach((field) => {
      field.ip.error = null;
      field.nameError = null;
    });

    for (let idx = 0; idx < errors.length; idx++) {
      let colMeta: JdbcTypeProp = fields[idx];
      if (!colMeta) {
        continue;
      }
      err = errors[idx];
      for (let key in err) {
        switch (key) {
          case "name": {
            colMeta.ip.error = err[key];
            break;
          }
          case "type": {
           // colMeta.udfError = err[key];
            break;
          }
          default:
            console.log(key);
          // throw new Error("error key:" + key);
        }
      }

    }
  }
}
