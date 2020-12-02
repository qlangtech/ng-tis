/**
 * Created by baisui on 2017/4/26 0026.
 */
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {BasicFormComponent} from '../common/basic.form.component';
import {TisResponseResult, TISService} from '../service/tis.service';
import {Router} from '@angular/router';
import {Location} from '@angular/common';

//  @ts-ignore
import * as $ from 'jquery';
import {NzModalRef, NzModalService} from "ng-zorro-antd";
import {Descriptor, HeteroList, IFieldError, Item, PluginSaveResponse} from "../common/tis.plugin";
import {PluginsComponent} from "../common/plugins.component";


@Component({
  template: `
    {{hlist|json}}
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

  get dbNameReadOnly(): boolean {
    return !this.dbPojo.facade && this.dbPojo.dbId != null;
  }

  // /**
  //  * 当前选中的DS plugin 描述信息
  //  * @param desc
  //  */
  // set dsPluginDesc(desc: Descriptor) {
  //   let h = new HeteroList();
  //   h.extensionPoint = desc.extendPoint;
  //   h.descriptors.set(desc.impl, desc);
  //   PluginsComponent.addNewItem(h, desc, false);
  //   this.hlist = [h];
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

    // console.log(this.hlist);

    // console.log(this.dbPojo);
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
          this.successSubmit.emit(this.dbPojo);
          this.activeModal.close(this.dbPojo);
        } else {
          // 多个插件组
          this.errorItem = Item.processFieldsErr(result);
        }
      });
  }

  onResponse(resp: PluginSaveResponse) {
    if (resp.saveSuccess) {
    //  this.activeModal.close(this.dbPojo);
    }
  }


  private get actionMethod(): string {
    return ((this.isAdd) ? 'add' : 'edit') + '_' + (this.dbPojo.facade ? 'facade' : 'datasource') + '_db';
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
  // dbType: string;
  // userName = '';
  // password: string;
  // port = '3306';
  // encoding = 'UTF-8';
  // extraParams = '';
  // shardingType = 'single';
  // host = '';
  shardingEnum = '';
  // 是否是Cobar配置
  facade = false;

  constructor(public dbId?: string) {

  }
}
