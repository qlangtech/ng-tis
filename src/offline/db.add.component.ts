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


@Component({
  template: `
      <fieldset [disabled]='formDisabled'>
          <div class="modal-header">
              <h4 class="modal-title">{{title}}</h4>
              <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss('Cross click')">
                  <span aria-hidden="true">&times;</span>
              </button>
          </div>
          <div class="modal-body">
              <div class="container">
                  <tis-page-header [showBreadcrumb]="false" [result]="result">
                      <button nz-button nzType="primary" (click)="saveDbConfig(form)">提交</button>
                  </tis-page-header>
                  <form #form>
                      <input type="hidden" name="facade" [value]="dbPojo.facade"/>
                      <input type="hidden" name="id" [value]="dbPojo.dbId"/>
                      <div class="form-group row">
                          <label for="input-db-name" class="col-2 col-form-label">数据库名</label>
                          <div class="col-10">
                              <input id="input-db-name" class="form-control" type="text"
                                     name="dbName" required (change)="onChangeDbConfig()"
                                     [value]="dbPojo.dbName" [readonly]="dbNameReadOnly">
                          </div>
                      </div>
                      <div *ngIf="!dbPojo.facade" class="form-group row">
                          <label for="input-db-type" class="col-2 col-form-label">数据库类型</label>
                          <div class="col-10">
                              <select id="input-db-type" class="form-control" name="dbType" (change)="onChangeDbConfig()"
                                      [value]="dbPojo.dbType">
                                  <option value="mysql">MySql</option>
                              </select>
                          </div>
                      </div>
                      <div class="form-group row">
                          <label for="input-username" class="col-2 col-form-label">用户名</label>
                          <div class="col-10">
                              <input id="input-username" class="form-control" type="text" name="userName"
                                     (change)="onChangeDbConfig()"
                                     value="{{dbPojo.userName}}">
                          </div>
                      </div>
                      <div class="form-group row">
                          <label for="input-password" class="col-2 col-form-label">密码</label>
                          <div class="col-10">
                              <input id="input-password" class="form-control" type="password" name="password" placeholder="没有变化不需要输入"
                                     (change)="onChangeDbConfig()">
                          </div>
                      </div>
                      <div class="form-group row">
                          <label for="input-port" class="col-2 col-form-label">端口</label>
                          <div class="col-10">
                              <input id="input-port" class="form-control" type="number"
                                     name="port" (change)="onChangeDbConfig()"
                                     value="{{dbPojo.port}}">
                          </div>
                      </div>
                      <div class="form-group row">
                          <label for="input-encode" class="col-2 col-form-label">编码</label>
                          <div class="col-10">
                              <select id="input-encode" class="form-control" name="encoding" [value]="dbPojo.encoding">
                                  <option value="UTF-8">UTF-8</option>
                                  <option value="GBK">GBK</option>
                              </select>
                          </div>
                      </div>
                      <div class="form-group row">
                          <label for="input-ext-params" class="col-2 col-form-label">附加参数</label>
                          <div class="col-10">
                              <input id="input-ext-params" class="form-control"
                                     type="text" placeholder="useUnicode=true" name="extraParams"
                                     [value]="dbPojo.extraParams">
                          </div>
                      </div>
                      <div class="form-group row">
                          <label for="input-host-desc" class="col-2 col-form-label">节点描述</label>
                          <div class="col-10">
                <textarea id="input-host-desc" class="form-control" rows="6" name="host" [value]="dbPojo.host"
                          placeholder="127.0.0.1[00-31],127.0.0.2[32-63],127.0.0.3,127.0.0.4[9],baisui.com[0-9]"></textarea>
                          </div>
                      </div>
                  </form>
              </div>
          </div>
      </fieldset>
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
  // 是否是Cobar的配置
  // facade = false;
  // private _title: string;
  confirmBtn: string;

  get dbNameReadOnly(): boolean {
    return !this.dbPojo.facade && this.dbPojo.dbId != null;
  }

  constructor(tisService: TISService,
              private location: Location, modalService: NgbModal
    , public activeModal: NgbActiveModal) {
    super(tisService, modalService);
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

  onChangeDbConfig(): void {
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
  private _dbName: string = '';
  private _dbType: string = 'MySql';
  private _userName: string = '';
  private _password: string;
  private _port: string = '3306';
  private _encoding: string = 'UTF-8';
  private _extraParams: string = '';
  private _shardingType: string = 'single';
  private _host: string = '';
  private _shardingEnum: string = '';
  // 是否是Cobar配置
  private _facade: boolean = false;

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
