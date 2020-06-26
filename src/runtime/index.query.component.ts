import {Component, Input, OnInit, ViewContainerRef} from "@angular/core";
import {TisResponseResult, TISService} from "../service/tis.service";
import {EditorConfiguration} from "codemirror";
import {BasicFormComponent} from "../common/basic.form.component";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {HttpParams} from "@angular/common/http";
//  @ts-ignore
import * as $ from 'jquery';
import {PojoComponent} from "./pojo.component";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  template: `

      <div class="tool-bar">
          <button nz-button
                  nz-popover
                  nzType="link"
                  nzPopoverTitle="请选择"
                  nzPopoverTrigger="click"
                  [nzPopoverContent]="serverNodesTpl"
                  nzPopoverPlacement="bottomLeft">引擎节点
          </button>
          <ng-template #serverNodesTpl>
              <table width="500">
                  <tr>
                      <td width="50%">
                      </td>
                      <td align="right">
                          <button nzSize="small" nz-button id="selectall" (click)="selectAllServerNodes()">全选</button> &nbsp;
                          <button nzSize="small" nz-button id="unselectall" (click)="unSelectAllServerNodes()">全不选</button>
                      </td>
                  </tr>
              </table>
              <table width="100%" border="1">
                  <tr *ngFor="let i of querySelectServerCandiate">
                      <td width="40px">第{{i.key}}组</td>
                      <td>
                          <label nz-checkbox name="serverNode" *ngFor="let server of i.value" [(ngModel)]="server.checked"><span [class.leader-node]="server.leader">{{server.ip}}</span></label>
                      </td>
                  </tr>
              </table>
          </ng-template>
          <button nz-button nzType="link" (click)="openPOJOView()">POJO</button>
          <div style="float: right">
              <nz-tag nzMode="closeable" (nzOnClose)="onCloseTag()"><a href="javascript:void(0)" (click)="onCloseTag()">dddd</a></nz-tag>
          </div>
      </div>
      <form method="post" id="queryForm" class="ant-advanced-search-form">
          <fieldset>
              <div>
                  <span>query:</span>
                  <span class="help"><a target="_blank"
                                        href="http://wiki.apache.org/solr/SolrQuerySyntax">Solr查询语法</a></span>
                  <br/>
                  <tis-codemirror name="q" [(ngModel)]="queryForm.q" [size]="{width:800,height:60}" [config]="codeMirrirOpts"></tis-codemirror>
                  <span style="color:#666666;font-size:16px"> example:  *:*,id:478222</span>
              </div>
              <table width="100%">
                  <tr class="form-row">
                      <td width="33%"><span class="title-label">sort:</span>
                          <input type="text" name="sort" value="" size="40" placeholder="example:'create_time desc'"/>
                      </td>
                      <td width="33%">
                          <span class="title-label">start/rows:</span>
                          <input type="text" name="start" [(ngModel)]="queryForm.start" value="0" size="4"/> / <input type="text" name="shownum" [(ngModel)]="queryForm.shownum" size="4"/>
                      </td>
                      <td>
                      </td>
                  </tr>

                  <tr class="form-row">
                      <td width="33%">
                          <span class="title-label">fq:</span>
                          <input type="text" name="fq" placeholder="example:  'id:[1 TO 10]'"/>
                      </td>
                      <td>
                          <div style="position:relative"><span class="title-label">column:</span>
                              <button nz-button nzType="link" nz-popover
                                      nzType="link"
                                      nzPopoverTitle="请选择"
                                      [nzPopoverContent]="colsTpl"
                                      nzPopoverTrigger="click"
                                      nzPopoverPlacement="bottomLeft"><i nz-icon nzType="select" nzTheme="outline"></i>选择
                              </button>
                              <ng-template #colsTpl>
                                  <div style="width:850px">
                                      <p style="text-align: right;">
                                          <button nz-button nzSize="small" id="fieldselectall" (click)="setSelectableCols(true)"><i nz-icon nzType="check" nzTheme="outline"></i>全选</button> &nbsp;
                                          <button nz-button nzSize="small" id="fieldunselectall" (click)="setSelectableCols(false)">全不选</button>
                                      </p>
                                      <ul class="cols-block">
                                          <li *ngFor="let col of cols"><label nz-checkbox name="serverNode" [(ngModel)]="col.checked">{{col.name}}</label></li>
                                      </ul>
                                  </div>
                              </ng-template>
                          </div>
                      </td>
                      <td>
                      </td>
                  </tr>
              </table>
              <p style="margin-top:10px">
                  <nz-input-group nzCompact>
                      <button nz-button nzType="primary" (click)="startQuery()"><i nz-icon nzType="search" nzTheme="outline"></i>Query</button>
                      <button nz-button *ngIf="resultCount>0" (click)="addQueryTag()"><i nz-icon nzType="tags" nzTheme="outline"></i><span>命中:{{resultCount}}</span></button>
                  </nz-input-group>
              </p>
          </fieldset>
      </form>
      <nz-table #datalist [nzData]="queryResultList" [nzShowPagination]="false">
          <tbody>
          <tr *ngFor="let row of datalist.data">
              <td>
                  <nz-tag [nzColor]="'purple'">{{row.server}}</nz-tag>
                  <tis-query-result-row-content [content]="row.rowContent"></tis-query-result-row-content>
              </td>
          </tr>
          </tbody>
      </nz-table>
      <nz-modal
              [(nzVisible)]="addTagDialogVisible"
              nzTitle="设置查询标签"
              nzOkText="添加"
              nzCancelText="取消"
              (nzOnOk)="addTagDialogOK()"
              (nzOnCancel)="addTagDialogCancel()"
      >
          <form nz-form [formGroup]="tagAddForm" class="login-form" (ngSubmit)="submitTagForm()">
              <nz-form-item>
                  <nz-form-control nzErrorTip="请设置标签名">
                      <nz-input-group nzPrefixIcon="tag">
                          <input type="text" nz-input formControlName="tagName"/>
                      </nz-input-group>
                  </nz-form-control>
              </nz-form-item>
          </form>
      </nz-modal>
  `,
  styles: [`
      .ant-advanced-search-form {
          padding: 10px;
          background: #fbfbfb;
          border: 1px solid #d9d9d9;
          border-radius: 6px;
          margin-bottom: 10px;
          clear: both;
      }

      .leader-node {
          font-weight: bold;
      }

      .form-row {
          margin-bottom: 8px;
          margin-top: 8px;
      }

      .title-label {
          display: inline-block;
          margin-right: 1em;
          text-align: right;
          width: 4em;
      }

      .cols-block {
          padding: 0px;
          margin: 0px;
      }

      .cols-block li {
          list-style: none;
          display: inline-block;
          width: 200px;
      }
  `]
})
export class IndexQueryComponent extends BasicFormComponent implements OnInit {
  public resultCount = 0;
  queryResultList: { server: string, rowContent: string }[];
  queryForm = new IndexQueryForm();
  querySelectServerCandiate: Array<{ key: string, value: Array<{ checked: boolean, leader: boolean, ip: string, ipAddress: string }> }> = [];
  cols: Array<{ checked: boolean, name: string }> = [];
  addTagDialogVisible = false;
  tagAddForm: FormGroup;

