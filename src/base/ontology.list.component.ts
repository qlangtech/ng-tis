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

import {AfterViewInit, Component, OnInit, ViewChild, ViewContainerRef} from "@angular/core";
import {TISService} from "../common/tis.service";
import {BasicFormComponent} from "../common/basic.form.component";
import {NzModalService} from "ng-zorro-antd/modal";
import {Breadcrumb} from "../runtime/misc/RCDeployment";
import {Descriptor} from "../common/tis.plugin";
import {PluginsComponent} from "../common/plugins.component";
import {Pager} from "../common/pagination.component";
import {Application} from "../common/application";
import {ActivatedRoute, Router} from "@angular/router";


//import {DataxWorkerAddExistPowerjobClusterComponent} from "./datax.worker.add.exist.powerjob.cluster.component";

@Component({
  template: `
    <tis-page-header [breadcrumb]="breadcrumb.breadcrumb" [title]="breadcrumb.name">
      <tis-header-tool>
        <tis-plugin-add-btn (afterPluginAddClose)="initComponents(false)"
                            [btnStyle]="'width: 5em'"
                            (primaryBtnClick)="primaryBtnClick($event)"
                            (addPlugin)="addDbBtnClick($event)" [btnSize]="'default'"
                            [extendPoint]="'com.qlangtech.tis.plugin.ontology.OntologyDomain'"
                            [initDescriptors]="true" [lazyInitDescriptors]="true"
                            [descriptors]="[]">
          <i class="fa fa-plus" aria-hidden="true"></i>
          添加
        </tis-plugin-add-btn>
      </tis-header-tool>
    </tis-page-header>

    <tis-page [rows]="pageList" [pager]="pager" [spinning]="formDisabled" (go-page)="gotoPage($event)">
      <page-row-assist>


      </page-row-assist>

      <tis-col title="实例" width="16">
        <ng-template let-app='r'>
          <button nz-button nzType="link" nzSize="small"
                  (click)="gotoOntology(app)">{{ app.name }}
          </button>
        </ng-template>
      </tis-col>


      <tis-col title="创建时间">
        <ng-template let-app='r'> {{ app.createTime | date : "yyyy/MM/dd HH:mm:ss" }}</ng-template>
      </tis-col>

      <tis-col title="管理" width="20">
        <ng-template let-app='r'>


        </ng-template>
      </tis-col>
    </tis-page>

  `
})
export class OntologyListComponent extends BasicFormComponent implements AfterViewInit, OnInit {
  @ViewChild('container', {read: ViewContainerRef, static: true}) containerRef: ViewContainerRef;
  pager: Pager = new Pager(1, 1);
  pageList: Array<Application> = [];
  // multiViewDAG: MultiViewDAG;
  //processMeta: ProcessMeta;
  breadcrumb: Breadcrumb;

  constructor(tisService: TISService, modalService: NzModalService, private router: Router, private route: ActivatedRoute) {
    super(tisService, modalService);
  }

  ngAfterViewInit() {
  }


  ngOnInit(): void {

    this.breadcrumb = {
      "breadcrumb": [],
      "name": "Ontology"
    }

    this.route.queryParams.subscribe((param) => {

      let nameQuery = '';
      // for (let key in param) {
      //   nameQuery += ('&' + key + '=' + param[key]);
      // }
      this.httpPost('/runtime/applist.ajax'
        , 'emethod=get_ontology_domain&action=ontology_action' + nameQuery)
        .then((r) => {
          if (r.success) {
            this.pager = Pager.create(r);
            //let payload = this.pager.payload;
            this.pageList = r.bizresult.rows;
            //this.setAppListRunningIncrConsumeStat();
          }
        });
    });

  }

  gotoOntology(ontology: Ontology) {
    this.router.navigate(['/base/ontology/', ontology.name]);
  }

  protected initComponents(b: boolean) {

  }

  primaryBtnClick(pluginDesc: Descriptor[]) {
    for (let desc of pluginDesc) {
      this.addDbBtnClick(desc);
      return;
    }

  }

  addDbBtnClick(pluginDesc: Descriptor) {
    // console.log(pluginDesc)

    PluginsComponent.openPluginInstanceAddDialog(this, pluginDesc
      , {name: 'ontology-domain', require: true, extraParam: ""}
      , `添加${pluginDesc.displayName}域`
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
        // this.addDBNode(db);
        //  this.notify.success("成功", `数据库${db.name}添加成功`, {nzDuration: 6000});
      });
  }

  public gotoPage(p: number) {

    Pager.go(this.router, this.route, p);
  }
}

export type Ontology = {
  name: string;
  createTime: number
}






