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
import {DataxAddStep4Component} from "../../base/datax.add.step4.component";
import {TransformerRulesComponent} from "./transformer.rules.component";
import {ISubDetailTransferMeta, processSubFormHeteroList} from "../ds.utils";


export interface JdbcTypeProp extends ReaderColMeta {

  /**
   * target column relevant, server side plugin: com.qlangtech.tis.plugin.datax.transformer.TargetColumn
   */
  // target: Item | string;
  nameError: string;
  nameDescLiteria: Array<UdfDesc>;
}

export class JdbcTypePropsProperty implements TuplesProperty {

  private readonly _tabCols: Array<CMeta>;

  /**
   * _mcols 中的属性映射到plugn bean中是否为非collection的
   * @param _mcols
   * @param isCollection
   * @param selectFromExistField 字段类型是否呈现selector 下列列表的形式，下来列表的可选表从当前选中表的列选择
   * @param dftListElementDesc 当 isCollection 为true时候默认的element的输入项目为virtualTargetColumn类型，Descriptor需要由服务端决定
   * @param _typeMetas
   * @param tabColsMapper 已经存在的表的（名称->jdbc）映射
   * @param dftType 默认字段类型
   */
  constructor(
    public selectedTab: string
    , private _mcols: Array<JdbcTypeProp> //
    , public isCollection: boolean //
    , public selectFromExistField: boolean
    , public dftListElementDesc: Descriptor //
    , private _typeMetas: Array<DataTypeMeta> //
    , private tabColsMapper: Map<string, CMeta> //
    , public dftType: DataTypeDesc) {
    this._tabCols = Array.from(tabColsMapper.values());
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

  public get tabCols(): Array<CMeta> {
    return this._tabCols;
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
                    nzTooltipTitle="添加一条新的拥有类型的新字段"
                    nzType="primary" (click)="addJdbcCol()"><span nz-icon nzType="appstore-add"
                                                                  nzTheme="outline"></span>添加
            </button>

            <button *nzSpaceItem nz-button nzDanger nzSize="small" nz-tooltip
                    nzTooltipTitle="从列表中删除一个已有的字段"
                    nzType="default" [disabled]="!deleteBtnDisable" (click)="deleteJdbcCol()"><span nz-icon
                                                                                                    nzType="delete"
                                                                                                    nzTheme="outline"></span>删除
            </button>
            <ng-container *ngIf="_jdbcTypeProps.selectFromExistField">
              <span *nzSpaceItem>
              <ng-container
                *ngTemplateOutlet="posChangeTpl;context:{changeRow:changableItem}"></ng-container></span>
            </ng-container>
          </nz-space>
          <ng-template #posChangeTpl let-row="changeRow">
            <button nz-button nz-dropdown nzSize="small" nz-tooltip [disabled]="!row"
                    nzTooltipTitle="改变列表中记录的前后顺序，只能选一条记录" [nzDropdownMenu]="menu">
              <span nz-icon nzType="swap" nzTheme="outline"></span> 移动
              <span nz-icon nzType="down"></span>
            </button>
            <nz-dropdown-menu #menu="nzDropdownMenu">
              <ul nz-menu>
                <li nz-menu-item (click)="changePos(true,row)">
                  <a><span nz-icon nzType="up" nzTheme="outline"></span>向上</a>
                </li>
                <li nz-menu-item (click)="changePos(false,row)">
                  <a><span nz-icon nzType="down" nzTheme="outline"></span>向下</a>
                </li>
              </ul>
            </nz-dropdown-menu>
          </ng-template>
        </page-header>

        <tis-col title="选择" width="9">
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
                  <ng-container [ngSwitch]="!!_jdbcTypeProps.selectFromExistField">
                    <input *ngSwitchCase="false" nz-input placeholder="column name"
                           [(ngModel)]="u.name.pk.primary"/>
                    <nz-select *ngSwitchCase="true" nzShowSearch nzAllowClear
                               nzPlaceHolder="Select a Column"
                               [(ngModel)]="u.name.pk.primary"
                               (ngModelChange)="targetColChange(u,$event)">
                      <nz-option nzLabel="请选择" [nzValue]="''"></nz-option>
                      <nz-option [nzLabel]="col.name" [nzValue]="col.name"
                                 *ngFor="let col of this._jdbcTypeProps.tabCols"></nz-option>
                    </nz-select>

                  </ng-container>

                </nz-form-control>
              </nz-form-item>
            </nz-form-control>
          </ng-template>
        </tis-col>

        <tis-col title="Type">
          <ng-template let-u='r'>
            <nz-form-control>
              <jdbc-type [disable]="_jdbcTypeProps.selectFromExistField" [type]="u.type"
                         [typeMetas]="this.typeMetas"></jdbc-type>
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

  targetColumnDescriptors: Array<Descriptor> = [];

  constructor(tisService: TISService, modalService: NzModalService, notification: NzNotificationService, private cd: ChangeDetectorRef) {
    super(tisService, modalService, notification);
    this.cd.detach();
  }

  get deleteBtnDisable(): boolean {

    for (let t of this._jdbcTypeProps.mcols) {
      if (t.disable) {
        return true;
      }
    }
    return false;
  }

  changePos(up: boolean, typeProp: JdbcTypeProp) {
    let rows: Array<JdbcTypeProp> = this._jdbcTypeProps.mcols;
    let idx = rows.findIndex((r) => r === typeProp);
    let changed = false;
    if (up) {
      // 向上移动
      if (idx > 0) {
        let pre = rows[idx - 1];
        rows[idx - 1] = typeProp;
        rows[idx] = pre;
        changed = true;
      }
    } else {
      // 向下移动
      if (idx < (rows.length - 1)) {
        let next = rows[idx + 1];
        rows[idx + 1] = typeProp;
        rows[idx] = next;
        changed = true;
      }
    }
    if (changed) {
      this._jdbcTypeProps.mcols = [...this._jdbcTypeProps.mcols];
    }
  }

  get changableItem(): JdbcTypeProp {
    let checkedCount = 0;
    let allCount = 0;
    let item: JdbcTypeProp = null;
    for (let t of this._jdbcTypeProps.mcols) {
      allCount++;
      if (t.disable) {
        item = t;
        checkedCount++;
      }
    }

    let result = (allCount > 1 && checkedCount == 1) ? item : null;
    //console.log(result);
    return result;
  }

  targetColChange(typeProp: JdbcTypeProp, newColName: string) {
    //console.log(event);
    let cmeta: CMeta = this._jdbcTypeProps.getTabColInExistMapper(newColName);//  this.sourceTabCols.find((c) => c.name === newColName);
    if (cmeta) {
      typeProp.ip.error = null;
      typeProp.type = cmeta.type;
    }
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
        console.log([existCol, prop.type, this._jdbcTypeProps, prop.name, prop.name.pk.primary])
      }).finally(() => {

      // console.log("finally");
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

    // console.log(target);
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
    let meta = <ISubDetailTransferMeta>{id: this._jdbcTypeProps.selectedTab};
    let targetColumnPluginMeta: PluginMeta =
      {
        name: "target-column",
        require: true,
        extraParam: this.tisService.selectedTab ? this.tisService.selectedTab.dataXReaderTargetName : (EXTRA_PARAM_DATAX_NAME + this.tisService.currentApp.name),
        descFilter:
          {
            localDescFilter: (desc: Descriptor) => true
          }
      }
    // console.log([meta,targetColumnPluginMeta]);
    /**
     * 获取Target Cols
     */
    processSubFormHeteroList(this, targetColumnPluginMeta, meta, null)
      .then((hlist: HeteroList[]) => {
        hlist.forEach((h) => {

          this.targetColumnDescriptors = Array.from(h.descriptors.values());

          //  if (!this._jdbcTypeProps.isCollection) {
          this._jdbcTypeProps.mcols.forEach((rule) => {
            let nameProp: Item = <Item>rule.name;

            let desc = h.descriptors.get(nameProp.impl);
            if (!desc) {
              console.log(h.descriptors);
              throw new Error("desc impl:" + nameProp.impl + " relevant desc can not be null");
            }

            let target: any = nameProp;
            // console.log(target);
            let newName: Item = Object.assign(new Item(desc), target);
            newName.wrapItemVals();
            // rule.udfDescLiteria =
            rule.name = newName;
            rule.nameDescLiteria = <Array<UdfDesc>>target.literia
          });
          //  }

          // console.log(   this.transformerRules);
        });

      }).finally(() => {
      this.cd.detectChanges();
      this.cd.reattach();
    });
  }

  @Input()
  public set tabletView(view: TuplesProperty) {
    super.tabletView = (view);
    //console.log(view);
    this._jdbcTypeProps = <JdbcTypePropsProperty>view;
    // this.sourceTabCols = transformerRules.sourceTabCols;
    // console.log(this.sourceTabCols);
    //  this.cd.detectChanges();
  }

  set colsMeta(colsMeta: Array<ReaderColMeta>) {
  }

  addJdbcCol() {
    //console.log(this.targetColumnDescriptors);

    let nameItem = Descriptor.createNewItem(this._jdbcTypeProps.dftListElementDesc, false);
    let type: DataTypeDesc = Object.assign({}, this._jdbcTypeProps.dftType)
    let rule = <JdbcTypeProp>{name: nameItem, ip: new ItemPropVal(), type: type};

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

    let fields: Array<JdbcTypeProp> = this._jdbcTypeProps.mcols;
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
