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

import {Component} from "@angular/core";
import {TISService} from "../common/tis.service";
import {BasicFormComponent} from "../common/basic.form.component";

import {NzModalService} from "ng-zorro-antd/modal";

// 会员权限管理
@Component({
  template: `
    <h1>Membership</h1>
  `
})
export class MembershipComponent extends BasicFormComponent {
  constructor(tisService: TISService, modalService: NzModalService) {
    super(tisService, modalService);
  }


}
