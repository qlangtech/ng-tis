import {AfterContentInit, AfterViewInit, Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild} from "@angular/core";
import {TISService} from "../service/tis.service";
import {BasicFormComponent} from "../common/basic.form.component";
import {AppDesc, ConfirmDTO} from "./addapp-pojo";
import {NzDrawerRef, NzDrawerService, NzModalService, NzTreeNodeOptions, TransferItem} from "ng-zorro-antd";
import {Descriptor, HeteroList, Item, PluginSaveResponse} from "../common/tis.plugin";
import {PluginsComponent} from "../common/plugins.component";
import {DataxDTO, ISelectedCol, ISelectedTabMeta} from "./datax.add.component";
import {DatasourceComponent} from "../offline/ds.component";

// 设置所选table的表以及 表的列
// 文档：https://angular.io/docs/ts/latest/guide/forms.html
@Component({
  // templateUrl: '/runtime/addapp.htm'
  template: `
      <tis-steps type="createDatax" [step]="1"></tis-steps>
      <tis-form [formLayout]="'vertical'" [fieldsErr]="errorItem">
          <tis-page-header [showBreadcrumb]="false" [result]="result">
              <tis-header-tool>
                  <button nz-button nzType="primary" (click)="createStepNext()">下一步</button>
              </tis-header-tool>
          </tis-page-header>
          <tis-ipt #indexName title="选择表" name="projectName" require="true">
              <nz-transfer
                      [nzDataSource]="transferList"
                      [nzDisabled]="false"
                      [nzShowSearch]="true"
                      [nzShowSelectAll]="true"
                      [nzRenderList]="[renderList, renderList]"
              >
                  <ng-template
                          #renderList
                          let-items
                          let-direction="direction"
                          let-stat="stat"
                          let-disabled="disabled"
                          let-onItemSelectAll="onItemSelectAll"
                          let-onItemSelect="onItemSelect"
                  >
                      <nz-table #t [nzData]="convertItems(items)" nzSize="small">
                          <thead>
                          <tr>
                              <th
                                      nzShowCheckbox
                                      [nzDisabled]="disabled"
                                      [nzChecked]="stat.checkAll"
                                      [nzIndeterminate]="stat.checkHalf"
                                      (nzCheckedChange)="onItemSelectAll($event)"
                              ></th>
                              <th>表名</th>
                              <th *ngIf="direction === 'right'">操作</th>
                          </tr>
                          </thead>
                          <tbody>
                          <tr *ngFor="let data of t.data" (click)="onItemSelect(data)">
                              <td
                                      nzShowCheckbox
                                      [nzChecked]="data.checked"
                                      [nzDisabled]="disabled || data.disabled"
                                      (nzCheckedChange)="onItemSelect(data)"
                              ></td>
                              <td>{{ data.title }}</td>
                              <td *ngIf="direction === 'right'">
                                  <nz-tag [nzColor]="'blue'">{{ data.tag }}</nz-tag>
                                  <button nz-button (click)="tableColsSelect($event,data)" [nzSize]="'small'">列选择</button>
                              </td>
                          </tr>
                          </tbody>
                      </nz-table>
                  </ng-template>
              </nz-transfer>
          </tis-ipt>
      </tis-form>
      <ng-template #drawerTemplate let-data let-drawerRef="drawerRef">
          <sidebar-toolbar [deleteDisabled]="true" (close)="drawerRef.close()" (save)="_saveClick(data, drawerRef)"></sidebar-toolbar>
          value: {{ data?.selectableCols | json  }}
          <tis-form formLayout="vertical" [fieldsErr]="errorItem">
              <tis-page-header [showBreadcrumb]="false" [result]="result">
              </tis-page-header>
              <tis-ipt title="同步列" name="selectableCols" require="true">
                  <nz-checkbox-group *ngIf="data" [(ngModel)]="data.selectableCols"></nz-checkbox-group>
              </tis-ipt>
          </tis-form>
      </ng-template>
  `
  , styles: [
      `
    `
  ]
})
export class DataxAddStep4Component extends BasicFormComponent implements OnInit, AfterViewInit {
  errorItem: Item = Item.create([]);
  // model = new Application(
  //   '', 'Lucene6.0', -1, new Crontab(), -1, ''
  // );
  model = new AppDesc();
  @Output() nextStep = new EventEmitter<any>();
  @Output() preStep = new EventEmitter<any>();
  @Input() dto: DataxDTO;


