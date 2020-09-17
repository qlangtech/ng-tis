/**
 * Created by baisui on 2017/5/2 0002.
 */

import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {TISService} from '../service/tis.service';
// import {Observable} from 'rxjs/Observable';
// import {of} from 'rxjs/observable/of';
// import {SchemaExpertDirective} from './addapp.schema.expert.editor.directive';
import {SchemaExpertAppCreateEditComponent, SchemaVisualizingEditComponent} from './schema.expert.create.edit.component';
import {BasicFormComponent} from '../common/basic.form.component';
import {AppDesc, ConfirmDTO, SchemaField, SchemaFieldType, SchemaFieldTypeTokensType, StupidModal} from './addapp-pojo';
import {NzModalService} from "ng-zorro-antd";
// import {eventNames} from "cluster";
// import {Application, Crontab}    from '../index/application';
// 文档：https://angular.io/docs/ts/latest/guide/forms.html
// schema 高级编辑模式入口：http://tis:8080/runtime/schema_manage.htm?aid=1
// 高级模式: http://tis:8080/runtime/schemaXml.ajax?aid=$aid&event_submit_do_get_xml_content=y&action=schema_action
// 小白模式: http://tis:8080/runtime/schemaManage.ajax?aid=$aid&event_submit_do_get_fields=y&action=schema_action
@Component({
  selector: 'schema-define',
  styles: [`

      [nz-button] {
          margin-right: 8px;
      }

  `
    , `

          .editor-up {
              border-width: 2px 2px 0 2px;
              border-color: #666666;
              border-style: dashed
          }

          .editor-below {
              border-width: 0 2px 2px 2px;
              border-color: #666666;
              border-style: dashed
          }

    `
  ],
  template: `
      <tis-steps type="createIndex" [step]="1"></tis-steps>
      <tis-page-header [showBreadcrumb]="false" [result]="result"></tis-page-header>
      <nz-spin [nzSpinning]="formDisabled" nzSize="large">
          <form method="post">

              <nz-tabset [nzAnimated]="false" [nzTabBarExtraContent]="extraTemplate">
                  <nz-tab [nzTitle]="foolTitleTemplate" (nzClick)="toggleModel(false)">
                      <visualizing-schema-editor [bizResult]="stupidModal"></visualizing-schema-editor>
                  </nz-tab>
                  <nz-tab [nzTitle]="expertTitleTemplate" (nzClick)="toggleModel(true)">
                      <ng-template nz-tab>
                          <expert-schema-editor [schemaXmlContent]="stupidModal.schemaXmlContent"
                                                (saveSuccess)="expertSchemaEditorSuccess($event)"
                                                (initComplete)="expertSchemaEditorInitComplete($event)">
                          </expert-schema-editor>
                      </ng-template>
                  </nz-tab>
              </nz-tabset>

              <ng-template #extraTemplate>
                  <button nz-button nzType="default" (click)="gotoProfileDefineStep()"><i nz-icon nzType="backward" nzTheme="outline"></i>上一步</button>
                  <button nz-button nzType="primary" (click)="createIndexConfirm()"><i nz-icon nzType="forward" nzTheme="outline"></i>下一步</button>
              </ng-template>

              <ng-template #foolTitleTemplate>
                  <i class="fa fa-meh-o" aria-hidden="true"></i>小白模式
              </ng-template>
              <ng-template #expertTitleTemplate>
                  <i class="fa fa-code" aria-hidden="true"></i>专家模式
              </ng-template>
          </form>
      </nz-spin>
  `
})
export class AddAppDefSchemaComponent extends BasicFormComponent implements OnInit, AfterViewInit {

  @Output('preStep') preStep = new EventEmitter<any>();
  // 下一步 确认页面
  @Output('nextStep') nextStep = new EventEmitter<any>();

  stupidModal: StupidModal;

  // 第一步中传递过来的提交信息
  @Input() dto: ConfirmDTO;

  @ViewChild(SchemaExpertAppCreateEditComponent, {static: false}) private schemaExpertEditor: SchemaExpertAppCreateEditComponent;

  @ViewChild(SchemaVisualizingEditComponent, {static: false}) private schemaVisualtEditor: SchemaVisualizingEditComponent;

  // 当前的编辑模式处在什么模式
  expertModel = false;

  constructor(tisService: TISService, modalService: NzModalService) {
    super(tisService, modalService);
  }


  // 下一步： 到索引创建确认页面
  public createIndexConfirm(): void {
    // 进行页面表单校验
    let dto = this.dto;
    dto.expertModel = this.expertModel;
    if (this.expertModel === true) {
      // 当前处在专家模式状态
      dto.expert = {xml: this.schemaExpertEditor.schemaXmlContent};
    } else {
      // 当前处在傻瓜化模式状态
      dto.stupid = {model: this.schemaVisualtEditor.stupidModel};
    }

    this.jsonPost(
      '/runtime/addapp.ajax?action=schema_action&emethod=goto_app_create_confirm'
      , (dto)).then((r) => {
      this.processResult(r);
      if (r.success) {

        // dto.coreNode = r.bizresult;
        // 提交到服务端之后统一要保存
        this.nextStep.emit(dto);
      } else {
        this.expertSchemaEditorInitComplete(r);
      }
    });

  }


