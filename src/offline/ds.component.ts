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

// const THRESHOLD = 10000;

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
                  <button nz-button nzSize="small" style="width: 3em" nzType="default" (click)="addDbBtnClick()">
                      <i class="fa fa-plus" aria-hidden="true"></i>
                      <i class="fa fa-database" aria-hidden="true"></i>
                  </button>

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

                      <nz-tabset [(nzSelectedIndex)]="selectedDbIndex" [nzTabBarExtraContent]="extraTemplate">
                          <nz-tab nzTitle="明细">
                              <nz-descriptions nzBordered>
                                  <nz-descriptions-item [nzSpan]="3" nzTitle="数据库名">
                                      <div style="width: 400px">
                                          {{selectedDb.dbName}}
                                      </div>
                                  </nz-descriptions-item>
                                  <nz-descriptions-item [nzSpan]="3" nzTitle="节点描述">{{selectedDb.host}}
                                  </nz-descriptions-item>
                                  <nz-descriptions-item [nzSpan]="3" nzTitle="端口">{{selectedDb.port}}
                                  </nz-descriptions-item>
                                  <nz-descriptions-item [nzSpan]="3" nzTitle="用户名">{{selectedDb.userName}}
                                  </nz-descriptions-item>
                                  <nz-descriptions-item [nzSpan]="3" nzTitle="密码">{{'******'}}
                                  </nz-descriptions-item>
                              </nz-descriptions>
                          </nz-tab>
                          <nz-tab *ngIf="facdeDb" [nzTitle]="'门面'">
                              <nz-descriptions nzBordered>
                                  <nz-descriptions-item [nzSpan]="3" nzTitle="数据库名">
                                      <div style="width: 400px">
                                          {{facdeDb.dbName}}
                                      </div>
                                  </nz-descriptions-item>
                                  <nz-descriptions-item [nzSpan]="3" nzTitle="节点描述">{{facdeDb.host}}</nz-descriptions-item>
                                  <nz-descriptions-item [nzSpan]="3" nzTitle="端口">{{facdeDb.port}}</nz-descriptions-item>
                                  <nz-descriptions-item [nzSpan]="3" nzTitle="用户名">{{facdeDb.userName}}</nz-descriptions-item>
                                  <nz-descriptions-item [nzSpan]="3" nzTitle="密码">{{'******'}}</nz-descriptions-item>
                              </nz-descriptions>
                          </nz-tab>
                      </nz-tabset>
                      <ng-template #extraTemplate>
                          <button nz-button nzType="default" (click)="addFacadeDb()" [disabled]="facdeDb != null">添加门面配置</button>
                          &nbsp;
                          <button nz-button (click)="editDb()"><i nz-icon nzType="edit" nzTheme="outline"></i>编辑</button>
                          &nbsp;
                          <!--
                           <button type="button" class="btn btn-secondary btn-sm" (click)="syncDbOnline()">同步配置到线上</button>
                          -->
                          <button nz-button nzType="danger" (click)="deleteDb()"><i nz-icon nzType="delete" nzTheme="outline"></i>删除</button>
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

  treeLoad = false;
  treeNodeClicked = false;


  constructor(protected tisService: TISService //
    , private router: Router //
    , private activateRoute: ActivatedRoute // modalService: NgbModal
    , modalService: NzModalService //
    , private notify: NzNotificationService
  ) {
    super(tisService, modalService);
  }


  ngOnInit(): void {
    this.treeLoad = true;
    let action = 'emethod=get_datasource_info&action=offline_datasource_action';
    this.httpPost('/offline/datasource.ajax', action)
      .then(result => {
        this.processResult(result);

        if (result.success) {
          this.treeInit(result.bizresult);
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
          let c: NzTreeNodeOptions = {'key': `${table.id}`, 'title': table.tableLogicName, 'isLeaf': true};
          children.push(c);
        }
      }

      let dbNode: NzTreeNodeOptions = {'key': `${db.id}`, 'title': db.name, 'children': children};
      this.nodes.push(dbNode);
    }
    // console.log( this.dbtree );
  }

