import {TisResponseResult, TISService} from '../service/tis.service';
import {ActivatedRoute, Params} from '@angular/router';
import {Component, EventEmitter, Input, OnInit, Optional, Output, Type} from '@angular/core';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
// import JQuery from 'jquery';
// @ts-ignore
import * as NProgress from 'nprogress/nprogress.js';
import 'nprogress/nprogress.css';
import {WorkflowAddComponent} from "../offline/workflow.add.component";
import {NzModalService} from "ng-zorro-antd/modal";
// import {CascaderOption} from "ng-zorro-antd";

/**
 * Created by baisui on 2017/4/12 0012.
 */

declare var jQuery: any;

// declare var NProgress: any;
export class BasicFormComponent {
  result: any;
  // 表单是否禁用

  public formDisabled = false;
  // // 当前上下文中使用的索引
  // currIndex: CurrentCollection;

  constructor(protected tisService: TISService, private modalService: NgbModal) {
  }

  private webExecuteCallback = (r: TisResponseResult): TisResponseResult => {
    this.formDisabled = false;
    // console.log("webExecuteCallback")
    NProgress.done();
    return r;
  }
  get appNotAware(): boolean {
    return !this.tisService.currentApp;
  }
  protected clearProcessResult(): void {
    this.result = {msg: [], errormsg: []};
  }

  public processResult(result: any): void {
    // this.result = result;
    // setTimeout(() => {
    //   this.clearProcessResult();
    // }, 5000);
    return this.processResultWithTimeout(result, 10000);
  }

  // 显示执行结果
  protected processResultWithTimeout(result: any, timeout: number): void {
    this.result = result;
    if (timeout > 0) {
      setTimeout(() => {
        this.clearProcessResult();
      }, timeout);
    }
  }

  protected submitForm(url: string, form: any): void {
    this.formDisabled = true;
    NProgress.start();
    this.clearProcessResult();
    this.tisService.httpPost(url
      , jQuery(form).serialize()).then(result => {
      this.processResult(result);
      this.formDisabled = false;
    });
  }

  public openLargeDialog(component: any): NgbModalRef {
    const modalRef: NgbModalRef = this.modalService.open(
      component, {windowClass: 'schema-edit-modal', backdrop: 'static'});
    return modalRef;
  }

  public openNormalDialog(component: any): NgbModalRef {
    const modalRef: NgbModalRef = this.modalService.open(component
      , {size: 'xl', backdrop: 'static'});
    return modalRef;
  }

  // 设置当前上下文中的应用
  protected set currentApp(app: CurrentCollection) {
    this.tisService.currentApp = app;
  }

  // 发送http post请求
  protected httpPost(url: string, body: string): Promise<TisResponseResult> {

    // setTimeout(() => {
      this.formDisabled = true;
    // });
    NProgress.start();
    this.clearProcessResult();
    return this.tisService.httpPost(url, body).then(this.webExecuteCallback).catch((e) => {
      this.formDisabled = false;
      return e;
    });
  }

  // 发送json表单
  protected jsonPost(url: string, body: any): Promise<TisResponseResult> {
    // setTimeout(() => {
    this.formDisabled = true;
    // });
    NProgress.start();
    this.clearProcessResult();
    return this.tisService.jsonPost(url, body).then(this.webExecuteCallback).catch((e) => {
      this.formDisabled = false;
      return e;
    });
  }

  protected jsonp(url: string): Promise<TisResponseResult> {
    this.formDisabled = true;
    NProgress.start();
    return this.tisService.jsonp(url).then(this.webExecuteCallback).catch((e) => {
      this.formDisabled = false;
      return e;
    });
  }

  public jPost(url: string, o: any): Promise<TisResponseResult> {
    this.formDisabled = true;
    NProgress.start();
    this.clearProcessResult();
    return this.tisService.jPost(url, o).then(this.webExecuteCallback).catch((e) => {
      this.formDisabled = false;
      return e;
    });
  }

}


// 可选项
export class Option {
  constructor(public value: string, public label: string) {
  }
}

export class NodeMeta {


  constructor(public type: string, private img: string
    , private size: number[], public label: string, public compRef: Type<any>) {
  }

  get width(): number {
    return this.size[0];
  }

  get height(): number {
    return this.size[1];
  }

  get imgPath(): string {
    return '/images/icon/' + this.img;
  }
}


export abstract class BasicSidebarDTO {
  protected constructor(public nodeMeta: NodeMeta) {
  }
}


@Component({
  selector: 'sidebar-toolbar',
  styles: [
      ` .sidebar {
          border-bottom: thin solid #999999;
          padding: 0 0 5px 0;
          margin: 0 0 18px 0;
      }
    `
  ],
  template: `
      <div class="sidebar">
          <button nz-button nzType="danger" (click)="_deleteNode()">删除</button>
          <div style="float: right;">
              <button nz-button nzType="primary" (click)="_saveClick()">保存</button>&nbsp;<button nz-button nzType="default" (click)="_closeSidebar()">关闭</button>
          </div>
      </div>
      <div style="clear: both"></div>
  `
})
export class SideBarToolBar extends BasicFormComponent {
  @Output() save = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() close = new EventEmitter<any>();

  constructor(tisService: TISService, modalService: NgbModal, private ngModalService: NzModalService) {
    super(tisService, modalService);
  }