  //
  public expertSchemaEditorInitComplete(e: { success: boolean, bizresult: [] }): void {

    // this.processResult(e);
    // this.fields.forEach((f) => {
    //   f.hasError = false;
    // });
    // if (e.success) {
    //   // this.expertModel = true;
    //   // console.info(e.bizresult.cfgContent);
    //   // this.schemaExpertEditor.setCodeMirrorContent(e.bizresult.cfgContent, false);
    //
    // } else {
    //   // 显示校验错误
    //   // console.info(typeof e.bizresult);
    // if ((typeof e.bizresult) === 'array') {
    //   if (e.bizresult) {
    //     e.bizresult.forEach((ee: { fieldInputBlank: boolean, id: number }) => {
    //       const find = this.fields.find((f) => {
    //         return f.id === ee.id && ee.fieldInputBlank;
    //       });
    //       if (find) {
    //         find.hasError = true;
    //       }
    //     });
    //   }
    //
    //   // }
    // }

    this.expertModel = e.success;
  }


  // 名称空间是否有错误
  // public fieldNameInputErr(id: number): Observable<{ valid: boolean }> {
  //   const result = {valid: false};
  //   this.stupidModelValidateResult.set(id, result);
  //   return of(result);
  //   // this.stupidModelValidateResult.forEach((i) => {
  //   //   if (i.id === id && i.fieldInputBlank) {
  //   //     result.valid = true;
  //   //   }
  //   // });
  //   // return result.valid;
  // }
  // 切换视图状态
  public toggleModel(_expertModel: boolean): void {
    // 判断当前状态和想要变化的状态是否一致
    if (this.formDisabled || this.expertModel === _expertModel) {
      return;
    }
    this.formDisabled = true;
    this.clearProcessResult();
    try {
      if (_expertModel === true) {
        this.schemaVisualtEditor.saveAndMergeXml().then((schemaXmlContent: string) => {
          this.stupidModal.schemaXmlContent = schemaXmlContent;
          this.formDisabled = false;
        })
      } else {
        // 点击小白模式
        this.schemaExpertEditor.doSaveContent().then((modal: StupidModal) => {
          this.stupidModal = modal;
          this.formDisabled = false;
        });
      }
    } catch (e) {
      this.formDisabled = false;
      throw e;
    }
    this.expertModel = _expertModel;
  }

  // 接收专家模式下编辑成功之后消息
  public expertSchemaEditorSuccess(result: { bizresult: StupidModal, success: boolean }): void {
    // if (result.success) {
    //   this.setBizResult(result.bizresult);
    //   this.expertModel = false;
    // } else {
    //   this.processResult(result);
    // }
  }


  ngAfterViewInit(): void {
    // console.info(this.dto);
  }

  ngOnInit(): void {
    // FIXME: modify it
    if (!this.dto.stupid) {
      // 从app定义第一步进入
      let f = this.dto.appform;
      let workflow = f.workflow;
      // let tisTpl = f.tisTpl;
      // workflow = 'union';
      this.httpPost('/runtime/schemaManage.ajax'
        , 'event_submit_do_get_tpl_fields=y&action=schema_action&wfname='
        + workflow)
        .then((r) => {
          if (r.success) {
            return r;
          } else {
            this.processResult(r);
          }
        })
        .then(
          (r: { bizresult: StupidModal }) => {
            //   this.setBizResult(r.bizresult);
            this.stupidModal = StupidModal.deseriablize(r.bizresult);
            // console.log(this.stupidModal);
            this.setTplAppid(this.stupidModal);
          });
    } else {
      let d: ConfirmDTO = this.dto
      // 是从确认页面返回进入的,傻瓜化模式
      if (d.stupid) {
        this.stupidModal = d.stupid.model;
      }
    }
  }


  private setTplAppid(o: StupidModal): void {
    // console.info('tplAppId:' + o.tplAppId);
    if (o.tplAppId) {
      this.dto.tplAppId = o.tplAppId;
    }
  }


  // 向上添加新列
  // public upAddColumn(f: any) {
  //   // 添加一个空对象
  //   this.fields.push({});
  //   var insertIndex = 0;
  //   for (let i = 0; i < this.fields.length; i++) {
  //     if (f.id < this.fields[i].id && f.id < this.fields[i + 1].id) {
  //         continue;
  //     }
  //     insertIndex = i;
  //   }
  //
  // }


  // public testAdd(): void {
  //   // console.info('testadd');
  //   this.fields.push({
  //     'split': true,
  //     'rangequery': false,
  //     'indexed': false,
  //     'stored': false,
  //     'nodeName': 'goods_id',
  //     'tokenizerType': 'string',
  //     'id': 99,
  //     'fieldtype': 'string',
  //     'multiValue': false,
  //     'required': false
  //   });
  // }


  public gotoProfileDefineStep(): void {

    this.preStep.emit(this.dto);
  }

  // schema 编辑提交
  public schemaEditSubmit(): void {

  }

  expertModelSelect() {
    // setTimeout(() => {
    //   this.stupidModal = Object.assign(new StupidModal(), this.stupidModal);
    // })
  }
}



