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
 * Created by baisui on 2017/4/26 0026.
 */
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {BasicFormComponent} from '../common/basic.form.component';
import {TISService} from '../service/tis.service';
import {Location} from '@angular/common';

//  @ts-ignore
import * as $ from 'jquery';
import {NzModalRef} from "ng-zorro-antd";
import {HeteroList, Item, PluginSaveResponse} from "../common/tis.plugin";


@Component({
  template: `
      <tis-plugins (ajaxOccur)="onResponse($event)" [errorsPageShow]="true" [formControlSpan]="20"
                   [shallInitializePluginItems]="false" [_heteroList]="hlist" [showSaveButton]="true" [plugins]="['datasource']"></tis-plugins>
  `
})
export class DbAddComponent extends BasicFormComponent implements OnInit {
  switchType = 'single';
  dbEnums: DbEnum[] = [];
  @Input() dbPojo: DbPojo = new DbPojo();
  errorItem: Item = Item.create([]);

  hlist: HeteroList[] = [];

  @Output() successSubmit = new EventEmitter<any>();

  isAdd: boolean;
  confirmBtn: string;

  // get dbNameReadOnly(): boolean {
  //   return !this.dbPojo.facade && this.dbPojo.dbId != null;
  // }


  constructor(tisService: TISService,
              private location: Location
    , public activeModal: NzModalRef) {
    super(tisService);
  }


  get title(): string {
    // return this._title;
    return (this.isAdd ? "添加" : "更新") + (this.dbPojo.facade ? "门面" : "") + "数据库";
  }

  ngOnInit(): void {
    if (this.dbPojo.dbId) {
      this.isAdd = false;
    } else {
      this.isAdd = true;
    }
  }

  // /**
  //  * 校验db配置
  //  */
  // verifyDbConfig() {
  //   this.jsonPost('/offline/datasource.ajax?action=offline_datasource_action&event_submit_do_verify_db_config_' + (this.isAdd ? 'add' : 'update') + '=y', this.dbPojo)
  //     .then(result => {
  //       this.processResult(result);
  //       if (!result.success) {
  //         this.errorItem = Item.processFieldsErr(result);
  //       }
  //     });
  // }

  // public saveDbConfig(form: any): void {
  //   //  console.log($(form).serialize());
  //   // let action = $(form).serialize();
  //
  //   this.jsonPost('/offline/datasource.ajax?action=offline_datasource_action&event_submit_do_'
  //     + this.actionMethod + '=y', this.dbPojo)
  //     .then(result => {
  //       this.processResult(result);
  //       if (result.success) {
  //         let dbid = result.bizresult;
  //         this.dbPojo.dbId = dbid;
  //         this.successSubmit.emit(this.dbPojo);
  //         this.activeModal.close(this.dbPojo);
  //       } else {
  //         // 多个插件组
  //         this.errorItem = Item.processFieldsErr(result);
  //       }
  //     });
  // }

  onResponse(resp: PluginSaveResponse) {
    if (resp.saveSuccess) {
      //  this.activeModal.close(this.dbPojo);
    }
  }


  // private get actionMethod(): string {
  //   return ((this.isAdd) ? 'add' : 'edit') + '_' + (this.dbPojo.facade ? 'facade' : 'datasource') + '_db';
  // }


  // changeType(value: string): void {
  //   // console.log(value);
  //   this.switchType = value;
  // }


  // shardingEnumChange(shardingEnum: string, form: any): void {
  //   // console.log(shardingEnum);
  //   this.httpPost('/offline/datasource.ajax',
  //     $(form).serialize().replace('event_submit_do_add_datasource_db', 'event_submit_do_get_sharding_enum'))
  //     .then(
  //       result => {
  //         // console.log(result);
  //         // this.testDbBtnDisable = false;
  //         this.processResult(result);
  //         this.dbEnums = [];
  //         if (result.bizresult) {
  //           for (let dbEnum of result.bizresult) {
  //             this.dbEnums.push(new DbEnum(dbEnum.dbName, dbEnum.host));
  //           }
  //         }
  //       });
  // }

  // goBack(): void {
  //   // this.router.navigate(['/t/offline']);
  //   // this.location.back();
  // }


  // getValue(value: any): any {
  //   return value;
  // }


}

export class DbEnum {
  dbName: string;
  host: string;

  constructor(dbName: string, host: string) {
    this.dbName = dbName;
    this.host = host;
  }
}

export class DbPojo {
  dbName = '';
  // 是否是Cobar配置
  facade = false;

  constructor(public dbId?: string) {

  }
}