// 添加数据库按钮点击响应
  public addDbBtnClick(): void {
    let modalRef = this.openDialog(DbAddComponent, {nzTitle: "添加数据库"});
    modalRef.afterClose.subscribe((r: DbPojo) => {
      // console.log(r);
      if (r) {
        let newNode: NzTreeNodeOptions[] = [{'key': `${r.dbId}`, 'title': r.dbName, 'children': []}];
        this.nodes = newNode.concat(this.nodes);

        let e = {'type': 'db', 'id': `${r.dbId}`};
        this.treeNodeClicked = true;
        this.onEvent(e);

        this.notify.success("成功", `数据库${r.dbName}添加成功`, {nzDuration: 6000});
      }
    })
  }

  // 添加表按钮点击响应
  public addTableBtnClick(): void {
    // let node = this.tree.treeModel.getActiveNode();
    // console.log(node);

    // if (node) {
    //   let dbName;
    //   if (node.id < THRESHOLD) {
    //     dbName = node.data.name;
    //   } else {
    //     dbName = node.parent.data.name;
    //   }
    //   this.router.navigate(['/t/offline/table-add'], {queryParams: {dbName: dbName}});
    // } else {
    //   this.router.navigate(['/t/offline/table-add']);
    // // }
    // this.modalService.open(TableAddComponent
    //   , {windowClass: 'schema-edit-modal', backdrop: 'static'});
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
        //   "tableLogicName":"purchase_match_info"
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
    // tableId = THRESHOLD + tableId;
    // let node = this.tree.treeModel.getNodeById(tableId);
    // if (node !== null) {
    //   if (node.parent !== null) {
    //     node.parent.expandAll();
    //   }
    //   node.toggleActivated();
    // } else {
    //   alert('can not find table id ' + (tableId - THRESHOLD));
    // }
  }

  public activateDb(dbId: number): void {
    // let node = this.tree.treeModel.getNodeById(dbId);
    // if (node !== null) {
    //   node.toggleActivated();
    // } else {
    //   alert('can not find db id ' + (dbId));
    // }
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
              this.selectedDb = db;
              // console.log(this.selectedDb);
              if (biz.facade) {
                this.facdeDb = this.createDB(id, biz.facade);
                this.facdeDb.facade = true;
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

  private createDB(id: string, detail: any) {
    let db = new DbPojo(id);

    db.dbType = detail.dbType;
    db.host = detail.hostDesc;
    db.dbName = detail.name;
    db.port = detail.port;
    db.userName = detail.userName;
    return db;
  }

  showMessage(result: any) {
    this.processResult(result);
    this.treeInit(result.bizresult);
  }

  // /**
  //  * 把db配置同步到线上
  //  */
  // syncDbOnline(): void {
  //   let action = 'action=offline_datasource_action&';
  //   action = action + 'event_submit_do_sync_db=y&id=' + this.selectedDb.dbId + '&dbName=' + this.selectedDb.dbName;
  //   this.tisService.httpPost('/offline/datasource.ajax', action)
  //     .then(result => {
  //       console.log(result);
  //       this.processResult(result);
  //     });
  // }
  /**
   * 添加门面数据库配置
   */
  addFacadeDb(): void {
    let dialog: NzModalRef<DbAddComponent> = this.openDialog(DbAddComponent, {nzTitle: "添加门面数据库"});
    let db = new DbPojo();
    db.facade = true;
    db.dbId = this.selectedDb.dbId;
    let cpt = dialog.getContentComponent();
    cpt.dbPojo = db;

    let facadeAdd: DbAddComponent = cpt;
    facadeAdd.successSubmit.subscribe((evt: DbPojo) => {
      if (evt) {
        this.facdeDb = evt;
        this.facdeDb.facade = true;
        // 将tab切换到facade上
        this.selectedDbIndex = 1;
      }
      dialog.close();
    });
  }

  /**
   * 编辑db配置
   */
  editDb(): void {

    let dialog = this.openDialog(DbAddComponent, {nzTitle: `更新${this.facadeModel ? "门面" : ''}数据库`});
    dialog.getContentComponent().dbPojo = Object.assign(new DbPojo(), this.facadeModel ? this.facdeDb : this.selectedDb);
    dialog.afterClose.subscribe((r) => {
      if (r) {
        let db: DbPojo = Object.assign(new DbPojo(), r);
        // console.log(db);
        if (db.facade) {
          this.facdeDb = db;
        } else {
          this.selectedDb = db;
        }
        this.notify.success("成功", "数据库更新成功", {nzDuration: 6000});
      }
    });
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
    this.modalService.confirm({
      nzTitle: '删除数据库',
      nzContent: `是否要删除数据库'${this.selectedDb.dbName}'`,
      nzOkText: '执行',
      nzCancelText: '取消',
      nzOnOk: () => {
        let action = 'action=offline_datasource_action&';
        action = action + 'event_submit_do_delete_datasource_db_by_id=y&id=' + this.selectedDb.dbId;
        this.httpPost('/offline/datasource.ajax', action)
          .then(result => {
            if (result.success) {
              this.nodes = this.nodes.filter((n) => n.key !== `${this.selectedDb.dbId}`);
              this.notify.success("成功", `数据库'${this.selectedDb.dbName}'删除成功`, {nzDuration: 6000});
              this.selectedDb = null;
              this.treeNodeClicked = false;
            }
            this.processResult(result);
          });
      }
    });
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


}

export class Node {
  id: number;
  name: string;
  syncOnline: number;
  children: Node[];
  type: string;

  constructor(id: number, name: string, syncOnline: number, children: Node[], type: string) {
    this.id = id;
    this.name = name;
    this.syncOnline = syncOnline;
    this.children = children;
    this.type = type;
  }
}
