import {BasicFormComponent} from "../common/basic.form.component";
import {Component, Input, OnInit} from "@angular/core";
import {Descriptor, HeteroList, PluginSaveResponse} from "../common/tis.plugin";
import {TISService} from "../common/tis.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NzModalService} from "ng-zorro-antd/modal";
import {NzNotificationService} from "ng-zorro-antd/notification";

import {NzDrawerService} from "ng-zorro-antd/drawer";
import {PluginsComponent} from "../common/plugins.component";
import {CreatorRouter} from "../common/plugin/type.utils";
import {NzDrawerRef} from "ng-zorro-antd/drawer/drawer-ref";
import {
  clickDBNode, createDataSourceDetailedPluginsMetas,
  DataBaseMeta,
  db_model_detailed,
  DBClickResponse,
  loadDSWithDesc, NodeType,
  ProcessedDBRecord
} from "./ds.utils";

export function createDrawer(drawerService: NzDrawerService, creatorRouter: CreatorRouter, filterDbsShallSupportReader = true): NzDrawerRef {
  const drawerRef = drawerService.create<
    DatasourceQuickManagerComponent
    , { hetero: HeteroList[] }
    , { hetero: HeteroList }>({
    nzWidth: "30%",
    nzTitle: `数据源列表`,
    nzContent: DatasourceQuickManagerComponent,
    nzPlacement: "left",
    nzContentParams: {"creatorRouter": creatorRouter, "filterDbsShallSupportReader": filterDbsShallSupportReader}
  });
  return drawerRef;
}


@Component({
  template: `
    <tis-page-header [result]="result" [showBreadcrumb]="false" (refesh)="refesh()">
      <tis-page-header-left>
        <nz-space>

          <tis-plugin-add-btn *nzSpaceItem (afterPluginAddClose)="initComponents(false)"
                              [btnStyle]="'width: 4em'"
                              (addPlugin)="addDbBtnClick($event)" [btnSize]="'small'"
                              [extendPoint]="'com.qlangtech.tis.plugin.ds.DataSourceFactory'"
                              [descriptors]="datasourceDesc">
            <i class="fa fa-plus" aria-hidden="true"></i>
            <i class="fa fa-database" aria-hidden="true"></i></tis-plugin-add-btn>

          <a *nzSpaceItem style="font-size: 12px;font-weight: normal;color: #999999" target="_blank"
             href="/offline/ds">数据源管理</a>
        </nz-space>
      </tis-page-header-left>
    </tis-page-header>

    <tis-page [rows]="dsList">
      <!--      <page-row-assist>-->
      <!--        <ng-template let-u='r'>-->
      <!--          <tis-plugins (afterSave)="afterSave($event)"-->
      <!--                       [errorsPageShow]="false"-->
      <!--                       [formControlSpan]="13" [shallInitializePluginItems]="false"-->
      <!--                       [showSaveButton]="updateMode" [disabled]="!updateMode"-->
      <!--                       (afterPluginManipulate)="afterDataSourceManipuldate($event)"-->
      <!--                       [plugins]="pluginsMetas"></tis-plugins>-->
      <!--        </ng-template>-->

      <!--      </page-row-assist>-->

      <tis-col title="#" width="10">
        <ng-template let-ds='r'>
          {{ds.id}}
        </ng-template>
      </tis-col>
      <tis-col title="名称">
        <ng-template let-ds='r'>
          <span nz-icon style="font-size: 26px" [nzType]="ds.iconEndtype" nzTheme="outline"></span>
          <button nz-button nzType="link" (click)="exitDataSource(ds)">{{ds.name}}</button>
        </ng-template>
      </tis-col>
    </tis-page>

  `,
  styles: [`

  `]
})
export class DatasourceQuickManagerComponent extends BasicFormComponent implements OnInit {
  // pager: Pager = new Pager(1, 1);
  dsList: Array<DataBaseMeta> = [];
  datasourceDesc: Array<Descriptor> = [];
  updateMode = false;
  // pluginsMetas: PluginType[] = [];
  @Input()
  creatorRouter: CreatorRouter;

