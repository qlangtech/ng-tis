import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {TISService} from "../service/tis.service";
import {BasicFormComponent} from "../common/basic.form.component";
import {AppDesc, ConfirmDTO} from "./addapp-pojo";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

// 文档：https://angular.io/docs/ts/latest/guide/forms.html
@Component({
  selector: 'addapp-form',
  // templateUrl: '/runtime/addapp.htm'
  template: `
      <tis-steps type="createIndex" [step]="0"></tis-steps>
    <tis-page-header [showBreadcrumb]="false" [result]="result">
      <tis-header-tool>
        <button nz-button nzType="primary" (click)="createIndexStep1Next()">下一步</button>
      </tis-header-tool>
    </tis-page-header>
    <form #form method="post">
      <fieldset [disabled]='formDisabled'>

        <div class="form-group row">
          <label for="name-input" class="col-2 col-form-label">索引名称</label>
          <div class="col-10">
            <nz-input-group nzAddOnBefore="search4">
              <input required type="text" id="name-input" nz-input [(ngModel)]="model.name" name="name"/>
            </nz-input-group>
          </div>
        </div>
       <!--
        <div class="form-group row">
          <label for="inputtpl" class="col-2 col-form-label">配置模板</label>
          <div class="col-10">
            <select id="inputtpl" name="tisTpl" [(ngModel)]="model.tisTpl" class="form-control">
              <option value="">请选择</option>
              <option *ngFor="let p of tplenum" value="{{p.value}}">{{p.name}}</option>
            </select>
          </div>
        </div>
        -->
        <div class="form-group row">
          <label for="input_workflow" class="col-2 col-form-label">数据流</label>
          <div class="col-10">
            <select name="workflow" class="form-control" [(ngModel)]="model.workflow">
              <option value="">请选择</option>
              <option *ngFor="let p of usableWorkflow" value="{{p.id+':'+p.name}}">{{p.name}}</option>
            </select>
          </div>
        </div>
        <div class="form-group row">
          <label for="inputDepartment" class="col-2 col-form-label">所属部门</label>
          <div class="col-10">
            <select name="dptId" class="form-control" [(ngModel)]="model.dptId">
              <option value="-1">请选择</option>
              <option *ngFor="let pp of model.dpts" value="{{pp.value}}">{{pp.name}}</option>
            </select>
          </div>
        </div>
        <div class="form-group row">
          <label for="inputRecept" class="col-2 col-form-label">接口人</label>
          <div class="col-10">
            <input type="text" class="form-control" id="inputRecept" [(ngModel)]="model.recept" name="recept"
                   placeholder="小明">
          </div>
        </div>
      </fieldset>
    </form>
    <!-- Content here -->
  `
  , styles: [
      `
    `
  ]
})
export class AddAppFormComponent extends BasicFormComponent implements OnInit {

  // model = new Application(
  //   '', 'Lucene6.0', -1, new Crontab(), -1, ''
  // );
  model = new AppDesc();
  tplenum: any[];
  usableWorkflow: any[];
  @Output() nextStep = new EventEmitter<any>();
  @Input() dto: ConfirmDTO;

  constructor(tisService: TISService, modalService: NgbModal) {
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
        if (r.success) {
          // console.log(dto);
          this.nextStep.emit(dto);
        } else {
          this.processResult(r);
        }
      });
  }
}