  _deleteNode() {
    this.ngModalService.confirm({
      nzTitle: '<i>请确认是否要删除该节点?</i>',
      nzContent: '<b>删除之后不可恢复</b>',
      nzOnOk: () => {
        this.delete.emit();
      }
    });
  }

  _closeSidebar() {
    this.close.emit();
  }

  _saveClick() {
    this.save.emit();
  }
}


export abstract class BasicSideBar extends BasicFormComponent {
  @Output() saveClick = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<any>();
  @Input() nodeMeta: NodeMeta;
  @Input() g6Graph: any;
  @Input() parentComponent: IDataFlowMainComponent; // WorkflowAddComponent;

  protected constructor(tisService: TISService, modalService: NgbModal) {
    super(tisService, modalService);
  }

  _saveClick(): void {
    this.saveClick.emit();
  }

  _closeSidebar(): void {
    this.onClose.emit();
  }

  public abstract initComponent(addComponent: WorkflowAddComponent, selectNode: BasicSidebarDTO): void;

  public abstract subscribeSaveClick(graph: any, $: any, nodeid: string, addComponent: WorkflowAddComponent, evt: any): void;
}

export interface IDataFlowMainComponent {
  readonly dumpTabs: Map<string, DumpTable>;
  readonly joinNodeMap: Map<string /*id*/, JoinNode>;
}

export abstract class AppFormComponent extends BasicFormComponent implements OnInit {
  // private appTisService: AppTISService;

  protected constructor(tisService: TISService, protected route: ActivatedRoute, modalService: NgbModal) {
    super(tisService, modalService);
    // this.appTisService = tisService;
  }

  ngOnInit(): void {
    this.route.params
      .subscribe((params: Params) => {
        // if (this.tisService instanceof AppTISService) {
        let appTisService: TISService = this.tisService;
        if (!appTisService.currentApp && params['name']) {
          this.currentApp = new CurrentCollection(0, params['name']);
        }
        this.initialize(appTisService.currentApp);
      });
  }

  protected abstract initialize(app: CurrentCollection): void ;
}

export class CurrentCollection {
  constructor(private id: number, public name: string) {
  }

  public get appid() {
    return this.id;
  }

  public get appName() {
    return this.name;
  }
}


// sidebar 在与主页面传递的dto对象
export class DumpTable extends BasicSidebarDTO {
  constructor(nodeMeta: NodeMeta, public nodeid: string, public sqlcontent?: string, public dbid?: string, public tabid?: string, public tabname?: string) {
    super(nodeMeta);
  }

  public get cascaderTabId(): string {
    return this.tabid + '%' + this.tabname;
  }
}

/**
 * 记录表是否是索引主表，是否需要监听增量更新信息
 */
export class ERMetaNode extends BasicSidebarDTO {

  public columnTransferList: ColumnTransfer[] = [];
  // 主索引表
  public primaryIndexTab = false;
  // 当primaryIndexTab为true时，primaryIndexColumnName不能为空
  public primaryIndexColumnNames: PrimaryIndexColumnName[] = [new PrimaryIndexColumnName(null, false)];

  // 监听增量变更
  public monitorTrigger = true;

  public timeVerColName: string;

  constructor(public dumpnode: DumpTable, public topologyName: string) {
    super(null);
  }
}

export class PrimaryIndexColumnName {
  public delete = false;

  constructor(public name: string, public pk: boolean) {
  }
}

export class ColumnTransfer {
  public checked = false;

  constructor(public colKey: string, public transfer: string, public param: string) {
  }
}

export class ERRuleNode extends BasicSidebarDTO {
  public cardinality: string;
  linkKeyList: LinkKey[] = [];

  constructor(public  rel: { id: string, 'sourceNode': DumpTable, 'targetNode': DumpTable, 'linkrule': { linkKeyList: LinkKey[], cardinality: string } }, public topologyName: string) {
    super(null);
    this.cardinality = rel.linkrule.cardinality;
    this.linkKeyList = rel.linkrule.linkKeyList;
  }

  public get sourceNode(): DumpTable {
    return this.rel.sourceNode;
  }

  public get targetNode(): DumpTable {
    return this.rel.targetNode;
  }
}


export class JoinNode extends BasicSidebarDTO {
  public dependencies: Option[] = [];
  public edgeIds: string[] = [];

  constructor(nodeMeta: NodeMeta, public id?: string, public exportName?: string, public position?: Pos, public sql?: string) {
    super(nodeMeta);
  }

  public addDependency(o: Option): void {
    this.dependencies.push(o);
  }

  public addEdgeId(id: string): void {
    this.edgeIds.push(id);
  }
}


export class NodeMetaConfig {
  constructor(public exportName: string, public id: string, public type: string, public position: Pos
    , public sql: string, public dependencies: NodeMetaDependency[]) {
  }
}


export class Pos {
  constructor(public x: number, public y: number) {

  }
}

export class NodeMetaDependency {
  constructor(public id: string, public tabid: string, public dbid: string
    , public dbName: string, public name: string, public extraSql: string
    , public position?: Pos, public type?: string) {

  }
}

export class LinkKey {
  public checked = false;

  constructor(public parentKey: string, public childKey: string) {
  }
}


