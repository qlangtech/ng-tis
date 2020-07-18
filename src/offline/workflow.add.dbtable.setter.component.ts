import {
  AfterContentInit,
  AfterViewInit,
  Component,
  OnInit
} from '@angular/core';
import {BasicSideBar, DumpTable} from '../common/basic.form.component';
import {TISService} from '../service/tis.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';


/*
["defaults", "optionHandlers", "defineInitHook", "defineOption", "Init", "helpers",
"registerHelper", "registerGlobalHelper", "inputStyles", "defineMode", "defineMIME",
"defineExtension", "defineDocExtension", "fromTextArea", "off", "on", "wheelEventPixels",
 "Doc", "splitLines", "countColumn", "findColumn", "isWordChar", "Pass", "signal", "Line",
  "changeEnd", "scrollbarModel", "Pos", "cmpPos", "modes", "mimeModes", "resolveMode",
  "getMode", "modeExtensions", "extendMode", "copyState", "startState", "innerMode",
  "commands", "keyMap", "keyName", "isModifierKey", "lookupKey", "normalizeKeyMap",
   "StringStream", "SharedTextMarker", "TextMarker", "LineWidget", "e_preventDefault",
    "e_stopPropagation", "e_stop", "addClass", "contains", "rmClass", "keyNames", "version"]
*/
// import {EditorConfiguration, fromTextArea} from 'codemirror';
import {WorkflowAddComponent} from "./workflow.add.component";
import {CascaderOption, NzModalService} from "ng-zorro-antd";


//
@Component({
  template: `
      <nz-spin [nzSpinning]="formDisabled" nzSize="large">

          <sidebar-toolbar (close)="_closeSidebar()" (save)="_saveClick()" (delete)="deleteNode()"></sidebar-toolbar>

          <form class="clear" nz-form [nzLayout]="'vertical'">
              <div class="item-head"><label>数据库表</label></div>
              <p>
                  <nz-cascader name="dbTable" class="clear" [nzOptions]="cascaderOptions" [(ngModel)]="cascadervalues"
                               (ngModelChange)="onCascaderChanges($event)"></nz-cascader>
              </p>

              <label>SQL</label>
              <div>
                  <tis-codemirror name="sqltext" [(ngModel)]="sql"
                                  [size]="{width:'100%',height:600}" [config]="sqleditorOption"></tis-codemirror>
              </div>
          </form>

      </nz-spin>
  `,

  styles: [
      `.clear {
          clear: both;
      }`]
})
export class WorkflowAddDbtableSetterComponent
  extends BasicSideBar implements OnInit, AfterContentInit, AfterViewInit {

  cascaderOptions: CascaderOption[] = [];
  cascadervalues: any = {};
  private dto: DumpTable;
  sql = 'select * from usertable;';

  constructor(tisService: TISService, // public activeModal: NgbActiveModal,
              modalService: NzModalService) {
    super(tisService, modalService);
  }

  ngOnInit(): void {

    let action = 'event_submit_do_get_datasource_info=y&action=offline_datasource_action';
    this.httpPost('/offline/datasource.ajax', action)
      .then(result => {
        if (result.success) {
          this.cascaderOptions = [];
          const dbs = result.bizresult;
          for (let db of dbs) {
            let children = [];
            if (db.tables) {
              for (let table of db.tables) {
                let c: CascaderOption = {
                  'value': `${table.id}%${table.tableLogicName}`,
                  'label': table.tableLogicName,
                  'isLeaf': true
                };
                children.push(c);
              }
            }
            let dbNode: CascaderOption = {'value': `${db.id}`, 'label': db.name, 'children': children};
            this.cascaderOptions.push(dbNode);
          }
          // console.log(this.cascaderOptions);
        }
      });

  }


  initComponent(addComponent: WorkflowAddComponent, dumpTab: DumpTable): void {

    if (dumpTab.tabid) {
      this.cascadervalues = [dumpTab.dbid, dumpTab.cascaderTabId];
      this.sql = dumpTab.sqlcontent;
    }
    //  console.log(this.cascadervalues);
    this.dto = dumpTab;
  }


  ngAfterViewInit(): void {
    // let sqlmirror = fromTextArea(this.sqleditor.nativeElement, this.sqleditorOption);
    //
    // sqlmirror.setValue("select * from mytable;");
  }

  ngAfterContentInit(): void {
  }

   get sqleditorOption(): any {
    return {
      'readOnly': true,
    };
  }

  onChanges(event: any) {

  }

  onCascaderChanges(evt: any[]) {

    let tabidtuple = evt[1].split('%');
    let action = `emethod=get_datasource_table_by_id&action=offline_datasource_action&id=${tabidtuple[0]}`;
    this.httpPost('/offline/datasource.ajax', action)
      .then((result) => {
        let r = result.bizresult;
        this.sql = r.selectSql;
      });

  }

  // 点击保存按钮
  _saveClick() {

    let tab: string = this.cascadervalues[1];
    let tabinfo: string[] = tab.split('%');

    console.log(this.dto);

    this.saveClick.emit(new DumpTable(this.nodeMeta, this.dto.nodeid
      , this.sql, this.cascadervalues[0], tabinfo[0], tabinfo[1]));
  }

  public subscribeSaveClick(graph: any, $: any, nodeid: string
    , addComponent: WorkflowAddComponent, d: DumpTable): void {
    let old = graph.findById(nodeid);
    let nmodel = {'label': d.tabname, 'nodeMeta': d};

    // console.log(nodeid);
    // 更新label值
    graph.updateItem(old, nmodel);
    // console.log(old);
    // 将节点注册到map中存储起来
    // console.log(model.id);
    addComponent.dumpTabs.set(nodeid, d);
    addComponent._opened = false;
  }

  // 删除节点
  deleteNode() {

    let id = this.dto.nodeid;
    let node = this.g6Graph.findById(id);
    this.g6Graph.removeItem(node);
    this.parentComponent.dumpTabs.delete(id);
    this._closeSidebar();
  }
}