  constructor(tisService: TISService, modalService: NgbModal, private fb: FormBuilder) {
    super(tisService, modalService);
  }

  openPOJOView() {
    this.openNormalDialog(PojoComponent);
  }

  ngOnInit(): void {

    this.tagAddForm = this.fb.group({
      tagName: [null, [Validators.required, Validators.maxLength(8), Validators.minLength(2)]]
    });

    let url = `/runtime/index_query.ajax`;
    this.httpPost(url, 'action=index_query_action&event_submit_do_get_server_nodes=y')
      .then((r: TisResponseResult) => {
        let groupNodes = r.bizresult.nodes;
        let cols = r.bizresult.fields;
        for (let key in groupNodes) {
          this.querySelectServerCandiate.push({'key': key, 'value': groupNodes[key]});
          if (cols) {
            cols.forEach((c: string) => {
              this.cols.push({name: c, checked: false});
            });
          }
        }
      });
  }

  addQueryTag() {
    this.addTagDialogVisible = true;
  }

  startQuery() {
    let url = `/runtime/index_query.ajax?action=index_query_action&event_submit_do_query=y&resulthandler=exec_null&appname=${this.tisService.currentApp.appName}&${this.queryForm.toParams()}`;
    this.jsonp(url).then((result) => {
      //  console.log(result.bizresult);
      this.resultCallback(result.bizresult);
      this.queryResultList = result.bizresult.result;
    });
  }

