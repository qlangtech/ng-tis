/**
 *   Licensed to the Apache Software Foundation (ASF) under one
 *   or more contributor license agreements.  See the NOTICE file
 *   distributed with this work for additional information
 *   regarding copyright ownership.  The ASF licenses this file
 *   to you under the Apache License, Version 2.0 (the
 *   "License"); you may not use this file except in compliance
 *   with the License.  You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

/**
 * Created by baisui on 2017/3/29 0029.
 */
import {Component, OnInit, ViewChild} from '@angular/core';
import {TISService} from '../common/tis.service';
import {BasicFormComponent} from '../common/basic.form.component';
import {ActivatedRoute, Router} from '@angular/router';

import {TableAddComponent} from "./table.add.component";
import {PluginsComponent} from "../common/plugins.component";
import {
  DataBase, DATAX_PREFIX_DB,
  Descriptor,
  HeteroList,
  IColumnMeta,
  Item,
  PluginSaveResponse,
  PluginType,
  SuccessAddedDBTabs
} from "../common/tis.plugin";
import {NzFormatEmitEvent, NzTreeComponent, NzTreeNode, NzTreeNodeOptions} from "ng-zorro-antd/tree";
import {NzModalService} from "ng-zorro-antd/modal";
import {NzNotificationService} from "ng-zorro-antd/notification";

import {TableSelectComponent} from "../common/table.select.component";
import {
  clickDBNode,
  createDataSourceDetailedPluginsMetas,
  DataBaseMeta,
  db_model_detailed,
  DBClickResponse,
  DbPojo,
  loadDSWithDesc,
  NodeType,
  ProcessedDBRecord,
  TableClickResponse
} from "../common/ds.utils";


const db_model_facade = "facade";

const key_tabs_fetch = "tabsFetch";
export const KEY_DB_ID = "dbId";


