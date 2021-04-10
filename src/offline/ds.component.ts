/**
 * Created by baisui on 2017/3/29 0029.
 */
import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {TisResponseResult, TISService} from '../service/tis.service';
import {BasicFormComponent} from '../common/basic.form.component';
import {ActivatedRoute, Router} from '@angular/router';

import {DbAddComponent, DbPojo} from "./db.add.component";
import {TableAddComponent} from "./table.add.component";
import {NzFormatEmitEvent, NzModalRef, NzModalService, NzNotificationService, NzTreeNodeOptions, NzTreeComponent, NzTreeNode} from "ng-zorro-antd";
import {PluginsComponent} from "../common/plugins.component";
import {Descriptor, HeteroList, PluginMeta, PluginSaveResponse, PluginType} from "../common/tis.plugin";

const db_model_detailed = "detailed";
const db_model_facade = "facade";

@Component({
  template: `
      <tis-page-header title="数据源管理" [needRefesh]='false'>

          <!--
          <a routerLink="/offline/datasourcecommits" routerLinkActive="active">datasource变更历史</a>
          -->
      </tis-page-header>

      <nz-layout>
          <nz-sider [nzWidth]="300">
              <div class="btn-block">
                  <button style="width: 4em" nz-button nzSize="small" nz-dropdown [nzDropdownMenu]="dbAdd"><i class="fa fa-plus" aria-hidden="true"></i>
                      <i class="fa fa-database" aria-hidden="true"></i> <i nz-icon nzType="down"></i></button>
                  <nz-dropdown-menu #dbAdd="nzDropdownMenu">
                      <ul nz-menu>
                          <li nz-menu-item *ngFor="let d of datasourceDesc">
                              <a href="javascript:void(0)" (click)="addDbBtnClick(d)">{{d.displayName}}</a>
                          </li>
                      </ul>
                  </nz-dropdown-menu>
                  <button nz-button nz-dropdown nzSize="small" style="width: 4em" [nzDropdownMenu]="menu">
                      <i class="fa fa-plus" aria-hidden="true"></i>
                      <i class="fa fa-table" aria-hidden="true"></i>
                      <i nz-icon nzType="down"></i></button>
                  <nz-dropdown-menu #menu="nzDropdownMenu">
                      <ul nz-menu>
                          <li nz-menu-item>
                              <a href="javascript:void(0)" (click)="addTableBtnClick()">单个</a>
                          </li>
                          <!--
                          <li nz-menu-item>
                              <a href="javascript:void(0)">批量</a>
                          </li> -->
                      </ul>
                  </nz-dropdown-menu>

              </div>
              <nz-input-group [nzSuffix]="suffixIcon">
                  <input type="text" nz-input placeholder="Search" [(ngModel)]="searchValue"/>
              </nz-input-group>
              <ng-template #suffixIcon>
                  <i nz-icon nzType="search"></i>
              </ng-template>
              <nz-spin style="width:100%;min-height: 300px;" [nzSize]="'large'" [nzSpinning]="treeLoad">
                  <nz-tree #dbtree [nzData]="nodes"
                           [nzSearchValue]="searchValue"
                           (nzClick)="nzDSTreeClickEvent($event)"
                           (nzExpandChange)="nzEvent($event)"
                           (nzSearchValueChange)="nzEvent($event)">
                  </nz-tree>
              </nz-spin>
          </nz-sider>
          <nz-content>
              <nz-spin *ngIf="treeNodeClicked " style="width:100%;min-height: 200px" [nzSize]="'large'" [nzSpinning]="this.formDisabled">
                  <div *ngIf="selectedDb && selectedDb.dbId">

                      <tis-page-header [showBreadcrumbRoot]="false" size="sm" [title]="'数据库'">

                      </tis-page-header>

                      <nz-tabset [(nzSelectedIndex)]="selectedDbIndex" (nzSelectedIndexChange)="selectedIndexChange()" [nzTabBarExtraContent]="extraTemplate">
                          <nz-tab nzTitle="明细">
                              <tis-plugins (afterSave)="afterSave($event)" (afterInit)="afterPluginInit($event)" [errorsPageShow]="false"
                                           [formControlSpan]="20" [shallInitializePluginItems]="false" [showSaveButton]="updateMode" [disabled]="!updateMode" [plugins]="pluginsMetas"></tis-plugins>
                          </nz-tab>
                          <nz-tab *ngIf="facdeDb" [nzTitle]="'门面'">
                              <tis-plugins (afterSave)="afterSave($event)" (afterInit)="afterPluginInit($event)" [errorsPageShow]="false"
                                           [formControlSpan]="20" [shallInitializePluginItems]="false" [showSaveButton]="updateMode" [disabled]="!updateMode" [plugins]="facadePluginsMetas"></tis-plugins>
                          </nz-tab>
                      </nz-tabset>
                      <ng-template #extraTemplate>
                          <nz-space>
                              <nz-space-item *ngIf="supportFacade && !this.facdeDb">
                                  <button [disabled]="this.updateMode" nz-button nzType="default" nz-dropdown
                                          [nzDropdownMenu]="dbFacadeAdd" [disabled]="facdeDb != null">添加门面配置<i nz-icon nzType="down"></i></button>
                                  <nz-dropdown-menu #dbFacadeAdd="nzDropdownMenu">
                                      <ul nz-menu>
                                          <li nz-menu-item *ngFor="let d of facadeSourceDesc">
                                              <!--addDbBtnClick(d) -->
                                              <a href="javascript:void(0)" (click)="addFacadeDB(d)">{{d.displayName}}</a>
                                          </li>
                                      </ul>
                                  </nz-dropdown-menu>
                              </nz-space-item>
                              <nz-space-item>
                                  <button nz-button [disabled]="this.updateMode" (click)="editDb()"><i nz-icon nzType="edit" nzTheme="outline"></i>编辑</button>
                              </nz-space-item>
                              <nz-space-item>
                                  <button nz-button [disabled]="this.updateMode" nzType="danger" (click)="deleteDb()"><i nz-icon nzType="delete" nzTheme="outline"></i>删除{{dbType}}</button>
                              </nz-space-item>
                              <nz-space-item>
                                  <button *ngIf="updateMode" nz-button (click)="this.updateMode=false">取消</button>
                              </nz-space-item>
                          </nz-space>
                      </ng-template>
                  </div>

                  <div *ngIf="selectedTable && selectedTable.tableName">

                      <tis-page-header [showBreadcrumbRoot]="false" size="sm" title="表信息">
                          <tis-header-tool>
                              <button nz-button nzType="default" (click)="editTable(selectedTable)">
                                  <i nz-icon nzType="edit" nzTheme="outline"></i>
                                  编辑
                              </button>&nbsp;
                              <button nz-button nzType="danger" (click)="deleteTable()">
                                  <i nz-icon nzType="delete" nzTheme="outline"></i>删除
                              </button>
                          </tis-header-tool>
                      </tis-page-header>
                      <nz-descriptions nzBordered>
                          <nz-descriptions-item [nzSpan]="3" nzTitle="表名">{{selectedTable.tableName}}</nz-descriptions-item>
                          <nz-descriptions-item [nzSpan]="3" nzTitle="数据库名">{{selectedTable.dbName}}</nz-descriptions-item>
                          <nz-descriptions-item [nzSpan]="3" nzTitle="SQL">
                              <tis-codemirror name="dumpSql"
                                              [ngModel]="selectedTable.selectSql"
                                              [size]="{width:800,height:300}"
                                              [config]="{readOnly:true,lineWrapping:true,lineNumbers: false}"></tis-codemirror>
                          </nz-descriptions-item>
                      </nz-descriptions>
                  </div>
              </nz-spin>
              <nz-empty *ngIf="!treeNodeClicked && (!selectedTable || !selectedTable.tableName) && (!selectedDb || !selectedDb.dbId)" [nzNotFoundContent]="contentTpl">
                  <ng-template #contentTpl>
                      <span>请选择右侧数据节点</span>
                  </ng-template>
              </nz-empty>
          </nz-content>
      </nz-layout>
  `,
  styles: [`
      .tis-item .ant-descriptions-item-label {
          width: 20%;
      }

      .btn-block {
          padding: 5px;
      }

      .btn-block button {
          margin: 0 10px 0 0;
      }

      nz-content {
          padding: 10px;
      }

      nz-sider {
          background: white;
          height: 650px;
          padding: 10px;
      }

      pre {
          white-space: pre-wrap; /*css-3*/
          white-space: -moz-pre-wrap; /*Mozilla,since1999*/
          white-space: -o-pre-wrap; /*Opera7*/
          word-wrap: break-word; /*InternetExplorer5.5+*/
          width: 600px;
      }
  `]
})
// 数据源管理
export class DatasourceComponent extends BasicFormComponent implements OnInit {
  isCollapsed = false;
  nodes: NzTreeNodeOptions[] = [];
  @ViewChild("dbtree", {static: true}) dbtree: NzTreeComponent;
  selectedDb: DbPojo;
  facdeDb: DbPojo;
  selectedTable: { tabId?: number, tableName?: string, dbId?: number, dbName?: string, selectSql?: string } = {};
  searchValue: any;
  selectedDbIndex = 0;
  @ViewChild('detailPlugin', {static: false}) detailPlugin: PluginsComponent;
  treeLoad = false;
  treeNodeClicked = false;
  supportFacade = false;
  facadeSourceDesc: Array<Descriptor> = [];

