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

import {TISService} from '../common/tis.service';
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {PluginSaveResponse} from "../common/tis.plugin";
import {NotebookwrapperComponent} from "../common/plugins.component";
import {NzDrawerService} from "ng-zorro-antd/drawer";

@Component({
  // templateUrl: '/runtime/baseManageIndex.htm'
  template: `
      <my-navigate></my-navigate>
      <div class="body_content">
          <router-outlet></router-outlet>
      </div>
<!--      <router-outlet name="zeppelin"></router-outlet>-->
      <!--   -->
  `
})
export class BaseMangeIndexComponent implements OnInit {
  constructor(private router: Router, private route: ActivatedRoute, private tisService: TISService, private drawerService: NzDrawerService) {

  }

  ngOnInit(): void {
    // console.log(this.router.config);
   // console.log(this.route.pathFromRoot);
  }

  // goZeppelin() {
  // }
  //
  // openNotebook() {
  //   const drawerRef = this.drawerService.create<NotebookwrapperComponent, {}, {}>({
  //     nzWidth: "80%",
  //     nzPlacement: "right",
  //     nzTitle: `插件管理`,
  //     nzContent: NotebookwrapperComponent,
  //     nzContentParams: {}
  //   });
  //   this.router.navigate(["/", {outlets: {"zeppelin": 'z/zeppelin/notebook/2HMEN4XX3'}}], {relativeTo: this.route})
  // }
}
