import {Component, EventEmitter, forwardRef, Input, OnInit, Output} from "@angular/core";
import {BasicFormComponent} from "./basic.form.component";
import {TISService} from "../service/tis.service";
import {NzCascaderOption, NzSelectSizeType} from "ng-zorro-antd";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";

@Component({
  selector: 'tis-table-select',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TableSelectComponent),
      multi: true
    }
  ],
  template: `
      <nz-cascader [style]="nzStyle" [nzSize]="this.nzSize" name="dbTable" class="clear" [nzOptions]="cascaderOptions" [(ngModel)]="value"
                   (ngModelChange)="onCascaderChanges($event)"></nz-cascader>
  `
})
export class TableSelectComponent extends BasicFormComponent implements OnInit, ControlValueAccessor {
  cascaderOptions: NzCascaderOption[] = [];
  // 应该是这样的结构 [dumpTab.dbid, dumpTab.cascaderTabId];
  cascadervalues: any = {};
  @Input()
  nzSize: NzSelectSizeType = 'default';

  @Input()
  nzStyle: string;
  @Output() onCascaderSQLChanges = new EventEmitter<string>();
  private onChangeCallback: (_: any) => void = function () {
  };

  constructor(tisService: TISService) {
    super(tisService);
  }

  get value() {
    return this.cascadervalues;
  }

  @Input() set value(v) {
    if (v !== this.cascadervalues) {
      this.cascadervalues = v;
      this.onChangeCallback(v);
    }
  }

  registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any): void {
  }

  setDisabledState(isDisabled: boolean): void {
  }

  writeValue(obj: any): void {
    this.cascadervalues = obj;
  }

  onCascaderChanges(evt: any[]) {

    let tabidtuple = evt[1].split('%');
    let action = `emethod=get_datasource_table_by_id&action=offline_datasource_action&id=${tabidtuple[0]}`;
    this.httpPost('/offline/datasource.ajax', action)
      .then((result) => {
        let r = result.bizresult;
        // this.sql = r.selectSql;
        this.onCascaderSQLChanges.emit(r.selectSql);
      });

  }

  ngOnInit(): void {

    let action = 'event_submit_do_get_datasource_info=y&action=offline_datasource_action';
    this.httpPost('/offline/datasource.ajax', action)
      .then(result => {
        if (result.success) {
          this.cascaderOptions = [];
          const dbs = result.bizresult.dbs;
          for (let db of dbs) {
            let children = [];
            if (db.tables) {
              for (let table of db.tables) {
                let c: NzCascaderOption = {
                  'value': `${table.id}%${table.name}`,
                  'label': table.name,
                  'isLeaf': true
                };
                children.push(c);
              }
            }
            let dbNode: NzCascaderOption = {'value': `${db.id}`, 'label': db.name, 'children': children};
            this.cascaderOptions.push(dbNode);
          }
          //       console.log(this.cascaderOptions);
        }
      });
  }
}
