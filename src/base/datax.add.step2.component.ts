import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {TISService} from "../service/tis.service";
import {BasicFormComponent} from "../common/basic.form.component";
import {AppDesc, ConfirmDTO} from "./addapp-pojo";
import {NzModalService} from "ng-zorro-antd";
import {Descriptor, Item} from "../common/tis.plugin";
import {PluginsComponent} from "../common/plugins.component";
import {DataxDTO} from "./datax.add.component";

// 文档：https://angular.io/docs/ts/latest/guide/forms.html
@Component({
  selector: 'addapp-form',
  // templateUrl: '/runtime/addapp.htm'
  template: `
      <tis-steps type="createDatax" [step]="1"></tis-steps>
      <tis-form [fieldsErr]="errorItem">
          <tis-page-header [showBreadcrumb]="false" [result]="result">
              <tis-header-tool>
                  <button nz-button nzType="primary" (click)="execNextStep()">下一步</button>
              </tis-header-tool>
          </tis-page-header>
          <tis-ipt #readerType title="Reader类型" name="readerType" require="true">
              <nz-select nzSize="large" nzPlaceHolder="请选择" name="dptId" class="form-control" [(ngModel)]="dto.readerDescriptor">
                  <nz-option *ngFor="let pp of readerDesc" [nzValue]="pp" [nzLabel]="pp.displayName"></nz-option>
              </nz-select>
          </tis-ipt>
          <tis-ipt #writerType title="Writer类型" name="writerType" require="true">
              <nz-select nzSize="large" nzPlaceHolder="请选择" name="dptId" class="form-control" [(ngModel)]="dto.writerDescriptor">
                  <nz-option *ngFor="let pp of writerDesc" [nzValue]="pp" [nzLabel]="pp.displayName"></nz-option>
              </nz-select>
          </tis-ipt>
      </tis-form>
      <!-- Content here -->
  `
  , styles: [
    `
    `
  ]
})
export class DataxAddStep2Component extends BasicFormComponent implements OnInit {
  errorItem: Item = Item.create([]);
  // model = new Application(
  //   '', 'Lucene6.0', -1, new Crontab(), -1, ''
  // );
  model = new AppDesc();

  @Output() nextStep = new EventEmitter<any>();
  @Output() preStep = new EventEmitter<any>();
  @Input() dto: DataxDTO;

  // 可选的数据源
  readerDesc: Array<Descriptor> = [];
  writerDesc: Array<Descriptor> = [];


  constructor(tisService: TISService, modalService: NzModalService) {
    super(tisService, modalService);
  }


  ngOnInit(): void {

    this.httpPost('/coredefine/corenodemanage.ajax'
      , 'action=datax_action&emethod=get_supported_reader_writer_types')
      .then((r) => {
        if (r.success) {
          let rList = PluginsComponent.wrapDescriptors(r.bizresult.readerDesc);
          let wList = PluginsComponent.wrapDescriptors(r.bizresult.writerDesc);
          this.readerDesc = Array.from(rList.values());
          this.writerDesc =  Array.from(wList.values());
        }
      });
  }

  // 执行下一步
  public execNextStep(): void {
   // let dto = new DataxDTO();
   // dto.appform = this.readerDesc;
    this.jsonPost('/coredefine/corenodemanage.ajax?action=datax_action&emethod=validate_reader_writer'
      , this.dto)
      .then((r) => {
        this.processResult(r);
        if (r.success) {
          // console.log(dto);
          this.nextStep.emit(this.dto);
        } else {
          this.errorItem = Item.processFieldsErr(r);
        }
      });
  }
}
