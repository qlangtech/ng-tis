/**
 * Created by Qinjiu on 5/3/2017.
 */

import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TISService} from '../service/tis.service';
import {TableAddStep} from './table.add.step';
import {Router} from '@angular/router';
import {Location} from '@angular/common';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {TablePojo} from './table.add.component';

declare var jQuery: any;


@Component({
  selector: 'tableAddStep2',
  template: `
      <div class="container" [hidden]="!isShow">
          <form #form>
              <fieldset [disabled]='formDisabled'>
                  <input type="hidden" name="event_submit_do_add_datasource_table" value="y"/>
                  <input type="hidden" name="action" value="offline_datasource_action"/>

                  <p style="text-align:right;">
                      <button nz-button nzType="default" (click)="createPreviousStep(form)">上一步</button>
                      <button nz-button nzType="primary" (click)="saveTableConfig(form)">提交
                      </button>
                  </p>
                  <div class="form-group">
                      <label for="selectsql">SELECT SQL</label>
                      <textarea id="selectsql" class="form-control"
                                name="selectSql" rows="15" readonly placeholder="select * from table"
                                required (blur)="selectSqlChange(selectSql1.value)" #selectSql1
                                [(ngModel)]="step1Form.selectSql"></textarea>
                  </div>
              </fieldset>
          </form>
      </div>
  `
})
export class TableAddStep2Component extends TableAddStep implements OnInit {
  columns: ColumnTypes[] = [];
  // confirmDisable: boolean;
  tableName: string;
  @Input() tablePojo: TablePojo;

  @Input() step1Form: TablePojo;
  @Output() processHttpResult: EventEmitter<any> = new EventEmitter();

  constructor(public tisService: TISService, protected router: Router
    , protected location: Location, modalService: NgbModal) {
    super(tisService, router, location, modalService);
  }


  ngOnInit(): void {
    // this.confirmDisable = this.tablePojo.isAdd;
  }

  saveTableConfig(form: any): void {
    let action = jQuery(form).serialize()
      + '&tableLogicName=' + this.step1Form.tableName
      + '&partitionNum=' + this.step1Form.partitionNum
      + '&dbName=' + this.step1Form.dbName
      + '&partitionInterval=' + this.step1Form.partitionInterval
      + '&tableName=' + this.step1Form.tableName;
    // console.log(action);
    // this.confirmDisable = true;
    // if (!this.tablePojo.isAdd) {
    //  action = action.replace('event_submit_do_add_datasource_table', 'event_submit_do_edit_datasource_table');
    //  action = action + '&id=' + this.tablePojo.id;
    // }
    this.jsonPost('/offline/datasource.ajax?event_submit_do_add_datasource_table=y&action=offline_datasource_action', this.step1Form)
      .then(result => {
        // this.confirmDisable = false;
        this.processHttpResult.emit(result);
        // console.log(result);
        if (result.success) {
          this.goHomePage(result.bizresult);
        }
      });
  }

  selectSqlChange(sql: any): void {
    // this.confirmDisable = true;
    console.log(sql);
    let action = 'event_submit_do_analyse_select_sql=y&action=offline_datasource_action'
      + '&sql=' + sql + '&dbName='; // + this.step1Form.dbName.value;
    console.log(action);
    this.httpPost('/offline/datasource.ajax', action)
      .then(
        result => {
          this.columns = [];
          this.processHttpResult.emit(result);
          // console.log(result);
          if (result.success) {
            // this.confirmDisable = false;
            this.columns = [];
            this.tableName = result.bizresult.tableName;
            for (let column of result.bizresult.columns) {
              this.columns.push(new ColumnTypes(column.key, column.dbType, column.hiveType));
            }
          } else {
            // console.log('failed------------');
            // console.log(result);

          }
        });
  }

  focusFunction(sql: any): void {
    // console.log('sql');
  }

  focusOutFunction(sql: any): void {
    // console.log('sql1');
  }

  testTableConnection(form: any): void {
    // console.log(this.step1Form.tableLogicName.value);
    // console.log(jQuery(form).serialize());
  }
}

export class ColumnTypes {
  name: string;
  dbType: string;
  hiveType: string;

  constructor(name: string,
              dbType: string,
              hiveType: string) {
    this.name = name;
    this.dbType = dbType;
    this.hiveType = hiveType;
  }

}
