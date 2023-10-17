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

import {Component, OnInit} from "@angular/core";
import {BasicFormComponent} from "../common/basic.form.component";
import {LocalStorageService} from "angular-2-local-storage";
import {TISService} from "../common/tis.service";
import {LatestSelectedIndex} from "../common/LatestSelectedIndex";
import {TisResponseResult} from "../common/tis.plugin";
import * as NProgress from "nprogress/nprogress";

// 这个类专门负责router
@Component({
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
  `,
})
export class AppComponent  implements OnInit {

  constructor( private _localStorageService: LocalStorageService, private  tisService: TISService) {
  }

  ngOnInit(): void {

    let getUserUrl = `/runtime/applist.ajax?emethod=get_user_info&action=user_action`;

   // this.tisService.httpPost(url, body).then(this.webExecuteCallback).catch(this.handleError);
    NProgress.start();
    this.tisService.httpPost(getUserUrl, '').then(this.webExecuteCallback).then((r) => {
      if (r.success) {
        // this.userProfile = r.bizresult.usr;
        // this.tisMeta = r.bizresult.tisMeta;
        // console.log(['get_user_info',r.bizresult]);
        this.tisService.tisMeta = r.bizresult;// this.tisMeta;
        // let popularSelected: LatestSelectedIndex = LatestSelectedIndex.popularSelectedIndex(this.tisService, this._localStorageService);
        // this._latestSelected = popularSelected.popularLatestSelected;
        // console.log(this._latestSelected);

        // let popularSelected = LatestSelectedIndex.popularSelectedIndex(this.tisService, this._localStorageService);
        //
        // if (this.app) {
        //   popularSelected.addIfNotContain(this.app);
        // }
        //
        // this.collectionOptionList = popularSelected.popularLatestSelected;
        //
        //
        // if (!r.bizresult.sysInitialized) {
        //   this.openInitSystemDialog();
        // }
      }
    });

  }

  private webExecuteCallback = (r: TisResponseResult): TisResponseResult => {
    NProgress.done();
    return r;
  }

}