  pluginsMetas: PluginType[] = [];
  facadePluginsMetas: PluginType[] = [];

  // 可选的数据源
  datasourceDesc: Array<Descriptor> = [];
  // 是否处在编辑模式
  updateMode = false;

  /**
   * 当前选中的DS plugin 描述信息
   * @param desc
   */
  public static pluginDesc(desc: Descriptor): HeteroList[] {
    let h = new HeteroList();
    h.extensionPoint = desc.extendPoint;
    h.descriptors.set(desc.impl, desc);
    PluginsComponent.addNewItem(h, desc, false);
   // console.log(h);
    return [h];
  }

  constructor(protected tisService: TISService //
    , private router: Router //
    , private activateRoute: ActivatedRoute // modalService: NgbModal
    , modalService: NzModalService //
    , private notify: NzNotificationService
  ) {
    super(tisService, modalService);
    tisService.currentApp = null;
  }

  get dbType(): string {
    switch (this.selectedDbIndex) {
      case 0:
        return "明细";
      case 1:
        return "门面";
      default:
        throw new Error("invalid this.selectedDbIndex:" + this.selectedDbIndex);
    }
  }


  ngOnInit(): void {
    this.treeLoad = true;
    let action = 'emethod=get_datasource_info&action=offline_datasource_action';
    this.httpPost('/offline/datasource.ajax', action)
      .then(result => {
        this.processResult(result);

        if (result.success) {

          let dbs = result.bizresult.dbs;
          let descList = PluginsComponent.wrapDescriptors(result.bizresult.pluginDesc);
          this.datasourceDesc = Array.from(descList.values());
          this.treeInit(dbs);
          setTimeout(() => {
            let queryParams = this.activateRoute.snapshot.queryParams;
            if (queryParams['dbId']) {
              this.activateDb(Number(queryParams['dbId']));
            } else if (queryParams['tableId']) {
              this.activateTable(Number(queryParams['tableId']));
            }
          }, 100);
        }
        this.treeLoad = false;
      }).catch((e) => {
      this.treeLoad = false;
    });
  }