  get codeMirrirOpts(): EditorConfiguration {
    return {
      mode: 'solr',
      lineNumbers: false,
      placeholder: 'solr query param'
    };
  }

  // private appendMessage(json: any) {
  //
  //   $("#messagebox").show('slow', function () {
  //   });
  //
  //   for (let i = 0; i < json.result.length; i++) {
  //     let row = json.result[i];
  //     let tr = $('<tr></tr>');
  //     tr.append($("<td width='5%'>" + row.server + '</td>'));
  //
  //     let content =
  //       $("<td style='position:relative;word-break:break-all;'><a href='#' explainid='" + row.pk + "' style='display:none;' onclick='return openExplain(this)'>explain</a>" + row.rowContent + "</td>");
  //
  //     tr.append(content);
  //     $("#messagebox").append(tr);
  //   }
  // }

  private resultCallback(data: any) {

    // this.appendMessage(data);
    this.setresultcount(data.rownum);
  }

  setresultcount(count: number) {
    if (count < this.resultCount) {
      return;
    }
    this.resultCount = count;
    // $("#resultcount").html("命中:" + resultCount);
  }

  // public get queryURL(): string {
  //   return '/query-index?appname=' + this.tisService.currentApp.appName;
  // }
  selectAllServerNodes() {
    this.setSelectAllServerNodes(true);
  }

  private setSelectAllServerNodes(checked: boolean) {
    this.querySelectServerCandiate.forEach((group) => {
      group.value.forEach((server) => {
        server.checked = checked;
      });
    });
  }

  unSelectAllServerNodes() {
    this.setSelectAllServerNodes(false);
  }

  setSelectableCols(checked: boolean) {
    this.cols.forEach((c) => {
      c.checked = checked;
    });
  }

  onCloseTag() {

  }

  addTagDialogOK() {
    this.addTagDialogVisible = !this.submitTagForm();
    // this.addTagDialogVisible = false;
  }

  addTagDialogCancel() {
    this.addTagDialogVisible = false;
  }

  submitTagForm(): boolean {
    for (const i in this.tagAddForm.controls) {
      this.tagAddForm.controls[i].markAsDirty();
      this.tagAddForm.controls[i].updateValueAndValidity();
    }
    return this.tagAddForm.valid;
  }
}

@Component({
  selector: 'tis-query-result-row-content',
  template: `
  `
})
export class QueryResultRowContentComponent {
  constructor(private c: ViewContainerRef) {
  }

  @Input() set content(content: any) {
    $(this.c.element.nativeElement).html(content);
  }
}

class IndexQueryForm {
  q = "*:*";
  sort: string;
  fq: string[];
  start = 0;
  shownum = 3;
  // pageNo: number;
  sfields: string[];
  debug: boolean;
  mergeQuery: boolean;
  rawParams: string;

  facet: FacetQuery;

  public toParams(): string {
    let params = this.parseParams(this, new HttpParams());
    let result = params.toString();
    // console.log(result);
    return result;
  }

  private parseParams(targetObj: any, params: HttpParams): HttpParams {
    // let params = new HttpParams();
    // let result = '';

    let value = null;
    let arrayVal: Array<any>;
    for (let x in targetObj) {
      value = this[x];
      // console.log(`typeof key:${x} val:${value} ${typeof value === 'number'}`);
      if (value === undefined || value === null) {
        continue;
      }
      if (typeof value === 'function') {
        continue;
      }
      if (typeof value === "string" || typeof value === "number") {
        //   result += "&" + x + "=" +
        params = params.append(x, `${value}`);
        console.log(params);
      } else if (value instanceof Array) {
        arrayVal = value;
        for (let e in arrayVal) {
          // result += "&" + x + "=" + e;
          params = params.append(x, `${e}`);
        }
      } else if (value instanceof FacetQuery) {
        params = this.parseParams(value, params);
      } else {
        throw new Error(`value: ${value} is illegal`);
      }
    }
    return params;
  }

}

class FacetQuery {
  facet = true;
  facetQuery: string;
  facetField: string;
  facetPrefix: string;
}
