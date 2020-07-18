import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TISService} from '../service/tis.service';
import {TableAddStep} from './table.add.step';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {TabColReflect, TablePojo} from './table.add.component';
import {FormComponent} from "../common/form.component";
import {NzModalService} from "ng-zorro-antd";

declare var jQuery: any;


@Component({
  selector: 'tableAddStep1',
  template: `
      <tis-form [hidden]="!isShow" #form>
          <tis-page-header [showBreadcrumb]="false">
              <tis-header-tool>
                  <input type="hidden" name="event_submit_do_check_table_logic_name_repeat" value="y"/>
                  <input type="hidden" name="action" value="offline_datasource_action"/>
                  <button nz-button nzType="primary" (click)="createNextStep(form)">下一步</button>
              </tis-header-tool>
          </tis-page-header>

          <tis-ipt title="数据库" name="dbname">
              <ng-template let-i='i'>
                  <select *ngIf="!updateMode"  [tis-ipt-prop]="i"
                          (change)="dbChange($event)" [(ngModel)]="tablePojo.dbId">
                      <option *ngFor="let db of dbs" [value]="db.value">{{db.name}}</option>
                  </select>
                  <input *ngIf="updateMode" [tis-ipt-prop]="i" readonly [value]="tablePojo.dbName"/>
              </ng-template>
          </tis-ipt>

          <tis-ipt *ngIf='tbs.length>0 && !updateMode' title="表名" name="table">
              <ng-template let-i='i'>
                  <select [tis-ipt-prop]="i"
                          (change)="tabChange()" [(ngModel)]="tablePojo.tableName">
                      <option *ngFor="let t of tbs" [value]="t.value">{{t.name}}</option>
                  </select>
              </ng-template>
          </tis-ipt>

          <tis-ipt *ngIf='updateMode' title="表名" name="table">
              <ng-template let-i='i'>
                  <input [tis-ipt-prop]="i" readonly [value]="tablePojo.tableName"/>
              </ng-template>
          </tis-ipt>

          <!--
          <tis-ipt *ngIf='tbs.length>0 && !updateMode' title="表逻辑名" name="logicname">
              <ng-template let-i='i'>
                  <input [tis-ipt-prop]="i" type="text" [(ngModel)]="tablePojo.tableLogicName"/>
              </ng-template>
          </tis-ipt>
          <tis-ipt *ngIf='updateMode' title="表逻辑名" name="logicname">
              <ng-template let-i='i'>
                  <input [tis-ipt-prop]="i" type="text" readonly [value]="tablePojo.tableLogicName"/>
              </ng-template>
          </tis-ipt>
 -->
          <tis-ipt title="分区数(个)" name="partitionNum">
              <ng-template let-i='i'>
                  <select [tis-ipt-prop]="i"
                          [(ngModel)]="tablePojo.partitionNum">
                      <option>1</option>
                      <option>2</option>
                      <option>3</option>
                      <option>4</option>
                  </select>
              </ng-template>
          </tis-ipt>

          <tis-ipt title="分区间隔(小时)" name="partitionInterval">
              <ng-template let-i='i'>
                  <select [tis-ipt-prop]="i"
                          [(ngModel)]="tablePojo.partitionInterval">
                      <option>4</option>
                      <option>8</option>
                      <option>12</option>
                      <option>24</option>
                  </select>
              </ng-template>
          </tis-ipt>
      </tis-form>

  `
})
export class TableAddStep1Component extends TableAddStep implements OnInit {
  switchType = 'single';
  dbs: { name: string, value: string }[] = [];
  tbs: { name: string, value: string }[] = [];
  @Input() tablePojo: TablePojo;

  @Output() processHttpResult: EventEmitter<any> = new EventEmitter();

  constructor(tisService: TISService, protected router: Router,
              private activateRoute: ActivatedRoute, protected location: Location, modalService: NzModalService) {
    super(tisService, router, location, modalService);
  }


  get updateMode(): boolean {
    return !this.tablePojo.isAdd;
  }

  // DB名称选择
  public dbChange(e: any) {
    // console.info(this.tablePojo.dbName);
    this.tbs = [];
    this.tablePojo.tableName = null;
    this.tabChange();
    this.httpPost('/offline/datasource.ajax'
      , 'event_submit_do_select_db_change=y&action=offline_datasource_action&dbid='
      + this.tablePojo.dbId
    ).then(result => {
      if (result.success) {
        this.tbs = result.bizresult;
      }
    });
  }

  public tabChange(): void {
   // this.tablePojo.tableLogicName = this.tablePojo.tableName;
  }


  ngOnInit(): void {
    this.httpPost('/offline/datasource.ajax',
      'event_submit_do_get_usable_db_names=y&action=offline_datasource_action')
      .then(
        result => {
          this.processHttpResult.emit(result);
          if (result.success) {
            this.dbs = result.bizresult;
            // console.log(this.dbs);
            // let queryParams = this.activateRoute.snapshot.queryParams;
            // if (queryParams['dbName']) {
            //   this.tablePojo.dbName = queryParams['dbName'];
            //   console.log(this.tablePojo.dbName);
            // } else {
            //   if (this.dbs.length > 0) {
            //     this.tablePojo.dbName = this.dbs[0];
            //   }
            // }
          }
        });
  }

  changeType(value: string): void {
    console.log(value);
    this.switchType = value;
  }


  showSpy(spy1: any): void {
    console.log(spy1);
  }

  public createNextStep(form: any): void {
    // console.log(this.tablePojo);
    // 校验库名和表名是否存在
    this.jsonPost('/offline/datasource.ajax?event_submit_do_check_table_logic_name_repeat=y&action=offline_datasource_action', this.tablePojo)
      .then(
        result => {
          if (result.success) {
            let biz = result.bizresult;
            this.tablePojo.selectSql = biz.sql;
            this.tablePojo.cols = [];
            if (biz.cols) {
              biz.cols.forEach((col: any) => {
                let c = Object.assign(new TabColReflect(), col);
                this.tablePojo.cols.push(c);
              });
            }
            this.nextStep.emit(this.tablePojo);
          } else {
            this.processResult(result);
            this.processHttpResult.emit(result);
          }
        }
      );
    // } else {
    //   this.nextStep.emit(form);
    // }

  }
}