  treeInit(dbs: any): void {
    // console.log(dbs);
    this.nodes = [];
    for (let db of dbs) {
      let children = [];
      if (db.tables) {
        for (let table of db.tables) {
          let c: NzTreeNodeOptions = {'key': `${table.id}`, 'title': table.name, 'isLeaf': true};
          children.push(c);
        }
      }

      let dbNode: NzTreeNodeOptions = {'key': `${db.id}`, 'title': db.name, 'children': children};
      this.nodes.push(dbNode);
    }
    // console.log( this.dbtree );
  }



  // 添加数据库按钮点击响应
  public addDbBtnClick(pluginDesc: Descriptor): void {

    let modalRef = this.openDialog(PluginsComponent, {nzTitle: "添加数据库"});
    let addDb: PluginsComponent = modalRef.getContentComponent();
    addDb.errorsPageShow = true;
    addDb.formControlSpan = 20;
    addDb.shallInitializePluginItems = false;
    addDb._heteroList = DatasourceComponent.pluginDesc(pluginDesc);
    addDb.setPluginMeta([{name: 'datasource', require: true, extraParam: "type_" + db_model_detailed + ",update_false"}])
    addDb.showSaveButton = true;
    addDb.afterSave.subscribe((r: PluginSaveResponse) => {
      if (r && r.saveSuccess && r.hasBiz()) {
        modalRef.close();
        let db = r.biz();
        let newNode: NzTreeNodeOptions[] = [{'key': `${db.dbId}`, 'title': db.name, 'children': []}];
        this.nodes = newNode.concat(this.nodes);

        let e = {'type': 'db', 'id': `${db.dbId}`};
        this.treeNodeClicked = true;
        this.onEvent(e);

        this.notify.success("成功", `数据库${db.name}添加成功`, {nzDuration: 6000});
      }
    });
  }

