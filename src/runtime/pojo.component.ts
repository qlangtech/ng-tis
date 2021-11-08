/**
 * Copyright (c) 2020 QingLang, Inc. <baisui@qlangtech.com>
 * <p>
 *   This program is free software: you can use, redistribute, and/or modify
 *   it under the terms of the GNU Affero General Public License, version 3
 *   or later ("AGPL"), as published by the Free Software Foundation.
 * <p>
 *  This program is distributed in the hope that it will be useful, but WITHOUT
 *  ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 *   FITNESS FOR A PARTICULAR PURPOSE.
 * <p>
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Created by baisui on 2017/3/29 0029.
 */
import {Component, ElementRef, ViewChild} from '@angular/core';
import {TISService} from '../common/tis.service';
// import {BasicEditComponent} from '../corecfg/basic.edit.component';
// import {ScriptService} from '../service/script.service';

import {AppFormComponent, CurrentCollection} from '../common/basic.form.component';
import {ActivatedRoute} from '@angular/router';
import {EditorConfiguration} from "codemirror";
import {NzModalService} from "ng-zorro-antd/modal";

@Component({
  template: `
          <tis-codemirror  [config]="codeMirrirOpts" [ngModel]="pojoJavaContent"></tis-codemirror>
  `,
})
export class PojoComponent extends AppFormComponent {
  // private code: ElementRef;

  pojoJavaContent: string;

  // @ViewChild('codeArea', {static: false}) set codeArea(e: ElementRef) {
  //   this.code = e;
  // }

  constructor(tisService: TISService, route: ActivatedRoute, modalService: NzModalService) {
    super(tisService, route, modalService);
  }

  get codeMirrirOpts(): EditorConfiguration {
    return {
      mode: "text/x-java",
      lineNumbers: true
    };
  }

  protected initialize(app: CurrentCollection): void {
    console.log(app);
    this.httpPost('/coredefine/corenodemanage.ajax'
      , 'action=core_action&emethod=get_pojo_data')
      .then((r) => {
        if (r.success) {
          //       this.code.nativeElement.innerHTML = r.bizresult;
          this.pojoJavaContent = r.bizresult;
        }
      });
  }

}
