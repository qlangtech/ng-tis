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
      <tis-steps type="createDatax" [step]="0"></tis-steps>
      <tis-form [fieldsErr]="errorItem">
          <tis-page-header [showBreadcrumb]="false" [result]="result">
              <tis-header-tool>
                  <button nz-button nzType="primary" (click)="createIndexStep1Next()">下一步</button>
              </tis-header-tool>
          </tis-page-header>
          <tis-ipt #indexName title="实例名称" name="projectName" require="true">
              <nz-input-group nzSize="large">
                  <input required type="text" [id]="indexName.name" nz-input [(ngModel)]="model.name" name="name"/>
              </nz-input-group>
          </tis-ipt>
          <tis-ipt #dptId title="所属部门" name="dptId" require="true">
              <nz-select nzSize="large" style="width: calc(100% - 6em)" nzPlaceHolder="请选择" name="dptId" class="form-control" [(ngModel)]="model.dptId">
                  <nz-option *ngFor="let pp of model.dpts" [nzValue]="pp.value" [nzLabel]="pp.name"></nz-option>
              </nz-select>
              <a class="tis-link-btn" [routerLink]="['/','base','departmentlist']">部门管理</a>
          </tis-ipt>

          <tis-ipt #recept title="接口人" name="recept" require="true">
              <input nzSize="large" nz-input [id]="recept.name" [(ngModel)]="model.recept" name="recept"
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
export class DataxAddStep1Component extends BasicFormComponent implements OnInit {
  errorItem: Item = Item.create([]);
  model = new AppDesc();

  @Output() nextStep = new EventEmitter<any>();
  @Input() dto: ConfirmDTO;


  constructor(tisService: TISService, modalService: NzModalService) {
    super(tisService, modalService);
  }


  ngOnInit(): void {
  }

  // 执行下一步
  public createIndexStep1Next(): void {
    // let dto = new ConfirmDTO();
    // dto.appform = this.model;
    // this.jsonPost('/runtime/addapp.ajax?action=add_app_action&emethod=validate_app_form'
    //   , dto.appform)
    //   .then((r) => {
    //     this.processResult(r);
    //     if (r.success) {
    //       // console.log(dto);
    //       this.nextStep.emit(dto);
    //     } else {
    //       this.errorItem = Item.processFieldsErr(r);
    //     }
    //   });
  }
}
