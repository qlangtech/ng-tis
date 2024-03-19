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

import {Component, OnInit} from '@angular/core';


import {ActivatedRoute, Router} from "@angular/router";
import {NzModalService} from "ng-zorro-antd/modal";
import {BasicFormComponent} from "../common/basic.form.component";
import {Pager} from "../common/pagination.component";
import {TISService} from "../common/tis.service";
import {NzDrawerService} from "ng-zorro-antd/drawer";
import {DataXJobWorkerStatus} from "../runtime/misc/RCDeployment";

// 查看操作日志
@Component({
  template: `

    <tis-page-header title="Flink Cluster">
      <tis-header-tool>
        <button nz-button (click)="gotoCreateK8SSession()" nzType="primary">添加Flink Kubernetes Session</button>
      </tis-header-tool>
    </tis-page-header>
    <tis-page [spinning]="formDisabled" [pager]="pager" [rows]="clusters" (go-page)="goPage($event)">
      <tis-col title="名称" width="20">
        <ng-template let-l='r'>
          <dl class="cluster-desc">
            <dt>ClusterId</dt>
            <dd> <a [routerLink]="'/base/flink-session-detail/'+l.clusterId">{{l.clusterId}}</a></dd>
            <dt>Namespace</dt>
            <dd>{{l.k8sNamespace}}</dd>
            <dt>BasePath</dt>
            <dd>{{l.k8sBasePath}}</dd>
<!--            <dt>管道</dt>-->
<!--            <dd> <a><span nz-icon nzType="link" nzTheme="outline"></span>{{l.dataXName}}</a></dd>-->

          </dl>
          </ng-template>
      </tis-col>
      <tis-col title="Flink 入口" width="20">
        <ng-template let-l='r'><a target="_blank" [href]="l.webInterfaceURL"><span nz-icon nzType="link" nzTheme="outline"></span> {{l.webInterfaceURL}}</a></ng-template>
      </tis-col>
      <tis-col title="部署类型" width="20">
        <ng-template let-l='r'> <nz-tag nzColor="processing">{{l.clusterType}}</nz-tag> </ng-template>
      </tis-col>
      <tis-col title="创建时间">
        <ng-template let-l='r'>{{l.createTime | date : "yyyy/MM/dd HH:mm:ss"}}</ng-template>
      </tis-col>
      <tis-col title="操作">
        <ng-template let-l='r'>
          <button nz-button [nzType]="'link'"><i nz-icon nzType="eye" nzTheme="outline"></i></button>
        </ng-template>
      </tis-col>
    </tis-page>
  `,
  styles:[
    `.cluster-desc dt {
      float: left;
      font-weight: bold;
      color: #676767;
    }

    .cluster-desc dd {
      margin: 0 0 0 80px;
    }
    `
  ]
})
export class FlinkClusterListComponent extends BasicFormComponent implements OnInit {
  clusters: FlinkClusterPojo[] = [];
  //private detailLog: string;
  pager: Pager = new Pager(1, 1);

  constructor(tisService: TISService, modalService: NzModalService
    , private router: Router, private route: ActivatedRoute, private drawerService: NzDrawerService) {
    super(tisService, modalService);
  }


  ngOnInit(): void {
    // showBreadcrumb
    //  let sn = this.route.snapshot;
    // // this.showBreadcrumb = sn.data["showBreadcrumb"];
    //  this.route.queryParams.subscribe((param) => {
    //    this.httpPost('/runtime/operation_log.ajax'
    //      , `action=operation_log_action&emethod=get_error_log_list&page=${param['page']}`)
    //      .then((r) => {
    //        this.pager = Pager.create(r);
    //        this.logs = r.bizresult.rows;
    //      });
    //  });
    this.httpPost('/coredefine/corenodemanage.ajax'
      , `action=core_action&emethod=get_flink_cluster_list`)
      .then((r) => {
        if (r.success) {
          this.clusters = <FlinkClusterPojo[]>r.bizresult;
          // let dataXWorkerStatus: DataXJobWorkerStatus = Object.assign(new DataXJobWorkerStatus(), r.bizresult, {processMeta: processMeta});
          // return dataXWorkerStatus
        }
      });

  }


  goPage(pageNum: number) {
    Pager.go(this.router, this.route, pageNum);
  }

  logViewClose() {

  }

  gotoCreateK8SSession() {
    this.router.navigate(['/base','flink-cluster'],{relativeTo: this.route});
  }
}

class FlinkClusterPojo {
  clusterId: string;
  clusterType: string;
  createTime: number;
  dataXName: string;//"mysql_mysql4",
  k8sBasePath: string;//"https://192.168.64.3:8443",
  k8sId: string;//"tis_flink_image",
  k8sNamespace: string;//"default",
  webInterfaceURL: string;// "http://192.168.64.3:32260"

}
