import {AppFormComponent, BasicFormComponent, CurrentCollection} from "./basic.form.component";
import {TISService} from "./tis.service";
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from "@angular/core";
import {getTableMapper, ITableAlias} from "./plugin/type.utils";
import {ActivatedRoute} from "@angular/router";
import {NzModalService} from "ng-zorro-antd/modal";
import {NzNotificationService} from "ng-zorro-antd/notification";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template #previewHeaderTpl>

      <nz-radio-group [ngModel]="_targetTable" (ngModelChange)="targetTabChange($event)" nzButtonStyle="solid"
                      nzSize="small">
        <label nz-radio-button [nzValue]="tab.from" *ngFor="let tab of this.selectableTabs">{{tab.from}}</label>
      </nz-radio-group>

    </ng-template>
    <nz-table [nzLoading]="this.formDisabled" #fixedTable [nzData]="listOfData" [nzTitle]="previewHeaderTpl" [nzBordered]="true" nzTableLayout="fixed"
              [nzSize]="'small'">
      <thead>
      <tr>
        <th nzEllipsis *ngFor="let col of rowHeader">{{col}}</th>
      </tr>
      </thead>
      <tbody>
      <tr *ngFor="let row of fixedTable.data">
        <td nzEllipsis *ngFor="let col of rowHeader let idx = index">{{ row[idx] }}</td>
      </tr>
      </tbody>
    </nz-table>

  `
})
export class PreviewComponent extends AppFormComponent implements OnInit {

  listOfData: Array<Array<any>> = [];
  rowHeader:Array<string> =[];
  _targetTable: string;


  selectableTabs: Array<ITableAlias> = []

  constructor(tisService: TISService, route: ActivatedRoute, modalService: NzModalService
              , notification: NzNotificationService,private cd: ChangeDetectorRef) {
    super(tisService, route, modalService, notification);
  }

  ngOnInit(): void {
    getTableMapper(this, this.tisService.currentApp.appName)
      .then((result) => {
       // console.log(result);
        this.selectableTabs = [...result] ;
        this.cd.detectChanges();
      });
  }

  targetTabChange(targetTable: string) {

    let url = '/coredefine/corenodemanage.ajax';
    this.httpPost(url, 'action=datax_action&emethod=preview_table_rows&table=' + targetTable)
      .then((r) => {
        if (r.success) {
          let biz = r.bizresult;
          this.listOfData = biz.rows;
          this.rowHeader = biz.header;
          this.cd.detectChanges();
        }
      });

  }

  protected initialize(app: CurrentCollection): void {
  }
}