  @ViewChild('drawerTemplate', {static: false}) drawerTemplate?: TemplateRef<{
    $implicit: { value: string };
    drawerRef: NzDrawerRef<string>;
  }>;

  transferList: TransferItem[] = [];

  savePlugin = new EventEmitter<any>();

  // 可选的数据源
  readerDesc: Array<Descriptor> = [];
  writerDesc: Array<Descriptor> = [];

  hlist: HeteroList[] = [];


  // drawerVisible: boolean;

  constructor(tisService: TISService, modalService: NzModalService, private drawerService: NzDrawerService) {
    super(tisService, modalService);
  }

  drawerClose() {
    //  this.drawerVisible = false;
  }

  ngOnInit(): void {
    this.hlist = DatasourceComponent.pluginDesc(this.dto.readerDescriptor);
    if (this.dto.selectableTabs) {
      console.log(this.dto);
      // let mtaIt: IterableIterator<ISelectedTabMeta> = this.dto.selectableTabs.values();
      // let mtaIt: IterableIterator<[string, ISelectedTabMeta]> = this.dto.selectableTabs.entries();
      this.dto.selectableTabs.forEach((m) => {
        this.transferList.push({
          key: m.tableName,
          title: m.tableName,
          direction: 'right',
          //   direction: (this.dto.coreNode.hosts.findIndex((host) => host.hostName === node.hostName) > -1 ? 'right' : 'left'),
          disabled: false,
          'tableMeta': m.selectableCols
        });
      });
      // for (let tabName in this.dto.selectableTabs) {
      //   console.log(tabName);
      // }
    }
  }

  ngAfterViewInit(): void {

  }


  convertItems(items: TransferItem[]): TransferItem[] {
    return items.filter(i => !i.hide);
    // return items;
  }

  // 执行下一步
  public createStepNext(): void {

    this.savePlugin.emit();

    // let dto = new DataxDTO();
    // dto.appform = this.readerDesc;
    // this.jsonPost('/coredefine/corenodemanage.ajax?action=datax_action&emethod=validate_reader_writer'
    //   , this.dto)
    //   .then((r) => {
    //     this.processResult(r);
    //     if (r.success) {
    //       // console.log(dto);
    //       this.nextStep.emit(this.dto);
    //     } else {
    //       this.errorItem = Item.processFieldsErr(r);
    //     }
    //   });
  }

  afterSaveReader(response: PluginSaveResponse) {
    if (!response.saveSuccess) {
      return;
    }
    this.nextStep.emit(this.dto);
  }

  /**
   * 打开表列选择表单
   * @param event
   * @param data
   */
  tableColsSelect(event: MouseEvent, data: any) {
 console.log(data);
    this.httpPost('/coredefine/corenodemanage.ajax'
      , 'action=datax_action&emethod=get_reader_table_selectable_cols&dataxName=' + this.dto.dataxPipeName + "&tableName=" + data.key)
      .then((r) => {
        this.processResult(r);
        if (!r.success) {
          return;
        }

        let checkOptionsOne: Array<ISelectedCol> = [
          // { label: 'Apple', value: 'Apple', checked: true },
        ];

        // {
        //   "index":0,
        //   "key":"customerregister_id",
        //   "pk":true,
        //   "type":12
        // }

        let tabs: Array<{ index: number, key: string, pk: boolean, type: number }> = r.bizresult;
        tabs.forEach((tab) => {
          checkOptionsOne.push({label: tab.key, value: tab.key, pk: tab.pk, checked: true});
        });
        let tabMeta: ISelectedTabMeta = this.dto.selectableTabs[data.key];
        if (!tabMeta) {
          throw new Error(`table:${data.key} relevant tabMeta can not be null`);
        }
        tabMeta.tableName = data.key;
        tabMeta.selectableCols = checkOptionsOne;
        // let transferData: ISelectedTabMeta = {
        //   tableName: data.key,
        //   selectableCols: checkOptionsOne // r.bizresult
        // };
        const drawerRef = this.drawerService.create({
          nzTitle: `DataX Reader ${data.key}`,
          nzWidth: '30%',
          nzContent: this.drawerTemplate,
          nzContentParams: tabMeta
        });

        drawerRef.afterOpen.subscribe(() => {
          console.log('Drawer(Template) open');
        });

        drawerRef.afterClose.subscribe(() => {
          console.log('Drawer(Template) close');
        });
      });
    event.stopPropagation();
  }


  updateSingleChecked() {
  }

  _saveClick(selectTab: ISelectedTabMeta, drawerRef) {

    drawerRef.close();
  }
}