@Component({
  template: `
    <tis-page-header title="数据源管理"></tis-page-header>

    <nz-layout>
      <nz-sider [nzWidth]="300">
        <nz-space class="btn-block">
          <tis-plugin-add-btn (afterPluginAddClose)="initComponents(false)" *nzSpaceItem
                              [btnStyle]="'width: 5em'"
                              (addPlugin)="addDbBtnClick($event)" [btnSize]="'small'"
                              [extendPoint]="'com.qlangtech.tis.plugin.ds.DataSourceFactory'"
                              [descriptors]="datasourceDesc">
            <i class="fa fa-plus" aria-hidden="true"></i>
            <i class="fa fa-database" aria-hidden="true"></i></tis-plugin-add-btn>

          <button *nzSpaceItem nz-button nzSize="small" style="width: 4em" (click)="addTableBtnClick()">
            <i class="fa fa-plus" aria-hidden="true"></i>
            <i class="fa fa-table" aria-hidden="true"></i></button>
        </nz-space>
        <nz-input-group [nzSuffix]="suffixIcon">
          <input type="text" nz-input placeholder="Search" [(ngModel)]="searchValue"/>
        </nz-input-group>
        <ng-template #suffixIcon>
          <i nz-icon nzType="search"></i>
        </ng-template>
        <nz-spin style="width:100%;min-height: 300px;" [nzSize]="'large'" [nzSpinning]="treeLoad">
          <nz-tree id="ds-tree"  #dbtree [nzData]="nodes" [nzShowIcon]="true"
                   [nzSearchValue]="searchValue" [nzVirtualHeight]="'800px'"
                   (nzClick)="nzDSTreeClickEvent($event)"
                   (nzExpandChange)="nzEvent($event)">
          </nz-tree>
        </nz-spin>
      </nz-sider>
      <nz-content>
        <nz-spin *ngIf="treeNodeClicked " style="width:100%;min-height: 200px" [nzSize]="'large'"
                 [nzSpinning]="this.formDisabled">
          <div *ngIf="selectedDb && selectedDb.dbId">

            <tis-page-header [showBreadcrumbRoot]="false" size="sm" [title]="'数据库'">

            </tis-page-header>

            <nz-tabset [(nzSelectedIndex)]="selectedDbIndex" (nzSelectedIndexChange)="selectedIndexChange()"
                       [nzTabBarExtraContent]="extraTemplate">
              <nz-tab nzTitle="明细">
                <tis-plugins (afterSave)="afterSave($event)" (afterInit)="afterPluginInit($event)"
                             [errorsPageShow]="false"
                             [formControlSpan]="formControlSpan" [shallInitializePluginItems]="false"
                             [showSaveButton]="updateMode" [disabled]="!updateMode"
                             (afterPluginManipulate)="afterDataSourceManipuldate($event)"
                             [plugins]="pluginsMetas"></tis-plugins>
              </nz-tab>
              <nz-tab *ngIf="facdeDb" [nzTitle]="'门面'">
                <ng-template nz-tab>
                  <tis-plugins (afterSave)="afterSave($event)" (afterInit)="afterPluginInit($event)"
                               [errorsPageShow]="false"
                               [formControlSpan]="formControlSpan"
                               [shallInitializePluginItems]="false"
                               [showSaveButton]="updateMode" [disabled]="!updateMode"
                               [plugins]="facadePluginsMetas"></tis-plugins>
                </ng-template>
              </nz-tab>
              <nz-tab *ngIf="this.selectedDb && this.selectedDb.dataReaderSetted" [nzTitle]="'抽取配置'">
                <ng-template nz-tab>
                  <tis-plugins [errorsPageShow]="false" (afterSave)="afterSave($event)"
                               (afterInit)="afterDataReaderInit($event)"
                               [formControlSpan]="formControlSpan"
                               [shallInitializePluginItems]="false"
                               [showSaveButton]="updateMode" [disabled]="!updateMode"
                               [plugins]="dataReaderPluginMetas"></tis-plugins>
                </ng-template>
              </nz-tab>
            </nz-tabset>
            <ng-template #extraTemplate>
              <nz-space>
                <ng-container *ngIf="supportFacade && !this.facdeDb">
                              <span *nzSpaceItem>
                                  <button [disabled]="this.updateMode" nz-button nzType="default" nz-dropdown
                                          [nzDropdownMenu]="dbFacadeAdd" [disabled]="facdeDb != null">添加门面配置<i
                                    nz-icon nzType="down"></i></button>
                                  <nz-dropdown-menu #dbFacadeAdd="nzDropdownMenu">
                                      <ul nz-menu>
                                          <li nz-menu-item *ngFor="let d of facadeSourceDesc">
                                              <!--addDbBtnClick(d) -->
                                              <a href="javascript:void(0)"
                                                 (click)="addFacadeDB(d)">{{d.displayName}}</a>
                                          </li>
                                      </ul>
                                  </nz-dropdown-menu>
                              </span>
                </ng-container>
                <span *nzSpaceItem>
                                  <button nz-button [disabled]="this.updateMode" (click)="editDb()"><i nz-icon
                                                                                                       nzType="edit"
                                                                                                       nzTheme="outline"></i>编辑</button>
                              </span>
                <span *nzSpaceItem>
                                  <button nz-button [disabled]="this.updateMode" nzType="primary" nzDanger
                                          (click)="deleteDb()"><i nz-icon nzType="delete"
                                                                  nzTheme="outline"></i>删除{{dbType}}</button>
                              </span>
                <span *nzSpaceItem>
                                  <button *ngIf="updateMode" nz-button (click)="this.updateMode=false">取消</button>
                              </span>
              </nz-space>
            </ng-template>
          </div>

          <div *ngIf="selectedTable && selectedTable.tableName">

            <tis-page-header [showBreadcrumbRoot]="false" size="sm" title="表信息">
            </tis-page-header>


            <nz-tabset>

              <nz-tab nzTitle="基本配置">
                <ng-template nz-tab>
                  <tis-plugins [getCurrentAppCache]="true" [pluginMeta]="selectedTablePluginMeta"
                               [showSaveButton]="updateMode" [disabled]="!updateMode"
                               [formControlSpan]="formControlSpan"
                               [shallInitializePluginItems]="false"
                               [_heteroList]="selectedTableHeteroList"></tis-plugins>
                </ng-template>
              </nz-tab>
              <nz-tab (nzClick)="colsMetaClick(selectedTable)" nzTitle="列">
                <ng-template nz-tab>
                  <div style="margin-left: 40px;width: 70%">
                    <table-cols-meta *ngIf="this.colsMeta"
                                     [colsMeta]="this.colsMeta"></table-cols-meta>
                  </div>
                </ng-template>
              </nz-tab>


            </nz-tabset>


          </div>
        </nz-spin>
        <nz-empty
          *ngIf="!treeNodeClicked && (!selectedTable || !selectedTable.tableName) && (!selectedDb || !selectedDb.dbId)"
          [nzNotFoundContent]="contentTpl">
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

    nz-tree-node-switcher {
      width: 15px;
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
  selectedTable: { tableName?: string, dbId?: number, dbName?: string } = {};
  selectedTablePluginMeta: Array<PluginType> = [];
  selectedTableHeteroList: HeteroList[] = [];
  searchValue: any;
  selectedDbIndex = 0;
  @ViewChild('detailPlugin', {static: false}) detailPlugin: PluginsComponent;
  treeLoad = false;
  treeNodeClicked = false;
  supportFacade = false;
  // zeppelinNoteId: string;
  facadeSourceDesc: Array<Descriptor> = [];

  pluginsMetas: PluginType[] = [];
  facadePluginsMetas: PluginType[] = [];
  dataReaderPluginMetas: PluginType[] = [];
  // 可选的数据源
  datasourceDesc: Array<Descriptor> = [];
  // 是否处在编辑模式
  updateMode = false;

  formControlSpan = 20;
  colsMeta: Array<IColumnMeta>;




  constructor(protected tisService: TISService //
    , private router: Router //
    , private activateRoute: ActivatedRoute // modalService: NgbModal
    , modalService: NzModalService //
    , notify: NzNotificationService
  ) {
    super(tisService, modalService, notify);
    tisService.currentApp = null;
  }

  get dbType(): string {
    switch (this.selectedDbIndex) {
      case 0:
        return "明细";
      case 1:
        return "门面";
      case 2:
        return "抽取配置";
      default:
        throw new Error("invalid this.selectedDbIndex:" + this.selectedDbIndex);
    }
  }


  ngOnInit(): void {
    this.initComponents(true);
  }


  initComponents(updateTreeInit: boolean) {
    //console.log("initComponents");
    this.treeLoad = true;

    loadDSWithDesc(this)
      .then(({dbs, desc}) => {
        this.datasourceDesc = desc;
        if (updateTreeInit) {
          this.treeInit(dbs);
          setTimeout(() => {
            let queryParams = this.activateRoute.snapshot.queryParams;
            if (queryParams[KEY_DB_ID]) {
              this.activateDb(Number(queryParams[KEY_DB_ID]));
            } else if (queryParams['tableId']) {
              this.activateTable(Number(queryParams['tableId']));
            }
          }, 100);
        }

        this.treeLoad = false;
      }).catch((e) => {
      console.log(e);
      this.treeLoad = false;
    });
    // action = 'emethod=get_datasource_info&action=offline_datasource_action';
    // this.httpPost('/offline/datasource.ajax', action)
    //   .then(result => {
    //     this.processResult(result);
    //
    //     if (result.success) {
    //       //
    //       let dbs: Array<DataBaseMeta> = result.bizresult.dbs;
    //       // console.log([dbs,updateTreeInit]);
    //       let descList = Descriptor.wrapDescriptors(result.bizresult.pluginDesc);
    //       this.datasourceDesc = Array.from(descList.values());
    //       this.datasourceDesc.sort((a, b) => a.displayName > b.displayName ? 1 : -1);
    //       if (updateTreeInit) {
    //         this.treeInit(dbs);
    //         setTimeout(() => {
    //           let queryParams = this.activateRoute.snapshot.queryParams;
    //           if (queryParams[KEY_DB_ID]) {
    //             this.activateDb(Number(queryParams[KEY_DB_ID]));
    //           } else if (queryParams['tableId']) {
    //             this.activateTable(Number(queryParams['tableId']));
    //           }
    //         }, 100);
    //       }
    //     }
    //     this.treeLoad = false;
    //   }).catch((e) => {
    //   console.log(e);
    //   this.treeLoad = false;
    // });
  }


  treeInit(dbs: Array<DataBaseMeta>): void {
    // console.log(dbs);
    this.nodes = [];
    for (let db of dbs) {
      let children = [];
      let dbNode: NzTreeNodeOptions = {'key': `${db.id}`, 'title': db.name, 'children': children};
      dbNode[KEY_DB_ID] = `${db.id}`;
      if (db.iconEndtype) {
        dbNode.icon = db.iconEndtype;
      }
      this.nodes.push(dbNode);
    }
  }


  public afterDataSourceManipuldate(response: PluginSaveResponse): void {
    // console.log(response);
    let biz = response.biz();
    if (biz.dbId && biz.name && biz.detailed) {
      this.addDBNode(biz);
    }
  }

  // 添加数据库按钮点击响应
  public addDbBtnClick(pluginDesc: Descriptor): void {

    PluginsComponent.openPluginInstanceAddDialog(this, pluginDesc
      , {name: 'datasource', require: true, extraParam: "type_" + db_model_detailed + ",update_false"}
      , `添加${pluginDesc.displayName}数据库`
      , (_, db) => {
        console.log(db);
        // let origin = {'key': `${db.dbId}`, 'title': db.name, 'children': []};
        // origin[KEY_DB_ID] = `${db.dbId}`;
        // // KEY_DB_ID
        // let newNode: NzTreeNodeOptions[] = [origin];
        // this.nodes = newNode.concat(this.nodes);
        //
        // let e = {'type': NodeType.DB, 'dbId': `${db.dbId}`};
        // // console.log([db, e, newNode]);
        // this.treeNodeClicked = true;
        // this.onEvent(e);
        this.addDBNode(db);
        //  this.notify.success("成功", `数据库${db.name}添加成功`, {nzDuration: 6000});
      });
  }

  private addDBNode(db: ProcessedDBRecord) {
    let desc = this.datasourceDesc.find((desc) => desc.impl === db.detailed.impl);
    if (!desc) {
      console.log(this.datasourceDesc);
      throw new Error("desc impl:" + db.detailed.impl + " can not find relevant Descriptor");
    }
    let origin: NzTreeNodeOptions
      = {'key': `${db.dbId}`, 'title': db.name, icon: desc.endtype, 'children': []};
    origin[KEY_DB_ID] = `${db.dbId}`;
    // KEY_DB_ID
    let newNode: NzTreeNodeOptions[] = [origin];
    this.nodes = newNode.concat(this.nodes);

    let e = {'type': NodeType.DB, 'dbId': `${db.dbId}`};
    // console.log([db, e, newNode]);
    this.treeNodeClicked = true;
    this.onEvent(e);
  }


  processDb(processLiteria: string, facade: boolean, update: boolean, pluginDesc?: Descriptor): PluginsComponent {

    let modalRef = this.openDialog(PluginsComponent, {nzTitle: `${processLiteria}${facade ? "门面" : ''}数据库`});
    let addDb: PluginsComponent = modalRef.getContentComponent();
    addDb.errorsPageShow = true;
    addDb.formControlSpan = 20;
    addDb.itemChangeable = false;
    if (pluginDesc) {
      let hlist = PluginsComponent.pluginDesc(pluginDesc, facade ? this.facadePluginsMetas[0] : this.pluginsMetas[0]);
      addDb._heteroList = hlist;
    }
//    addDb.setPluginMeta([{name: 'datasource', require: true, extraParam: `dsname_${this.selectedDb.dbName},update_true,type_${facade ? "facade" : db_model_detailed}`}])
    addDb.setPluginMeta(facade ? this.facadePluginsMetas : this.pluginsMetas);

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
        // this.notify.success("成功", , {nzDuration: 6000});
        this.successNotify(`数据库${dbSuit.name}添加成功`)
      }
    });
    return addDb;
  }

  public static openAddTableDialog(cpt: BasicFormComponent, db: DataBase): Promise<SuccessAddedDBTabs> {

    let modalRef = cpt.openDialog(TableAddComponent, {nzTitle: "添加表", nzWidth: "1000px"});
    let pm = modalRef.getContentComponent().processMode;
    // console.log(this.selectedDb);
    // if (this.selectedDb && this.selectedDb.dbId) {
    //   pm.dbId = this.selectedDb.dbId;
    //   pm.dbName = this.selectedDb.dbName;
    // } else if (this.selectedTable && this.selectedTable.tableName) {
    //   pm.dbId = `${this.selectedTable.dbId}`;
    //   pm.dbName = this.selectedTable.dbName;
    // }
    if (db) {
      pm.dbId = db.dbId;
      pm.dbName = db.dbName;
    }

    // console.log([pm, this.selectedTable]);

    return modalRef.afterClose.toPromise().then((r: SuccessAddedDBTabs) => {
      if (r) {
        return r;
      } else {
        return Promise.reject("none")
      }
    });
  }

  // 添加表按钮点击响应
  public addTableBtnClick(): void {

    if (this.selectedDb && this.selectedDb.dbId) {
      if (!this.selectedDb.supportDataXReader) {
        this.errNotify("数据源：" + this.selectedDb.dbName + ",插件：" + this.selectedDb.pluginImpl + "不支持表导入配置");
        return;
      }
    }

    // let modalRef = this.openDialog(TableAddComponent, {nzTitle: "添加表", nzWidth: "1000px"});
    // let pm = modalRef.getContentComponent().processMode;
    // console.log(this.selectedDb);
    let pm: DataBase;
    if (this.selectedDb && this.selectedDb.dbId) {
      pm = new DataBase(this.selectedDb.dbId, this.selectedDb.dbName);

    } else if (this.selectedTable && this.selectedTable.tableName) {
      // pm.dbId = ;
      // pm.dbName = ;
      pm = new DataBase(`${this.selectedTable.dbId}`, this.selectedTable.dbName);
    }


    DatasourceComponent.openAddTableDialog(this, pm).then((r: SuccessAddedDBTabs) => {
      // 添加表成功
      //   "createTime":1595853047656,
      //   "dbId":67,
      //   "gitTag":"purchase_match_info",
      //   "id":104,
      //   "name":"purchase_match_info",
      //   "opTime":1595853047656,
      //   "syncOnline":0,
      //  let ntable = r.bizresult;
      // console.log(ntable);
      let dbid = r.db.dbId;//`${ntable.dbId}`;
      let dbNode: NzTreeNode = this.dbtree.getTreeNodeByKey(dbid);
      if (dbNode) {
        dbNode.isExpanded = (true);
        let dnode = this.nodes.filter((n) => n.key === dbid);
        // console.log(dnode);
        if (dnode.length > 0) {
          // let children: NzTreeNodeOptions[] = ;
          let n: NzTreeNodeOptions[] = [];

          r.tabKeys.forEach((tab) => {
            n.push(this.createTreeNodeOptions(tab, r.db.dbId))
          });


          dnode[0].children = n; //n.concat(dnode[0].children);
        }
        this.nodes = [].concat(this.nodes);
        // console.log(dnode);
      }
    })


    // console.log([pm, this.selectedTable]);

    // modalRef.afterClose.subscribe((r: TisResponseResult) => {
    //   if (r && r.success) {
    //
    //   }
    // });
  }


  public activateTable(tableId: number): void {
  }

  public activateDb(dbId: number): void {
  }


  private onEvent(event: { 'type': NodeType, 'dbId': string, 'name'?: string }, targetNode?: NzTreeNode): void {
    if (!event.dbId) {
      throw new Error("param event.dbId can not be empty");
    }
    let type = event.type;
    let id = event.dbId;

    clickDBNode(this, event, targetNode)
      .then((response) => {

        switch (event.type) {
          case NodeType.DB: {
            let dbResp = response as DBClickResponse;
            if (targetNode) {
              targetNode.origin[key_tabs_fetch] = true;
              targetNode.clearChildren();
              let n: NzTreeNodeOptions[] = [];
              dbResp.tabs.forEach((tab) => {

                n.push(this.createTreeNodeOptions(tab, event.dbId));
              });
              if (n.length > 0) {
                targetNode.addChildren(n);
              }
            }

            this.createDetailedPluginsMetas(dbResp.db.dbName);
            this.selectedDb = dbResp.db;
            this.dataReaderPluginCfg(this.selectedDb);
            if (dbResp.facadeDb) {
              this.facdeDb = dbResp.facadeDb;// DatasourceComponent.createDB(id, biz.facade);
              this.createFacadePluginsMetas(dbResp.db.dbName);
            }
            return;
          }
          case NodeType.TAB:
            let tabResp = response as TableClickResponse;


            //tabResp.selectedTableHeteroList;

            this.selectedTable = tabResp.selectedTable;
            if (!targetNode) {
              throw new Error("targetNode must be present");
            }
            this.selectedDb = new DbPojo();
            // let m = DataxAddStep4Component.dataXReaderSubFormPluginMeta(desc.displayName, desc.impl, "selectedTabs", (DATAX_PREFIX_DB + dbName));
            this.selectedTablePluginMeta = tabResp.selectedTablePluginMeta;
            //let meta = <ISubDetailTransferMeta>{id: event.name};
            this.selectedTableHeteroList = tabResp.selectedTableHeteroList;
            // DataxAddStep4Component.initializeSubFieldForms(this, m, desc.impl
            //   , true, (subFieldForms: Map<string /*tableName*/, Array<Item>>, subFormHetero: HeteroList, readerDesc: Descriptor) => {

            // DataxAddStep4Component.processSubFormHeteroList(this, m, meta, null // , subFormHetero.descriptorList[0]
            // )
            //   .then((hlist: HeteroList[]) => {
            //     // this.openSubDetailForm(meta, pluginMeta, hlist);
            //
            //   });
            return;
          default:
            throw new Error("invalid event type:" + event.type);
        }

      }).catch((e) => {
      console.log(e);
    })

    //  let realId = 0;
    // let action = `action=offline_datasource_action&emethod=get_datasource_${type}_by_id&id=${id}&labelName=${event.name}`;
    // this.facdeDb = null;
    // this.selectedDb = null;
    // this.selectedTable = null;
    // this.httpPost('/offline/datasource.ajax', action)
    //   .then(result => {
    //     try {
    //       if (result.success) {
    //
    //         let biz = result.bizresult;
    //         // console.log([biz, type])
    //         if (type === NodeType.DB) {
    //           let detail = biz.detailed;
    //           let db = DatasourceComponent.createDB(id, detail, biz.dataReaderSetted, biz.supportDataXReader);
    //           // console.log([detail,db,targetNode]);
    //           let tabs: Array<string> = biz.selectedTabs;
    //           if (targetNode) {
    //             targetNode.origin[key_tabs_fetch] = true;
    //             targetNode.clearChildren();
    //             let n: NzTreeNodeOptions[] = [];
    //             tabs.forEach((tab) => {
    //
    //               n.push(this.createTreeNodeOptions(tab, event.dbId));
    //             });
    //             if (n.length > 0) {
    //               targetNode.addChildren(n);
    //             }
    //           }
    //
    //           this.createDetailedPluginsMetas(db.dbName);
    //           this.selectedDb = db;
    //           this.dataReaderPluginCfg(this.selectedDb);
    //           if (biz.facade) {
    //             this.facdeDb = DatasourceComponent.createDB(id, biz.facade);
    //             this.facdeDb.facade = true;
    //             this.createFacadePluginsMetas(db.dbName);
    //           }
    //         } else if (type === NodeType.TAB) {
    //           let descs: Map<string /* impl */, Descriptor> = Descriptor.wrapDescriptors(biz);
    //           let desc: Descriptor = descs.values().next().value;
    //           //  console.log([biz, descs, desc]);
    //           let dbName = targetNode.parentNode.title;
    //           this.selectedTable = {
    //             tableName: event.name,
    //             dbName: dbName,
    //             dbId: parseInt(targetNode.parentNode.key, 10)
    //           };
    //           if (!targetNode) {
    //             throw new Error("targetNode must be present");
    //           }
    //           this.selectedDb = new DbPojo();
    //           let m = DataxAddStep4Component.dataXReaderSubFormPluginMeta(desc.displayName, desc.impl, "selectedTabs", (DATAX_PREFIX_DB + dbName));
    //           this.selectedTablePluginMeta = [m];
    //           let meta = <ISubDetailTransferMeta>{id: event.name};
    //
    //           // DataxAddStep4Component.initializeSubFieldForms(this, m, desc.impl
    //           //   , true, (subFieldForms: Map<string /*tableName*/, Array<Item>>, subFormHetero: HeteroList, readerDesc: Descriptor) => {
    //
    //           DataxAddStep4Component.processSubFormHeteroList(this, m, meta, null // , subFormHetero.descriptorList[0]
    //           )
    //             .then((hlist: HeteroList[]) => {
    //               // this.openSubDetailForm(meta, pluginMeta, hlist);
    //               this.selectedTableHeteroList = hlist;
    //             });
    //           //  });
    //         }
    //       } else {
    //         this.processResult(result);
    //       }
    //     } finally {
    //     }
    //   }).catch((e) => {
    //   console.log(e);
    // });
  }


  /**
   * 创建Tab的叶子节点
   * @param tab
   * @param dbId
   * @private
   */
  private createTreeNodeOptions(tab: string, dbId: string) {
    let t: NzTreeNodeOptions = {'key': tab, 'title': tab, 'isLeaf': true, 'icon': "table"};
    t[KEY_DB_ID] = dbId;
    return t;
  }


  private createDetailedPluginsMetas(dbName: string) {
    this.pluginsMetas = createDataSourceDetailedPluginsMetas(dbName);
    // [{
    //   name: 'datasource',
    //   'require': true,
    //   'extraParam': `dsname_${dbName},type_${db_model_detailed},update_true`
    // }];
  }

  private createFacadePluginsMetas(dbName: string) {
    this.facadePluginsMetas = [{
      name: 'datasource',
      'require': true,
      'extraParam': `dsname_${dbName},type_${db_model_facade},update_true`
    }];
  }

  private dataReaderPluginCfg(selectedDb: DbPojo) {
    this.dataReaderPluginMetas = [{
      name: 'dataxReader',
      require: true,
      extraParam: `update_${true},justGetItemRelevant_true,${selectedDb ? (DATAX_PREFIX_DB + selectedDb.dbName) : ""}`
    }];
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
   * 删除一个db
   */
  deleteDb(): void {
    if (!this.selectedDb) {
      //  this.notify.error("成功", `请选择要删除的数据节点`, {nzDuration: 6000});
      this.errNotify(`请选择要删除的数据节点`);
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
              if (result.msg.length < 1) {
                this.successNotify(`${this.dbType}数据库'${this.selectedDb.dbName}'删除成功`);
              }

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

    // this.modalService.confirm({
    //   nzTitle: '删除表',
    //   nzContent: `是否要删除表'${this.selectedTable.dbName}.${this.selectedTable.tableName}'`,
    //   nzOkText: '执行',
    //   nzCancelText: '取消',
    //   nzOnOk: () => {
    //     let action = 'action=offline_datasource_action&';
    //     action = action + 'event_submit_do_delete_datasource_table_by_id=y&id=' + this.selectedTable.tabId;
    //     this.httpPost('/offline/datasource.ajax', action)
    //       .then(result => {
    //         if (result.success) {
    //           let tnode: NzTreeNode = this.dbtree.getTreeNodeByKey(`${this.selectedTable.dbId}`);
    //           if (!tnode) {
    //             throw new Error(`dbname:${this.selectedTable.dbName} relevant db instance is not exist`);
    //           }
    //
    //           tnode.getChildren() //
    //             .filter((n) => n.key === `${this.selectedTable.tabId}`) //
    //             .map((n) => { //
    //               n.remove();
    //             })
    //           // this.notify.success("成功", , {nzDuration: 6000});
    //           this.successNotify(`表'${this.selectedTable.dbName}.${this.selectedTable.tableName}'删除成功`);
    //           this.selectedDb = null;
    //           this.selectedTable = null;
    //           this.treeNodeClicked = false;
    //         }
    //         this.processResult(result);
    //       });
    //   }
    // });
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

  nzEvent(event: NzFormatEmitEvent) {
    let dbNode = event.node;
    // console.log(dbNode.isExpanded);
    if (dbNode.isExpanded) {
      let tabsFetch: boolean = dbNode.origin[key_tabs_fetch];
      if (!tabsFetch) {
        this.nzDSTreeClickEvent(event);
      }
    }

  }

  // 点击节点
  nzDSTreeClickEvent($event: NzFormatEmitEvent) {
    this.treeNodeClicked = true;
    let dbId = $event.node.origin[KEY_DB_ID];
    if (!dbId) {
      throw new Error("node:" + $event.node.origin.title + " prop dbId can not be null");
    }
    let e = {
      'type': ($event.node.isLeaf ? NodeType.TAB : NodeType.DB),
      'dbId': dbId,
      'name': $event.node.origin.title
    };
    this.onEvent(e, $event.node);
  }

  afterPluginInit(evne: HeteroList[]) {
    // console.log([this.datasourceDesc, evne]);
    this.supportFacade = false;
    for (let index = 0; index < evne.length; index++) {
      let catItems: HeteroList = evne[index];
      let item: Item = catItems.items.find((_) => true);
      if (!item) {
        throw new Error("can not find item");
      }
      let des: Descriptor = catItems.descriptors.get(item.impl);
      if (!des) {
        throw new Error(`can not find plugin impl:${item.impl} in desc map`);
      }
      let ep = des.extractProps;
      this.facadeSourceDesc = [];
      if (ep["supportFacade"]) {
        let facadeSourceTypes: string[] = ep["facadeSourceTypes"];
        facadeSourceTypes.filter((r) => {
          let findDes = this.datasourceDesc.find((dd) => (dd.displayName === r));
          if (findDes) {
            this.facadeSourceDesc.push(findDes);
          }
        });
        this.supportFacade = true;
      }
      break;
    }

  }

  afterSave(event: PluginSaveResponse) {
    this.updateMode = !event.saveSuccess;
  }

  selectedIndexChange() {
    this.updateMode = false;
  }

  afterDataReaderInit(hlist: HeteroList[]) {
    // console.log(event);
    TableAddComponent.findDBNameProp(hlist);
  }

  // openNotebook(event: PluginSaveResponse) {
  //   let zeppelinNoteId = event.biz();
  //   let baseUrl = window.location.href.replace(this.router.url, '');
  //   let newRelativeUrl = this.router.createUrlTree(['zeppelin/notebook', zeppelinNoteId]);
  //   window.open(baseUrl + newRelativeUrl, '_blank');
  // }
  colsMetaClick(selectedTable: { tableName?: string; dbId?: number; dbName?: string }) {
    TableSelectComponent.reflectTabCols(this, `${selectedTable.dbId}`, selectedTable.tableName)
      .then((cols: Array<IColumnMeta>) => {
        this.colsMeta = cols;
      });
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
