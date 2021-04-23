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

import {AfterContentInit, Component, Input} from "@angular/core";


// implements OnInit, AfterContentInit
@Component({
  selector: 'tis-msg',
  template: `
      <!--show msg-->
      <div *ngIf="showSuccessMsg">

          <nz-alert nzType="success" nzMessage="成功" [nzDescription]="msgtpl" nzShowIcon [nzBanner]="true" [nzCloseable]="true">
          </nz-alert>
          <ng-template #msgtpl>
              <ul class="list-ul-msg">
                  <ng-template ngFor let-m [ngForOf]="result.msg">
                      <li *ngIf="m.content">{{m.content}} &nbsp;&nbsp;
                          <a routerLink="{{m.link.href}}">{{m.link.content}}</a></li>
                      <li *ngIf="!m.content">{{m}}</li>
                  </ng-template>
              </ul>
          </ng-template>
      </div>
      <div *ngIf="showErrorMsg">
          <nz-alert nzType="error" nzMessage="Error" [nzDescription]="errortpl" nzShowIcon [nzBanner]="true" [nzCloseable]="true">
          </nz-alert>
          <ng-template #errortpl>
              <ul class="list-ul-msg">
                  <li *ngFor="let m of result.errormsg">{{m}}</li>
              </ul>
          </ng-template>
      </div>
      <!--end msg-->
  `
  ,
  styles: [
      `
    `
  ]
})
export class TisMsgComponent implements AfterContentInit {
  @Input()
  result: { success: boolean, msg: any[], errormsg: any[] }
    = {success: false, msg: [], errormsg: []};

  public get showSuccessMsg(): boolean {

    return (this.result != null) && (this.result.success === true)
      && (this.result.msg !== null) && this.result.msg.length > 0;

  }

  public get showErrorMsg(): boolean {
    return this.result != null && !this.result.success
      && this.result.errormsg && this.result.errormsg.length > 0;
  }

  ngAfterContentInit() {

  }

  jsonStr(v: any): string {
    return JSON.stringify(v);
  }


}
