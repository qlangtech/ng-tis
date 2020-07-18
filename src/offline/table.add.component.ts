import {Component, Input, OnInit} from '@angular/core';
import {TISService} from '../service/tis.service';
import {BasicFormComponent} from '../common/basic.form.component';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ActivatedRoute} from '@angular/router';
// @ts-ignore
import * as $ from 'jquery';
import {NzModalService} from "ng-zorro-antd";

@Component({
  // templateUrl: '/offline/tableaddstep.htm'
  template: `
      <fieldset [disabled]='formDisabled'>
          <div class="modal-header">
              <h4 class="modal-title">{{processMode.title}}</h4>
              <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss('Cross click')">
                  <span aria-hidden="true">&times;</span>
              </button>
          </div>
          <div class="modal-body">
              <tis-msg [result]="result"></tis-msg>
              <div class="container">

                  <tableAddStep1 [isShow]="currentIndex===0" (previousStep)="goToPreviousStep($event)"
                                 (nextStep)="goToNextStep($event)"
                                 (processHttpResult)="processResult($event)"
                                 [tablePojo]="tablePojo"></tableAddStep1>
                  <tableAddStep2 [isShow]="currentIndex===1" (previousStep)="goToPreviousStep($event)"
                                 (nextStep)="goToNextStep($event)" (processHttpResult)="processResult($event)"
                                 [step1Form]="step1Form"
                                 [tablePojo]="tablePojo"></tableAddStep2>
              </div>
          </div>
      </fieldset>
  `
})
export class TableAddComponent extends BasicFormComponent implements OnInit {
  // title: string = 'table add step';
  currentIndex = 0;
  stepsNum = 2;
  step1Form: TablePojo;
  tablePojo: TablePojo;
  // id: number;

  @Input() processMode: { tableid?: number, 'title': string, isNew: boolean } = {'title': '添加数据表', isNew: true};

  constructor(tisService: TISService, modalService: NzModalService
    , private activateRoute: ActivatedRoute
    , public activeModal: NgbActiveModal) {
    super(tisService, modalService);
    this.tablePojo = new TablePojo();
    this.step1Form = new TablePojo();
  }


  get updateMode(): boolean {
    return !this.processMode.isNew;
  }

  ngOnInit(): void {
    // let queryParams = this.activateRoute.snapshot.queryParams;
    // console.log(queryParams);
    let mode = this.processMode;
    this.tablePojo.isAdd = true;
    if (!mode.isNew) {
      // this.id = mode['tableId'];
      this.tablePojo.isAdd = false;
      this.tablePojo.id = mode.tableid;
      // this.title = '修改数据表';

      let action = `action=offline_datasource_action&event_submit_do_get_datasource_table_by_id=y&id=${mode.tableid}`;
      this.tisService.httpPost('/offline/datasource.ajax', action)
        .then(result => {
          if (result.success) {
            let t = result.bizresult;
            // this.tablePojo.tableLogicName = t.gitDatasourceTablePojo.tableLogicName;
            // this.tablePojo.partitionNum = t.gitDatasourceTablePojo.partitionNum;
            // this.tablePojo.dbName = t.gitDatasourceTablePojo.dbName;
            // this.tablePojo.partitionInterval = t.gitDatasourceTablePojo.partitionInterval;
            // this.tablePojo.selectSql = t.gitDatasourceTablePojo.selectSql;
            // this.tablePojo.sqlAnalyseResult = t.sqlAnalyseResult;

            this.tablePojo = $.extend(this.tablePojo, t);
          }
          console.log(result);
          console.log(this.tablePojo);
        });
    }
  }

  goToNextStep(form: TablePojo) {
    this.currentIndex = (this.currentIndex + 1) % this.stepsNum;
    this.step1Form = form;
    // console.log(this.step1Form);
    // console.log('next');
  }

  goToPreviousStep(form: any) {
    this.currentIndex = (this.currentIndex - 1) % this.stepsNum;
    console.log('previous');
  }

  showMessage(form: any) {
    console.log('*********');
    console.log(form);
  }
}

export class TablePojo {
  public cols: TabColReflect[] = [];

  constructor(
    // public tableLogicName?: string,
    public partitionNum?: number,
    public dbName?: string,
    public partitionInterval?: number,
    public selectSql?: string,
    public sqlAnalyseResult?: any,
    public isAdd?: boolean,
    public id?: number,
    public dbId?: number,
    public tableName?: string,
  ) {

  }

}

export class TabColReflect {
  public key: string;
  public pk: boolean;
  public type: number;
}