  processDb(processLiteria: string, facade: boolean, update: boolean, pluginDesc?: Descriptor): PluginsComponent {

    let modalRef = this.openDialog(PluginsComponent, {nzTitle: `${processLiteria}${facade ? "门面" : ''}数据库`});
    let addDb: PluginsComponent = modalRef.getContentComponent();
    addDb.errorsPageShow = true;
    addDb.formControlSpan = 20;
    addDb.itemChangeable = false;
    if (pluginDesc) {
      let hlist = DatasourceComponent.pluginDesc(pluginDesc);
      addDb._heteroList = hlist;
    }

    addDb.setPluginMeta([{name: 'datasource', require: true, extraParam: `dsname_${this.selectedDb.dbName},update_true,type_${facade ? "facade" : db_model_detailed}`}])
    addDb.shallInitializePluginItems = update;
    // addDb._heteroList = this.dsPluginDesc(pluginDesc);
    addDb.showSaveButton = true;


    addDb.afterSave.subscribe((r: PluginSaveResponse) => {
      // console.log(r);
      if (r && r.saveSuccess && r.hasBiz()) {
        let dbSuit = r.biz();
        // let db: DbPojo = Object.assign(new DbPojo(), r);
        let db = new DbPojo();
        db.facade = facade;
        db.dbId = dbSuit.dbId;
        db.dbName = dbSuit.name;
        if (facade) {
          this.facdeDb = db;
          this.createFacadePluginsMetas(dbSuit.name);
          this.selectedDbIndex = 1;
        } else {
          this.selectedDb = db;
          this.createDetailedPluginsMetas(dbSuit.name);
          this.selectedDbIndex = 0;
        }
        modalRef.close();
        // let db = r.biz();
        this.notify.success("成功", `数据库${dbSuit.name}添加成功`, {nzDuration: 6000});
      }
    });
    return addDb;
  }

  // 添加表按钮点击响应
  public addTableBtnClick(): void {
    let modalRef = this.openDialog(TableAddComponent, {nzTitle: "添加表"});
    let pm = modalRef.getContentComponent().processMode;
    if (this.selectedDb && this.selectedDb.dbId) {
      pm.dbId = this.selectedDb.dbId;
    } else if (this.selectedTable && this.selectedTable.tabId) {
      // dbDto = new DbPojo(`${this.selectedTable.dbId}`);
      // console.log(dbDto);
      pm.dbId = `${this.selectedTable.dbId}`;
    }

    modalRef.afterClose.subscribe((r: TisResponseResult) => {
      if (r && r.success) {
        // 添加表成功
        //   "createTime":1595853047656,
        //   "dbId":67,
        //   "gitTag":"purchase_match_info",
        //   "id":104,
        //   "name":"purchase_match_info",
        //   "opTime":1595853047656,
        //   "syncOnline":0,
        let ntable = r.bizresult;
        // console.log(ntable);
        let dbid = `${ntable.dbId}`;
        let dbNode: NzTreeNode = this.dbtree.getTreeNodeByKey(dbid);
        if (dbNode) {
          dbNode.isExpanded = (true);
          let dnode = this.nodes.filter((n) => n.key === dbid);
          // console.log(dnode);
          if (dnode.length > 0) {
            // let children: NzTreeNodeOptions[] = ;
            let n: NzTreeNodeOptions[] = [{'key': `${ntable.tabId}`, 'title': ntable.tableName, 'isLeaf': true}];
            dnode[0].children = n.concat(dnode[0].children);
          }
          this.nodes = [].concat(this.nodes);
          // console.log(dnode);
        }
      }
    });
  }


