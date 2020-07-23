/**
 * Created by baisui on 2017/4/26 0026.
 */
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {BasicFormComponent} from '../common/basic.form.component';
import {TISService} from '../service/tis.service';
import {Router} from '@angular/router';
import {Location} from '@angular/common';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
//  @ts-ignore
import * as $ from 'jquery';
import {NzModalRef, NzModalService} from "ng-zorro-antd";


@Component({
  template: `
      <tis-page-header [showBreadcrumb]="false" [result]="result">
          <button nz-button  (click)="saveDbConfig(null)" [nzLoading]="this.formDisabled">校验</button>&nbsp;
          <button nz-button nzType="primary" (click)="saveDbConfig(null)" [nzLoading]="this.formDisabled">提交</button>
      </tis-page-header>

      <tis-form>
          <tis-ipt title="数据库名" name="dbName">
              <ng-template let-i='i'>
                  <input type="hidden" name="facade" [value]="dbPojo.facade"/>
                  <input type="hidden" name="id" [value]="dbPojo.dbId"/>
                  <input nz-input [id]="i.id" [name]="i.name"
                         name="dbName" required (ngModelChange)="onChangeDbConfig($event)"
                         [(ngModel)]="dbPojo.dbName" [readonly]="dbNameReadOnly">
              </ng-template>
          </tis-ipt>
          <tis-ipt title="数据库类型" name="dbType">
              <ng-template let-i='i'>
                  <nz-select [id]="i.id" [name]="i.name" [(ngModel)]="dbPojo.dbType" nzAllowClear>
                      <nz-option nzValue="mysql" nzLabel="MySql"></nz-option>
                  </nz-select>
              </ng-template>
          </tis-ipt>
          <tis-ipt title="用户名" name="userName">
              <ng-template let-i='i'>
                  <input nz-input [id]="i.id" [name]="i.name"
                         [(ngModel)]="dbPojo.userName"/>
              </ng-template>
          </tis-ipt>
          <tis-ipt title="密码" name="password">
              <ng-template let-i='i'>
                  <input nz-input type="password" [id]="i.id" [name]="i.name" [(ngModel)]="dbPojo.password" placeholder="没有变化不需要输入"/>
              </ng-template>
          </tis-ipt>
          <tis-ipt title="端口" name="port">
              <ng-template let-i='i'>
                  <input [id]="i.id" nz-input type="number" [name]="i.name" [(ngModel)]="dbPojo.port"/>
              </ng-template>
          </tis-ipt>
          <tis-ipt title="编码" name="encoding">
              <ng-template let-i='i'>
                  <nz-select [id]="i.id" [name]="i.name" [(ngModel)]="dbPojo.encoding" nzAllowClear>
                      <nz-option nzValue="UTF-8" nzLabel="UTF-8"></nz-option>
                      <nz-option nzValue="GBK" nzLabel="GBK"></nz-option>
                  </nz-select>
              </ng-template>
          </tis-ipt>
          <tis-ipt title="附加参数" name="extraParams">
              <ng-template let-i='i'>
                  <input [id]="i.id" nz-input [name]="i.name" [(ngModel)]="dbPojo.extraParams"/>
              </ng-template>
          </tis-ipt>
          <tis-ipt title="节点描述" name="host">
              <ng-template let-i='i'>
                  <textarea [id]="i.id" nz-input [name]="i.name" [nzAutosize]="{ minRows: 6, maxRows: 6 }" [(ngModel)]="dbPojo.host"
                            placeholder="127.0.0.1[00-31],127.0.0.2[32-63],127.0.0.3,127.0.0.4[9],baisui.com[0-9]"></textarea>
              </ng-template>
          </tis-ipt>
      </tis-form>
  `
})
export class DbAddComponent extends BasicFormComponent implements OnInit {
  switchType = 'single';
  dbEnums: DbEnum[] = [];
  @Input()
  dbPojo: DbPojo = new DbPojo();

  @Output() successSubmit = new EventEmitter<any>();
  // id: any;
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

  public saveDbConfig(form: any): void {
    //  console.log($(form).serialize());
    let action = $(form).serialize();
    if (this.isAdd) {
    } else {
    }
    this.httpPost('/offline/datasource.ajax?action=offline_datasource_action&event_submit_do_'
      + this.actionMethod + '=y', action)
      .then(
        result => {
          this.processResult(result);
          if (result.success) {
            let d = result.bizresult;
            let facdeDb = new DbPojo(this.dbPojo._dbId);
            facdeDb.facade = true;
            facdeDb.dbName = d.dbName;
            facdeDb.encoding = d.encoding;
            facdeDb.host = d.host;
            facdeDb.password = '******';
            facdeDb.port = d.port;
            facdeDb.userName = d.userName;
            this.successSubmit.emit(facdeDb);
          }
        });
  }

  private get actionMethod(): string {
    return ((this.isAdd || this.dbPojo.facade) ? 'add' : 'edit') + '_' + (this.dbPojo.facade ? 'facade' : 'datasource') + '_db';
  }

  changeType(value: string): void {
    console.log(value);
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
          // console.log(result.bizresult);
          this.dbEnums = [];
          if (result.bizresult) {
            for (let dbEnum of result.bizresult) {
              this.dbEnums.push(new DbEnum(dbEnum.dbName, dbEnum.host));
            }
          }
        });
  }

  onChangeDbConfig(event: any): void {
    // this.confirmBtnDisable = true;
    console.log('change');
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
  private _dbName = '';
  private _dbType = 'MySql';
  private _userName = '';
  private _password: string;
  private _port = '3306';
  private _encoding = 'UTF-8';
  private _extraParams = '';
  private _shardingType = 'single';
  private _host = '';
  private _shardingEnum = '';
  // 是否是Cobar配置
  private _facade = false;

  constructor(public _dbId?: number) {

  }

  get facade(): boolean {
    return this._facade;
  }

  set facade(value: boolean) {
    this._facade = value;
  }

  get dbId(): number {
    return this._dbId;
  }

  set dbId(value: number) {
    this._dbId = value;
  }

  get dbName(): string {
    return this._dbName;
  }

  set dbName(value: string) {
    this._dbName = value;
  }

  get dbType(): string {
    return this._dbType;
  }

  set dbType(value: string) {
    this._dbType = value;
  }

  get userName(): string {
    return this._userName;
  }

  set userName(value: string) {
    this._userName = value;
  }

  get password(): string {
    return this._password;
  }

  set password(value: string) {
    this._password = value;
  }

  get port(): string {
    return this._port;
  }

  set port(value: string) {
    this._port = value;
  }

  get encoding(): string {
    return this._encoding;
  }

  set encoding(value: string) {
    this._encoding = value;
  }

  get extraParams(): string {
    return this._extraParams;
  }

  set extraParams(value: string) {
    this._extraParams = value;
  }

  get shardingType(): string {
    return this._shardingType;
  }

  set shardingType(value: string) {
    this._shardingType = value;
  }

  get host(): string {
    return this._host;
  }

  set host(value: string) {
    this._host = value;
  }

  get shardingEnum(): string {
    return this._shardingEnum;
  }

  set shardingEnum(value: string) {
    this._shardingEnum = value;
  }


}
