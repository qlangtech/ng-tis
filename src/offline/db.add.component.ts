/**
 * Created by baisui on 2017/4/26 0026.
 */
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {BasicFormComponent} from '../common/basic.form.component';
import {TisResponseResult, TISService} from '../service/tis.service';
import {Router} from '@angular/router';
import {Location} from '@angular/common';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
//  @ts-ignore
import * as $ from 'jquery';
import {NzModalRef, NzModalService} from "ng-zorro-antd";
import {IFieldError, Item} from "../common/tis.plugin";
import {PluginsComponent} from "../common/plugins.component";


@Component({
  template: `
      <tis-page-header [showBreadcrumb]="false" [result]="result">
          <button nz-button (click)="verifyDbConfig()" [nzLoading]="this.formDisabled">校验</button>&nbsp;
          <button nz-button nzType="primary" (click)="saveDbConfig(null)" [nzLoading]="this.formDisabled">提交</button>
      </tis-page-header>

      <tis-form [fieldsErr]="errorItem">
          <tis-ipt #dbname title="数据库名" name="dbName" require="true">
              <input nz-input [id]="dbname.name" [(ngModel)]="dbPojo.dbName" [readonly]="dbNameReadOnly">
          </tis-ipt>
          <tis-ipt #type title="数据库类型" name="dbType" require="true">
              <nz-select [id]="type.name" [name]="type.name" [(ngModel)]="dbPojo.dbType" nzAllowClear>
                  <nz-option nzValue="mysql" nzLabel="MySql"></nz-option>
              </nz-select>
          </tis-ipt>
          <tis-ipt #username title="用户名" name="userName" require="true">
              <input nz-input [id]="username.name" [name]="username.name" [(ngModel)]="dbPojo.userName"/>
          </tis-ipt>
          <tis-ipt #password title="密码" name="password" require="true">
              <input nz-input type="password" [id]="password.name" [name]="password.name" [(ngModel)]="dbPojo.password" placeholder="没有变化不需要输入"/>
          </tis-ipt>
          <tis-ipt #port title="端口" name="port" require="true">
              <input [id]="port.name" nz-input type="number" [name]="port.name" [(ngModel)]="dbPojo.port"/>
          </tis-ipt>
          <tis-ipt #ecode title="编码" name="encoding" require="true">
              <nz-select [id]="ecode.name" [name]="ecode.name" [(ngModel)]="dbPojo.encoding" nzAllowClear>
                  <nz-option nzValue="UTF-8" nzLabel="UTF-8"></nz-option>
                  <nz-option nzValue="GBK" nzLabel="GBK"></nz-option>
              </nz-select>
          </tis-ipt>
          <tis-ipt #extraParams title="附加参数" name="extraParams">
              <input [id]="extraParams.name" nz-input [name]="extraParams.name" [(ngModel)]="dbPojo.extraParams"/>
          </tis-ipt>
          <tis-ipt #host title="节点描述" name="host" require="true">
              <textarea [id]="host.name" nz-input [name]="host.name" [nzAutosize]="{ minRows: 6, maxRows: 6 }" [(ngModel)]="dbPojo.host"
                        placeholder="127.0.0.1[00-31],127.0.0.2[32-63],127.0.0.3,127.0.0.4[9],baisui.com[0-9]"></textarea>
          </tis-ipt>
      </tis-form>
  `
})
export class DbAddComponent extends BasicFormComponent implements OnInit {
  switchType = 'single';
  dbEnums: DbEnum[] = [];
  @Input() dbPojo: DbPojo = new DbPojo();

  errorItem: Item = Item.create([]);

  @Output() successSubmit = new EventEmitter<any>();

  isAdd: boolean;
  confirmBtn: string;

  get dbNameReadOnly(): boolean {
    return !this.dbPojo.facade && this.dbPojo.dbId != null;
  }

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

  /**
   * 校验db配置
   */
  verifyDbConfig() {
    this.jsonPost('/offline/datasource.ajax?action=offline_datasource_action&event_submit_do_verify_db_config_' + (this.isAdd ? 'add' : 'update') + '=y', this.dbPojo)
      .then(result => {
        this.processResult(result);
        if (!result.success) {
          this.errorItem = Item.processFieldsErr(result);
        }
      });
  }

  public saveDbConfig(form: any): void {
    //  console.log($(form).serialize());
    // let action = $(form).serialize();

    this.jsonPost('/offline/datasource.ajax?action=offline_datasource_action&event_submit_do_'
      + this.actionMethod + '=y', this.dbPojo)
      .then(result => {
        this.processResult(result);
        if (result.success) {
          let dbid = result.bizresult;
          this.dbPojo.dbId = dbid;
          // let facdeDb = new DbPojo(this.dbPojo.dbId);
          // facdeDb.facade = true;
          // facdeDb.dbName = d.dbName;
          // facdeDb.encoding = d.encoding;
          // facdeDb.host = d.host;
          // facdeDb.password = '******';
          // facdeDb.port = d.port;
          // facdeDb.userName = d.userName;
          this.successSubmit.emit(this.dbPojo);
          this.activeModal.close(this.dbPojo);
        } else {
          // 多个插件组
          this.errorItem = Item.processFieldsErr(result);
        }
      });
  }


  private get actionMethod(): string {
    return ((this.isAdd || this.dbPojo.facade) ? 'add' : 'edit') + '_' + (this.dbPojo.facade ? 'facade' : 'datasource') + '_db';
  }


  changeType(value: string): void {
    // console.log(value);
    this.switchType = value;
  }

  // 连接测试
  // testDbConnection(form: any): void {
  //   this.testDbBtnDisable = true;
  //   let s = jQuery(form).serialize();
  //   console.log(s);
  //   console.log(s.replace('event_submit_do_add_datasource_db', 'event_submit_do_test_db_connection'));
  //   this.tisService.httpPost('/offline/datasource.ajax',
  //     jQuery(form).serialize().replace('event_submit_do_add_datasource_db', 'event_submit_do_test_db_connection'))
  //     .then(
  //       result => {
  //         console.log(result);

  //         this.testDbBtnDisable = false;
  //         this.processResult(result);
  //         console.log(result.success);
  //         if (result.success) {
  //           this.confirmBtnDisable = false;
  //         }
  //       });
  // }

  shardingEnumChange(shardingEnum: string, form: any): void {
    // console.log(shardingEnum);
    this.httpPost('/offline/datasource.ajax',
      $(form).serialize().replace('event_submit_do_add_datasource_db', 'event_submit_do_get_sharding_enum'))
      .then(
        result => {
          // console.log(result);
          // this.testDbBtnDisable = false;
          this.processResult(result);
          this.dbEnums = [];
          if (result.bizresult) {
            for (let dbEnum of result.bizresult) {
              this.dbEnums.push(new DbEnum(dbEnum.dbName, dbEnum.host));
            }
          }
        });
  }

  goBack(): void {
    // this.router.navigate(['/t/offline']);
    // this.location.back();
  }


  getValue(value: any): any {
    return value;
  }


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
  dbType: string;
  userName = '';
  password: string;
  port = '3306';
  encoding = 'UTF-8';
  extraParams = '';
  shardingType = 'single';
  host = '';
  shardingEnum = '';
  // 是否是Cobar配置
  facade = false;

  constructor(public dbId?: string) {

  }
}