  public activateTable(tableId: number): void {
  }

  public activateDb(dbId: number): void {
  }


  private onEvent(event: { 'type': string, 'id': string }): void {

    let type = event.type;
    let id = event.id;
    //  let realId = 0;
    let action = `action=offline_datasource_action&emethod=get_datasource_${type}_by_id&id=${id}`;
    this.facdeDb = null;
    this.selectedDb = null;
    this.selectedTable = null;
    this.httpPost('/offline/datasource.ajax', action)
      .then(result => {
        try {
          if (result.success) {

            let biz = result.bizresult;

            if (type === 'db') {
              let detail = biz.detailed;
              let db = this.createDB(id, detail);
              this.createDetailedPluginsMetas(db.dbName);
              // this.detailPlugin.initializePluginItems();
              this.selectedDb = db;
              // console.log(this.selectedDb);
              if (biz.facade) {
                this.facdeDb = this.createDB(id, biz.facade);
                this.facdeDb.facade = true;
                this.createFacadePluginsMetas(this.facdeDb.dbName);
              }

            } else if (type === 'table') {
              this.selectedTable = result.bizresult;
              this.selectedDb = new DbPojo();
            }
          } else {
            this.processResult(result);
          }
        } finally {
        }
      }).catch((e) => {
    });
  }

  private createDetailedPluginsMetas(dbName: string) {
    this.pluginsMetas = [{name: 'datasource', 'require': true, 'extraParam': `dsname_${dbName},type_${db_model_detailed},update_true`}];
  }

  private createFacadePluginsMetas(dbName: string) {
    this.facadePluginsMetas = [{name: 'datasource', 'require': true, 'extraParam': `dsname_${dbName},type_${db_model_facade},update_true`}];
  }

  private createDB(id: string, detail: any) {
    let db = new DbPojo(id);
    db.dbName = detail.identityName;
    return db;
  }

  showMessage(result: any) {
    this.processResult(result);
    this.treeInit(result.bizresult);
  }

  /**
   * 编辑db配置
   */
  editDb(): void {
    // this.processDb("更新", this.facadeModel, true);
    this.updateMode = true;
    // @ts-ignore
    // let pluginMeta: PluginMeta = this.pluginsMetas[0];
    // this.pluginsMetas = [Object.assign(pluginMeta, {extraParam: pluginMeta.extraParam + ",update_true"})];
  }

  addFacadeDB(pluginDesc: Descriptor): void {
    this.processDb("添加", true, false, pluginDesc);
  }


  private get facadeModel(): boolean {
    return (this.selectedDbIndex === 1);
  }

  /**
   * 编辑table配置
   */
  // editTable(): void {

  //
  // }

  editTable(table: any) {
    let dialog = this.openDialog(TableAddComponent, {nzTitle: "更新数据表"});
    dialog.getContentComponent().processMode
      = {tableid: this.selectedTable.tabId, 'title': '更新数据表', isNew: false};

    dialog.afterClose.subscribe((r: TisResponseResult) => {
      if (r && r.success) {
        let biz = r.bizresult;
        this.notify.success("成功", `表${biz.tableName}更新成功`, {nzDuration: 6000});
      }
    })
  }

  /**
   * 删除一个db
   */
  deleteDb(): void {
    if (!this.selectedDb) {
      this.notify.error("成功", `请选择要删除的数据节点`, {nzDuration: 6000});
      return;
    }
    // this.selectedDbIndex ;
    this.modalService.confirm({
      nzTitle: '删除数据库',
      nzContent: `是否要删除${this.dbType}数据库'${this.selectedDb.dbName}'`,
      nzOkText: '执行',
      nzCancelText: '取消',
      nzOnOk: () => {
        let action = 'action=offline_datasource_action&';

        let dbModel = this.getDbModel();
        action = action + 'event_submit_do_delete_datasource_db_by_id=y&id=' + this.selectedDb.dbId + '&dbModel=' + dbModel;
        this.httpPost('/offline/datasource.ajax', action)
          .then(result => {
            if (result.success) {

              this.notify.success("成功", `${this.dbType}数据库'${this.selectedDb.dbName}'删除成功`, {nzDuration: 6000});

              if (dbModel === db_model_detailed) {
                this.nodes = this.nodes.filter((n) => n.key !== `${this.selectedDb.dbId}`);
                this.selectedDb = null;
                this.treeNodeClicked = false;
              } else if (dbModel === db_model_facade) {
                this.facdeDb = null;
              }
            }
            this.processResult(result);
          });
      }
    });
  }