  @Input()
  filterDbsShallSupportReader = true;


  constructor(protected tisService: TISService //
    , private router: Router //
    , private activateRoute: ActivatedRoute // modalService: NgbModal
    , modalService: NzModalService //
    , notify: NzNotificationService, private drawerService: NzDrawerService
  ) {
    super(tisService, modalService, notify);
    tisService.currentApp = null;
  }

  ngOnInit(): void {
    // let nameQuery = '';
    // for (let key in param) {
    //   nameQuery += ('&' + key + '=' + param[key]);
    // }
    // this.httpPost('/offline/datasource.ajax'
    //   , 'emethod=get_datasource_info&action=offline_datasource_action')
    //   .then((r) => {
    //     if (r.success) {
    //       this.pager = Pager.create(r);
    //       this.dsList = r.bizresult.rows;
    //     }
    //   });

    loadDSWithDesc(this, this.filterDbsShallSupportReader, this.creatorRouter)
      .then(({dbsWhichSupportDataXReader, desc}) => {
        // console.log([desc, dbsWhichSupportDataXReader]);
        this.datasourceDesc = desc;
        this.dsList = dbsWhichSupportDataXReader;

      }).catch((e) => {
      console.log(e);
    });
  }

  initComponents(b: boolean) {
    // let action = 'emethod=get_datasource_info&action=offline_datasource_action';
    // this.httpPost('/offline/datasource.ajax', action)
    //   .then(result => {
    //   });
  }

  addDbBtnClick(pluginDesc: Descriptor) {
    PluginsComponent.openPluginInstanceAddDialog(this, pluginDesc
      , {name: 'datasource', require: true, extraParam: "type_" + db_model_detailed + ",update_false"}
      , `添加${pluginDesc.displayName}数据库`
      , (_, db: ProcessedDBRecord) => {
        // console.log(db);

        let newDb: DataBaseMeta = {id: db.dbId, name: db.name, iconEndtype: pluginDesc.endtype};
        this.dsList = [newDb, ...this.dsList];
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
        // this.addDBNode(db);
        //  this.notify.success("成功", `数据库${db.name}添加成功`, {nzDuration: 6000});
      });
  }

  afterDataSourceManipuldate($event: PluginSaveResponse) {

  }

  afterSave($event: PluginSaveResponse) {

  }

  exitDataSource(ds: DataBaseMeta) {
    // let a: any = ds;
    // let openAssist = a.openAssist;
    // this.dsList.forEach((app) => {
    //   (app as any).openAssist = false;
    // });
    //
    // a.openAssist = !openAssist;
    // if (a.openAssist) {
    //   //  let e = {'type': NodeType.DB, 'dbId': `${ds.id}`};
    //
    //   this.pluginsMetas = createDataSourceDetailedPluginsMetas(ds.name);
    //
    //   // clickDBNode(this, e, null)
    //   //   .then((response) => {
    //   //     let dbResp = response as DBClickResponse;
    //   //
    //   //
    //   //   });
    // }

    let e = {'type': NodeType.DB, 'dbId': `${ds.id}`};
    clickDBNode(this, e, null)
      .then((response) => {
        let dbResp = response as DBClickResponse;
        const drawerRef = this.drawerService.create<
          PluginsComponent
          , { hetero: HeteroList[] }
          , { hetero: HeteroList }>({
          nzOffsetX: 250,
          nzWidth: "50%",
          nzTitle: `数据源'` + ds.name + "'配置",
          nzContent: PluginsComponent,
          nzPlacement: "left",
          nzContentParams: {
            errorsPageShow: false,
            formControlSpan: 13,
            shallInitializePluginItems: false,
            showSaveButton: true,
            disabled: false,
            useCollapsePanel: true,
            plugins: createDataSourceDetailedPluginsMetas(dbResp.db.dbName)
          }
        });
        drawerRef.afterClose.subscribe(hetero => {
          if (!hetero) {
            return;
          }
        });

      });


  }

  refesh() {
    this.ngOnInit();
  }
}
