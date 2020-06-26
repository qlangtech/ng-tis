/**
 * Created by baisui on 2017/3/29 0029.
 */
import {Component, OnInit, ViewChild} from '@angular/core';
import {TISService} from '../service/tis.service';
import {BasicFormComponent} from '../common/basic.form.component';
import {ActivatedRoute, Router} from '@angular/router';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {DbAddComponent, DbPojo} from "./db.add.component";
import {TableAddComponent} from "./table.add.component";
import {NzFormatEmitEvent, NzTreeNodeOptions} from "ng-zorro-antd";

// const THRESHOLD = 10000;

@Component({
  template: `
      <tis-page-header  title="数据源管理" [needRefesh]='false'>

          <!--
          <a routerLink="/offline/datasourcecommits" routerLinkActive="active">datasource变更历史</a>
          -->
      </tis-page-header>

      <nz-layout>
          <nz-sider [nzWidth]="300">
              <div class="btn-block">
                  <button nz-button nzSize="small" nzType="default" (click)="addDbBtnClick()">
                      <i class="fa fa-plus" aria-hidden="true"></i>
                      <i class="fa fa-database" aria-hidden="true"></i>
                  </button>

                  <button nz-button nz-dropdown nzSize="small" [nzDropdownMenu]="menu">
                      <i class="fa fa-plus" aria-hidden="true"></i>
                      <i class="fa fa-table" aria-hidden="true"></i>
                      <i nz-icon nzType="down"></i></button>
                  <nz-dropdown-menu #menu="nzDropdownMenu">
                      <ul nz-menu>
                          <li nz-menu-item>
                              <a href="javascript:void(0)" (click)="addTableBtnClick()">单个</a>
                          </li>
                          <li nz-menu-item>
                              <a href="javascript:void(0)">批量</a>
                          </li>
                      </ul>
                  </nz-dropdown-menu>

              </div>
              <nz-input-group [nzSuffix]="suffixIcon">
                  <input type="text" nz-input placeholder="Search" [(ngModel)]="searchValue"/>
              </nz-input-group>
              <ng-template #suffixIcon>
                  <i nz-icon nzType="search"></i>
              </ng-template>
              <nz-spin style="width:100%;min-height: 300px" [nzSize]="'large'" [nzSpinning]="treeLoad">
                  <nz-tree [nzData]="nodes"
                           (nzClick)="nzDSTreeClickEvent($event)"
                           (nzExpandChange)="nzEvent($event)"
                           (nzSearchValueChange)="nzEvent($event)">
                  </nz-tree>
              </nz-spin>
          </nz-sider>
          <nz-content>

              <nz-spin *ngIf="treeNodeClicked" style="width:100%;min-height: 200px" [nzSize]="'large'" [nzSpinning]="nodeLoad">
                  <div *ngIf="selectedDb && selectedDb.dbId">

                      <tis-page-header [showBreadcrumbRoot]="false" size="sm" [title]="'数据库'">

                      </tis-page-header>

                      <nz-tabset [nzSelectedIndex]="selectedDbIndex" [nzTabBarExtraContent]="extraTemplate">
                          <nz-tab nzTitle="明细">
                              <table class="table table-bordered">
                                  <tbody>
                                  <tr>
                                      <td width="15%">数据库名</td>
                                      <td>{{selectedDb.dbName}}</td>
                                  </tr>
                                  <tr>
                                      <td>节点描述</td>
                                      <td>{{selectedDb.host}}</td>
                                  </tr>
                                  <tr>
                                      <td>端口</td>
                                      <td>{{selectedDb.port}}</td>
                                  </tr>
                                  <tr>
                                      <td>用户名</td>
                                      <td>{{selectedDb.userName}}</td>
                                  </tr>
                                  <tr>
                                      <td>密码</td>
                                      <td>{{'******'}}</td>
                                  </tr>
                                  </tbody>
                              </table>
                          </nz-tab>
                          <nz-tab *ngIf="facdeDb" [nzTitle]="'门面'">
                              <table class="table table-bordered">
                                  <tbody>
                                  <tr>
                                      <td width="15%">数据库名</td>
                                      <td>{{facdeDb.dbName}}</td>
                                  </tr>
                                  <tr>
                                      <td>节点描述</td>
                                      <td>{{facdeDb.host}}</td>
                                  </tr>
                                  <tr>
                                      <td>端口</td>
                                      <td>{{facdeDb.port}}</td>
                                  </tr>
                                  <tr>
                                      <td>用户名</td>
                                      <td>{{facdeDb.userName}}</td>
                                  </tr>
                                  <tr>
                                      <td>密码</td>
                                      <td>{{'******'}}</td>
                                  </tr>
                                  </tbody>
                              </table>
                          </nz-tab>
                      </nz-tabset>
                      <ng-template #extraTemplate>
                          <button nz-button nzType="default" (click)="addFacadeDb()" [disabled]="facdeDb != null">添加门面配置</button>


                          <button nz-button (click)="editDb()">编辑</button>
                          <!--
                           <button type="button" class="btn btn-secondary btn-sm" (click)="syncDbOnline()">同步配置到线上</button>
                          -->
                          <button nz-button nzType="danger" (click)="deleteDb()">删除</button>
                      </ng-template>
                  </div>

                  <div *ngIf="selectedTable && selectedTable.tableName">

                      <tis-page-header [showBreadcrumbRoot]="false" size="sm" title="表信息">
                          <tis-header-tool>
                              <button nz-button nzType="default" (click)="editTable(selectedTable)">
                                  <i class="fa fa-pencil-square-o" aria-hidden="true"></i>
                                  编辑
                              </button>
                              <!--
                               <button nz-button  nzType="default" (click)="syncTableOnline()">
                                   <i class="fa fa-cloud-upload" aria-hidden="true"></i>同步配置到线上
                               </button>
                              -->
                              <button nz-button nzType="danger" (click)="deleteTable()">
                                  <i class="fa fa-trash-o" aria-hidden="true"></i>删除
                              </button>
                          </tis-header-tool>
                      </tis-page-header>

                      <table class="table table-bordered">
                          <tbody>
                          <tr>
                              <td width="15%">逻辑表名</td>
                              <td>{{selectedTable.tableLogicName}}</td>
                          </tr>
                          <tr>
                              <td>表名</td>
                              <td>{{selectedTable.tableName}}</td>
                          </tr>
                          <tr>
                              <td>数据库名</td>
                              <td>{{selectedTable.dbName}}</td>
                          </tr>
                          <tr>
                              <td>分区间隔</td>
                              <td>{{selectedTable.partitionInterval}}小时</td>
                          </tr>
                          <tr>
                              <td>分区数</td>
                              <td>{{selectedTable.partitionNum}}个</td>
                          </tr>
                          <tr>
                              <td>SQL</td>
                              <td>
                                  <tis-codemirror name="dumpSql"
                                                  [ngModel]="selectedTable.selectSql"
                                                  [size]="{width:800,height:300}"
                                                  [config]="{readOnly:true,lineWrapping:true }"></tis-codemirror>

                              </td>
                          </tr>
                          </tbody>
                      </table>
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

  selectedDb: DbPojo;
  facdeDb: DbPojo;
  selectedTable: any = {};
  searchValue: any;
  selectedDbIndex = 0;

  treeLoad = false;
  treeNodeClicked = false;
  nodeLoad = false;

  constructor(protected tisService: TISService //
    , private router: Router //
    , private activateRoute: ActivatedRoute // modalService: NgbModal
    , modalService: NgbModal //
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
          // console.log(this.nodes);
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
    console.log(dbs);
    this.nodes = [];
    for (let db of dbs) {
      let children = [];
      if (db.tables) {
        for (let table of db.tables) {

          let c: NzTreeNodeOptions = {'key': table.id, 'title': table.tableLogicName, 'isLeaf': true};

          children.push(c);
        }
      }

      let dbNode: NzTreeNodeOptions = {'key': db.id, 'title': db.name, 'children': children};
      this.nodes.push(dbNode);
    }
    // console.log( this.nodes );
  }

// 添加数据库按钮点击响应
  public addDbBtnClick(): void {
    // this.router.navigate(['/t/offline/db-add']);

    // this.modalService.open(DbAddComponent
    //   , {windowClass: 'schema-edit-modal', backdrop: 'static'});

    this.openNormalDialog(DbAddComponent);
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


    this.openNormalDialog(TableAddComponent);
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


  private onEvent(event: any): void {
    this.nodeLoad = true;
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

              if (biz.facade) {
                this.facdeDb = this.createDB(id, biz.facade);
              }

            } else if (type === 'table') {
              this.selectedTable = result.bizresult;
              // this.selectedTable['syncOnline'] = event.node.data.syncOnline;
              // this.selectedTable['realId'] = realId;
              this.selectedDb = new DbPojo();
            }
          } else {
            this.processResult(result);
          }
        } finally {
          this.nodeLoad = false;
        }
      }).catch((e) => {
      this.nodeLoad = false;
    });
  }

  private createDB(id: number, detail: any) {
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
   * 把table配置同步到线上
   */
  syncTableOnline(): void {
    let action = `action=offline_datasource_action&emethod=sync_table=y&id=${this.selectedDb.dbId}&tableLogicName=${this.selectedTable.gitDatasourceTablePojo.tableLogicName}`;

    this.tisService.httpPost('/offline/datasource.ajax', action)
      .then(result => {
        // console.log(result);
        this.processResult(result);
      });
  }

  /**
   * 添加门面数据库配置
   */
  addFacadeDb(): void {
    let dialog: NgbModalRef = this.openNormalDialog(DbAddComponent);
    let db = new DbPojo();
    db.facade = true;
    db.dbId = this.selectedDb.dbId;
    dialog.componentInstance.dbPojo = db;

    let facadeAdd: DbAddComponent = dialog.componentInstance;
    facadeAdd.successSubmit.subscribe((evt: DbPojo) => {
      if (evt) {
        this.facdeDb = evt;
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

    let dialog: NgbModalRef = this.openNormalDialog(DbAddComponent);
    dialog.componentInstance.dbPojo = this.selectedDb;
  }

  /**
   * 编辑table配置
   */
  // editTable(): void {

  //
  // }

  editTable(table: any) {
      // this.router.navigate(['/offline/table_edit']
      //   , {queryParams: {tableId: this.selectedTable.id}});
      //
      //
      // this.modalService.open(TableAddComponent
      //   , {windowClass: 'schema-edit-modal', backdrop: 'static'});


      let dialog: NgbModalRef = this.openNormalDialog(TableAddComponent);
      //
      console.log(table);

      dialog.componentInstance.processMode
        = {tableid: this.selectedTable.tabId, 'title': '更新数据表', isNew: false};
  }

  /**
   * 删除一个db
   */
  deleteDb(): void {
    let action = 'action=offline_datasource_action&';
    action = action + 'event_submit_do_delete_datasource_db_by_id=y&id=' + this.selectedDb.dbId;
    this.tisService.httpPost('/offline/datasource.ajax', action)
      .then(result => {
        console.log(result);
        if (result.success) {
          this.processResult(result);
          this.router.navigate(['/t/offline']);
        } else {
          this.processResult(result);
        }
      });
  }

  /**
   * 删除一个table
   */
  deleteTable(): void {
    let action = 'action=offline_datasource_action&';
    action = action + 'event_submit_do_delete_datasource_table_by_id=y&id=' + this.selectedTable.realId;
    this.tisService.httpPost('/offline/datasource.ajax', action)
      .then(result => {
        console.log(result);
        if (result.success) {
          this.processResult(result);
          this.router.navigate(['/t/offline']);
        } else {
          this.processResult(result);
        }
      });
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