  private getDbModel(): string {
    switch (this.selectedDbIndex) {
      case 0:
        return db_model_detailed;
      case 1:
        return db_model_facade
      default:
        throw new Error("illegal selectedDbIndex:" + this.selectedDbIndex);
    }
  }

  /**
   * 删除一个table
   */
  deleteTable(): void {

    // console.log(this.selectedTable);

    this.modalService.confirm({
      nzTitle: '删除表',
      nzContent: `是否要删除表'${this.selectedTable.dbName}.${this.selectedTable.tableName}'`,
      nzOkText: '执行',
      nzCancelText: '取消',
      nzOnOk: () => {
        let action = 'action=offline_datasource_action&';
        action = action + 'event_submit_do_delete_datasource_table_by_id=y&id=' + this.selectedTable.tabId;
        this.httpPost('/offline/datasource.ajax', action)
          .then(result => {
            if (result.success) {
              let tnode: NzTreeNode = this.dbtree.getTreeNodeByKey(`${this.selectedTable.dbId}`);
              if (!tnode) {
                throw new Error(`dbname:${this.selectedTable.dbName} relevant db instance is not exist`);
              }

              tnode.getChildren() //
                .filter((n) => n.key === `${this.selectedTable.tabId}`) //
                .map((n) => { //
                  n.remove();
                })
              this.notify.success("成功", `表'${this.selectedTable.dbName}.${this.selectedTable.tableName}'删除成功`, {nzDuration: 6000});
              this.selectedDb = null;
              this.selectedTable = null;
              this.treeNodeClicked = false;
            }
            this.processResult(result);
          });
      }
    });
    //
    //  action = 'action=offline_datasource_action&';
    // action = action + 'event_submit_do_delete_datasource_table_by_id=y&id=' + this.selectedTable.realId;
    // this.httpPost('/offline/datasource.ajax', action)
    //   .then(result => {
    //     if (result.success) {
    //       this.processResult(result);
    //       // this.router.navigate(['/t/offline']);
    //     } else {
    //       this.processResult(result);
    //     }
    //   });
  }

  nzEvent($event: NzFormatEmitEvent) {

  }

  // 点击节点
  nzDSTreeClickEvent($event: NzFormatEmitEvent) {
    this.treeNodeClicked = true;
    let e = {'type': ($event.node.isLeaf ? 'table' : 'db'), 'id': $event.node.origin.key};
    this.onEvent(e);
  }

  syncDbOnline() {
  }


  afterPluginInit(evne: HeteroList[]) {
    evne.forEach((hlist) => {
      let it = hlist.descriptorList;
      it.forEach((des) => {
        let ep = des.extractProps;
        this.supportFacade = ep["supportFacade"];
        let facadeSourceTypes: string[] = ep["facadeSourceTypes"];
        this.facadeSourceDesc = [];
        facadeSourceTypes.filter((r) => {
          let findDes = this.datasourceDesc.find((dd) => dd.displayName === r);
          if (findDes) {
            this.facadeSourceDesc.push(findDes);
          }
        });
      });
    });
  }

  afterSave(event: PluginSaveResponse) {
    this.updateMode = !event.saveSuccess;
  }

  selectedIndexChange() {
    this.updateMode = false;
  }
}

// export class Node {
//   id: number;
//   name: string;
//   syncOnline: number;
//   children: Node[];
//   type: string;
//
//   constructor(id: number, name: string, syncOnline: number, children: Node[], type: string) {
//     this.id = id;
//     this.name = name;
//     this.syncOnline = syncOnline;
//     this.children = children;
//     this.type = type;
//   }
// }
