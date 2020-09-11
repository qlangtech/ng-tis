import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {TISService} from "../service/tis.service";
import {BasicFormComponent} from "../common/basic.form.component";
import {AppDesc, ConfirmDTO} from "./addapp-pojo";
import {NzModalService} from "ng-zorro-antd";
import {Item} from "../common/tis.plugin";

// 文档：https://angular.io/docs/ts/latest/guide/forms.html
@Component({
  selector: 'addapp-form',
  // templateUrl: '/runtime/addapp.htm'
  template: `
      <tis-steps type="createIndex" [step]="0"></tis-steps>
      <tis-form [fieldsErr]="errorItem">
          <tis-page-header [showBreadcrumb]="false" [result]="result">
              <tis-header-tool>
                  <button nz-button nzType="primary" (click)="createIndexStep1Next()">下一步</button>
              </tis-header-tool>
          </tis-page-header>
          <tis-ipt #indexName title="索引名称" name="projectName" require="true">
              <nz-input-group nzAddOnBefore="search4">
                  <input required type="text" [id]="indexName.name" nz-input [(ngModel)]="model.name" name="name"/>
              </nz-input-group>
          </tis-ipt>

          <tis-ipt #workflow title="数据流" name="workflow" require="true">
              <nz-select name="workflow" [(ngModel)]="model.workflow">
                  <nz-option nzLabel="请选择" ></nz-option>
                  <nz-option *ngFor="let p of usableWorkflow" [nzValue]="p.id+':'+p.name" [nzLabel]="p.name" ></nz-option>
              </nz-select>
          </tis-ipt>

          <tis-ipt #dptId title="所属部门" name="dptId" require="true">
              <nz-select name="dptId" class="form-control" [(ngModel)]="model.dptId">
                  <nz-option [nzValue]="'-1'" nzLabel="请选择"></nz-option>
                  <nz-option *ngFor="let pp of model.dpts" [nzValue]="pp.value"  [nzLabel]="pp.name" ></nz-option>
              </nz-select>
          </tis-ipt>

          <tis-ipt #recept title="接口人" name="recept" require="true">
              <input  nz-input [id]="recept.name" [(ngModel)]="model.recept" name="recept"
                     placeholder="小明">
          </tis-ipt>
      </tis-form>
      <!-- Content here -->
  `
  , styles: [
      `
    `
  ]
})
export class AddAppFormComponent extends BasicFormComponent implements OnInit {
  errorItem: Item = Item.create([]);
  // model = new Application(
  //   '', 'Lucene6.0', -1, new Crontab(), -1, ''
  // );
  model = new AppDesc();
  tplenum: any[];
  usableWorkflow: any[];
  @Output() nextStep = new EventEmitter<any>();
  @Input() dto: ConfirmDTO;

  constructor(tisService: TISService, modalService: NzModalService) {
    super(tisService, modalService);
  }


  ngOnInit(): void {

    this.httpPost('/runtime/changedomain.ajax'
      , 'action=add_app_action&emethod=get_create_app_master_data')
      .then((r) => {
        if (r.success) {
          this.model.dpts = r.bizresult.bizlinelist;
          this.tplenum = r.bizresult.tplenum;
          this.usableWorkflow = r.bizresult.usableWorkflow;
        }
      });
    if (this.dto) {
      this.model = this.dto.appform;
    }
  }

  // 执行下一步
  public createIndexStep1Next(): void {
    let dto = new ConfirmDTO();
    dto.appform = this.model;
    // dto.appform.name = form.name.value;
    // dto.appform.tisTpl = form.tisTpl.value;
    // dto.appform.workflow = form.workflow.value;
    // dto.appform.dptId = form.dptId.value;
    // dto.appform.recept = form.recept.value;
    this.jsonPost('/runtime/addapp.ajax?action=add_app_action&emethod=validate_app_form'
      , dto.appform)
      .then((r) => {
        this.processResult(r);
        if (r.success) {
          // console.log(dto);
          this.nextStep.emit(dto);
        } else {
          this.errorItem = Item.processFieldsErr(r);
        }
      });
  }
}
