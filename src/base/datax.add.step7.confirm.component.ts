/**
 *   Licensed to the Apache Software Foundation (ASF) under one
 *   or more contributor license agreements.  See the NOTICE file
 *   distributed with this work for additional information
 *   regarding copyright ownership.  The ASF licenses this file
 *   to you under the Apache License, Version 2.0 (the
 *   "License"); you may not use this file except in compliance
 *   with the License.  You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild
} from "@angular/core";
import {TISService} from "../common/tis.service";
import {AppFormComponent, BasicFormComponent, CurrentCollection} from "../common/basic.form.component";
import {NzModalService} from "ng-zorro-antd/modal";
import {NzDrawerRef, NzDrawerService} from "ng-zorro-antd/drawer";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {HeteroList, Item, PluginSaveResponse, PluginType} from "../common/tis.plugin";
import {BasicDataXAddComponent} from "./datax.add.base";
import {ActivatedRoute, Router} from "@angular/router";
import {StepType} from "../common/steps.component";
import {DataXCfgFile, DataxDTO, TransformerInfo} from "./datax.add.component";
import {CodemirrorComponent} from "../common/codemirror.component";
import {KEY_APPNAME} from "../common/plugin/type.utils";
import {TableTransformerComponent} from "src/common/selectedtab/table.transformer.component";
import {SelectedTabDTO} from "../common/selectedtab/plugin-sub-form.component";
import {ISubDetailTransferMeta} from "./datax.add.step4.component";

export enum ExecModel {
  Create, Reader
}


// 文档：https://angular.io/docs/ts/latest/guide/forms.html
@Component({
  selector: "datax-config",
  template: `
    <tis-steps *ngIf="createModel" [type]="stepType" [step]="offsetStep(4)"></tis-steps>
    <!--      <tis-page-header [showBreadcrumb]="false" [result]="result">-->
    <!--          <tis-header-tool>-->
    <!--              <button nz-button nzType="default">上一步</button>&nbsp;<button nz-button nzType="primary" (click)="createStepNext()">创建</button>-->
    <!--          </tis-header-tool>-->
    <!--      </tis-page-header>-->
    <nz-spin [nzSpinning]="this.formDisabled">
      <ng-container [ngSwitch]="createModel">
        <tis-steps-tools-bar *ngSwitchCase="true" (cancel)="cancel()" [goBackBtnShow]="_offsetStep>0"
                             (goBack)="goback()">
          <final-exec-controller [ngSwitch]="createDataXStep">
            <button *ngSwitchCase="true" nz-button nzType="primary" (click)="createStepNext()"><i nz-icon
                                                                                                  nzType="rocket"
                                                                                                  nzTheme="outline"></i>创建
            </button>
            <button *ngSwitchCase="false" nz-button nzType="primary" (click)="updateStepNext()"><i nz-icon
                                                                                                   nzType="rocket"
                                                                                                   nzTheme="outline"></i>更新
            </button>
          </final-exec-controller>
        </tis-steps-tools-bar>
        <div *ngSwitchCase="false" class="fix-foot">

          <ng-container [ngSwitch]="inUpdate">
            <button nz-button *ngSwitchCase="false" (click)="startUpdate()"><i nz-icon nzType="edit"
                                                                               nzTheme="outline"></i>编辑基本信息
            </button>&nbsp;
            <ng-container *ngIf="notWorkFlow">
              <button nz-button *ngSwitchCase="false" (click)="startEditReader()"><i nz-icon nzType="edit"
                                                                                     nzTheme="outline"></i>Reader
              </button>&nbsp;
            </ng-container>
            <button nz-button *ngSwitchCase="false" (click)="startEditWriter()"><i nz-icon nzType="edit"
                                                                                   nzTheme="outline"></i>Writer
            </button>&nbsp;
            <button nz-button *ngSwitchCase="true" nzType="primary" nzDanger (click)="inUpdate = false"><i
              nz-icon
              nzType="edit"
              nzTheme="outline"></i>取消编辑
            </button>
          </ng-container>
          &nbsp;
          <button nz-button [disabled]="inUpdate" nzType="primary" (click)="reGenerate()"></button>
          <button nz-button nz-dropdown nzType="primary" [nzDropdownMenu]="dataxScriptfiles">
            生成脚本文件
            <i nz-icon nzType="down"></i>
          </button>
          <nz-dropdown-menu #dataxScriptfiles="nzDropdownMenu">
            <ul nz-menu>
              <li nz-menu-item (click)="reGenerate()">DataX配置文件</li>
              <li nz-menu-item (click)="reGenerateSqlDDL()">SQL DDL</li>
            </ul>
          </nz-dropdown-menu>
        </div>
      </ng-container>



      <ng-container *ngIf=" dto.supportBatch">
        <nz-page-header [nzGhost]="true">
          <nz-page-header-title>DataX脚本</nz-page-header-title>
          <nz-page-header-content class="item-block child-block script-block">
            <ul>
              <li *ngFor="let f of genCfgFileList">
                <button (click)="viewDataXCfg(f)" nz-button nzType="link" nzSize="large">
                  <i nz-icon nzType="file-text" nzTheme="outline"></i>{{f.fileName}}
                </button>
              </li>
              <li>
                <i
                  style="color:#777777;font-size: 10px">生成时间：{{lastestGenFileTime | date : "yyyy/MM/dd HH:mm:ss"}} </i>
                <button nz-button nzSize="small" (click)="reGenerate()">重新生成</button>
              </li>
            </ul>
          </nz-page-header-content>
        </nz-page-header>


      </ng-container>
      <ng-container *ngIf="createDDLFileList.length > 0">

        <nz-page-header [nzGhost]="true">
          <nz-page-header-title>Table DDL Script</nz-page-header-title>
          <nz-page-header-content class="item-block child-block script-block">
            <ul>
              <li *ngFor="let f of createDDLFileList">
                <button (click)="viewCreateDDLFile(f)" nz-button nzType="link" nzSize="large"><i nz-icon
                                                                                                 nzType="console-sql"
                                                                                                 nzTheme="outline"></i>{{f}}
                </button>
              </li>
              <li>
                <i
                  style="color:#777777;font-size: 10px">生成时间：{{lastestGenFileTime | date : "yyyy/MM/dd HH:mm:ss"}}</i>
                <button nz-button nzSize="small" (click)="reGenerateSqlDDL()">重新生成</button>
              </li>
            </ul>
          </nz-page-header-content>
        </nz-page-header>
      </ng-container>
      <nz-page-header *ngIf="transformerRules.length>0" [nzGhost]="true">
        <nz-page-header-title>Transformer</nz-page-header-title>
        <nz-page-header-content class="item-block child-block script-block">
          <ul>
            <li style="overflow: inherit" *ngFor="let f of transformerRules">
              <nz-badge nzSize="small" [nzCount]="f.ruleCount">
                <button (click)="showTransformer(f.tableName)" nz-button nzType="link" nzSize="large">
                  <i nz-icon nzType="retweet" nzTheme="outline"></i>{{f.tableName}}
                </button>
              </nz-badge>
            </li>
          </ul>
        </nz-page-header-content>
      </nz-page-header>
      <nz-page-header [nzGhost]="true">
        <nz-page-header-title>基本信息</nz-page-header-title>
        <nz-page-header-content class="item-block">
          <tis-plugins (afterSave)="afterPluginSave($event)" [errorsPageShow]="false"
                       [formControlSpan]="20" [shallInitializePluginItems]="false" [showSaveButton]="inUpdate"
                       [disabled]="!inUpdate"
                       [plugins]="[{name: 'appSource', require: true, extraParam: pluginExtraParam}]"></tis-plugins>
        </nz-page-header-content>
      </nz-page-header>
      <ng-container *ngIf="notWorkFlow ">

        <nz-page-header [nzGhost]="true">

          <nz-page-header-title>Reader</nz-page-header-title>
          <nz-page-header-content class="item-block">
            <tis-plugins (afterSave)="afterPluginSave($event)" [errorsPageShow]="false"
                         [formControlSpan]="20" [shallInitializePluginItems]="false" [showSaveButton]="false"
                         [disabled]="true"
                         [plugins]="[{name: 'dataxReader', require: true, extraParam: pluginExtraParam}]"></tis-plugins>
          </nz-page-header-content>
        </nz-page-header>
      </ng-container>
      <nz-page-header [nzGhost]="true">
        <nz-page-header-title>Writer</nz-page-header-title>
        <nz-page-header-content class="item-block">
          <tis-plugins (afterSave)="afterPluginSave($event)" [showExtensionPoint]="{open:false}"
                       [errorsPageShow]="false"
                       [formControlSpan]="20" [shallInitializePluginItems]="false" [showSaveButton]="false"
                       [disabled]="true"
                       [plugins]="[{name: 'dataxWriter', require: true, extraParam: pluginExtraParam}]"></tis-plugins>
        </nz-page-header-content>
      </nz-page-header>
    </nz-spin>
  `
  , styles: [
    `     .script-block {
      max-height: 200px;
      overflow-y: auto
    }

    .fix-foot {
      z-index: 100;
      padding: 6px;
      background-color: #f1f1f1;
      height: 40px;
      text-align: center;
      position: fixed;
      bottom: 0px;
      width: 100%;
    }

    .child-block {
      list-style-type: none;
    }

    .child-block li {
      display: inline-block;
      width: 20%;
      padding-right: 8px;
      margin-right: 8px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .editable-cell {
      position: relative;
      padding: 5px 12px;
      cursor: pointer;
    }

    .editable-row:hover .editable-cell {
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      padding: 4px 11px;
    }
    `
  ]
})
export class DataxAddStep7Component extends BasicDataXAddComponent implements OnInit, AfterViewInit {
  errorItem: Item = Item.create([]);
  pluginExtraParam: string;
  @Input()
  execModel: ExecModel = ExecModel.Create;
  inUpdate = false;
  genCfgFileList: Array<DataXCfgFile> = [];
  transformerRules: Array<TransformerInfo> = [];
  createDDLFileList: Array<string> = [];
  lastestGenFileTime: number;

  // readModel = ExecModel.Reader;

  @Input()
  set dtoooo(dto: DataxDTO) {
    this.dto = dto;
  }

  constructor(tisService: TISService, modalService: NzModalService, private drawerService: NzDrawerService, r: Router, route: ActivatedRoute, notification: NzNotificationService) {
    super(tisService, modalService, r, route, notification);
  }

  get createModel(): boolean {
    return this.execModel === ExecModel.Create;
  }

  get createDataXStep(): boolean {
    return this.stepType === StepType.CreateDatax
  }


  ngOnInit(): void {
    if (!this.dto) {
      throw new Error("dto can not be null");
    }
    this.pluginExtraParam = `update_${!this.createModel},justGetItemRelevant_true,dataxName_${this.dto.dataxPipeName},${DataxDTO.KEY_PROCESS_MODEL}_${this.dto.processModel}`;

    super.ngOnInit();
  }

  protected initialize(app: CurrentCollection): void {

    if (!app) {
      this.tisService.currentApp = new CurrentCollection(0, this.dto.dataxPipeName);
    }

    this.generate_datax_cfgs((this.execModel === ExecModel.Reader));
  }

  private generate_datax_cfgs(getExist: boolean): Promise<GenerateCfgs> {
   // console.log([this.dto.readerDescriptor, this.dto.writerDescriptor]);
    if (!this.dto.supportBatch && !this.dto.writerDescriptor.extractProps["createDDL"]) {
      return;
    }

    let url = '/coredefine/corenodemanage.ajax';
    return this.httpPost(url, 'action=datax_action&emethod=generate_datax_cfgs&dataxName='
      + this.dto.dataxPipeName + '&' + KEY_APPNAME + "=" + this.dto.dataxPipeName
      + "&getExist=" + (getExist) + "&" + DataxDTO.KEY_PROCESS_MODEL + "=" + this.dto.processModel)
      .then((r) => {
        if (r.success) {
          let cfgs: GenerateCfgs = r.bizresult;
          this.genCfgFileList = cfgs.dataxFiles;
          this.createDDLFileList = cfgs.createDDLFiles;
          this.lastestGenFileTime = cfgs.genTime;
          // @ts-ignore
          this.transformerRules = cfgs.transformerInfo;
          // console.log([this.transformerRules,cfgs.transformerInfo]);
          return r.bizresult;
        }
      });
  }

  ngAfterViewInit(): void {
  }


  /**
   * 更新DataX配置
   */
  updateStepNext() {
    this.jsonPost("/coredefine/corenodemanage.ajax?action=datax_action&emethod=update_datax&dataxName="
      + this.dto.dataxPipeName + "&" + DataxDTO.KEY_PROCESS_MODEL + "=" + this.dto.processModel
      , this.dto.profile)
      .then((r) => {
        this.processResult(r);
        if (r.success) {
          // console.log(dto);
          // this.nextStep.emit(this.dto);
          this.r.navigate(["../config"], {relativeTo: this.route});
        }
      });
  }

  // 执行下一步
  get notWorkFlow(): boolean {
    return this.stepType !== StepType.CreateWorkflow;
  }

  get isWorkFlow(): boolean {
    return this.stepType === StepType.CreateWorkflow;
  }

  public createStepNext(): void {
    this.jsonPost("/coredefine/corenodemanage.ajax?action=datax_action&emethod=create_datax&dataxName=" + this.dto.dataxPipeName
      , this.dto.profile)
      .then((r) => {
        this.processResult(r);
        if (r.success) {
          // console.log(dto);
          // this.nextStep.emit(this.dto);
          // this.successNotify(`DataX 实例:'${this.dto.dataxPipeName}'已创建成功`, 2000)
          setTimeout(() => {
            this.r.navigate(["/x", this.dto.dataxPipeName], {relativeTo: this.route});
          }, 1000);

          // onClose.subscribe(() => {
          //
          // })
        } else {
          this.errorItem = Item.processFieldsErr(r);
        }
      });
  }

  viewDataXCfg(fileName: DataXCfgFile) {
    this.viewGenFile(fileName, {
      'formatMode': 'application/ld+json',
      'titlePrefix': 'DataX Config File ',
      'type': GenCfgFileType.datax
    });
  }

  showTransformer(tableName: string) {

    let meta = <ISubDetailTransferMeta> {id:tableName};
    let basePluginMeta: PluginType[] = []
    let baseHetero: HeteroList[] = [];

    let dto = new SelectedTabDTO(meta, basePluginMeta, baseHetero);
    const drawerRef = this.drawerService.create<TableTransformerComponent, {}, {}>({
      // 此处宽度不能用百分比，不然内部的codemirror显示会有问题
      nzWidth: "900px",
      // nzHeight: "80%",
      nzPlacement: "right",
      nzTitle: `Transformer of '${tableName}' `,
      nzContent: TableTransformerComponent,
      nzWrapClassName: 'get-gen-cfg-file',
      nzContentParams: {
        readonly: true,
        dto: dto
      }
    });
  }

  viewCreateDDLFile(createDDLName: string) {
    this.viewGenFile({"fileName": createDDLName}
      , {
        'formatMode': 'text/x-sql',
        'titlePrefix': 'Table create DDL file For Writer ',
        'type': GenCfgFileType.createDDL,
        'editable': true,
        updateMethod: "save_table_create_ddl"
      });
  }

  private viewGenFile(fileName: DataXCfgFile, opt: GenCfgFileOpt) {

    this.jsonPost("/coredefine/corenodemanage.ajax?" + "action=datax_action&emethod=get_gen_cfg_file&dataxName=" + this.dto.dataxPipeName
      + "&fileType=" + opt.type + "&" + DataxDTO.KEY_PROCESS_MODEL + "=" + this.dto.processModel
      , fileName)
      .then((r) => {
        this.processResult(r);
        if (r.success) {
          const drawerRef = this.drawerService.create<ViewGenerateCfgComponent, {}, {}>({
            // 此处宽度不能用百分比，不然内部的codemirror显示会有问题
            nzWidth: "800px",
            // nzHeight: "80%",
            nzPlacement: "right",
            nzTitle: `${opt.titlePrefix} '${fileName.fileName}' `,
            nzContent: ViewGenerateCfgComponent,
            nzWrapClassName: 'get-gen-cfg-file',
            nzContentParams: {
              processModel: this.dto.processModel,
              fileMeta: Object.assign({
                fileName: fileName.fileName,
                dataxName: this.dto.dataxPipeName
              }, r.bizresult)
              , formatMode: opt.formatMode
              , editMeta: opt
            }
          });
        }
      });
  }


  reGenerate() {
    this.generate_datax_cfgs(false).then((r: GenerateCfgs) => {
      // title: string, content: string, options?: NzNotificationDataOptions
      this.tisService.notification.success("成功", `最新生成${r.dataxFiles.length}个DataX配置文件`);
    });
  }

  reGenerateSqlDDL() {
    let url = '/coredefine/corenodemanage.ajax';
    return this.httpPost(url, 'action=datax_action&emethod=regenerate_sql_ddl_cfgs&dataxName='
      + this.dto.dataxPipeName + '&' + DataxDTO.KEY_PROCESS_MODEL + '=' + this.dto.processModel)
      .then((r) => {
        if (r.success) {
          let cfgs: GenerateCfgs = r.bizresult;
          this.createDDLFileList = cfgs.createDDLFiles;
          this.lastestGenFileTime = cfgs.genTime;
          this.tisService.notification.success("成功", `最新生成${cfgs.createDDLFiles.length}个Create Table DDL文件`);
        }
      });
  }

  startUpdate() {
    this.inUpdate = true;
  }

  afterPluginSave(e: PluginSaveResponse) {
    if (e.saveSuccess) {
      this.inUpdate = false;
    }
  }

  startEditReader() {
    this.startDataXEdit("reader");
  }

  private startDataXEdit(execType: "reader" | "writer") {
    let execId = BasicFormComponent.getUUID();
    if (!execId) {
      throw new Error("in valid execId");
    }
    this.httpPost("/coredefine/corenodemanage.ajax"
      , "action=datax_action&emethod=create_update_process&execId=" + execId + "&"
      + DataxDTO.KEY_PROCESS_MODEL + "=" + this.dto.processModel)
      .then((r) => {
        if (r.success) {
          this.r.navigate(['../update'], {
            relativeTo: this.route,
            fragment: execType,
            queryParams: {"execId": r.bizresult}
          });
        }
      });
  }

  startEditWriter() {

    this.startDataXEdit("writer");
  }


}

enum GenCfgFileType {
  datax = 'datax',
  createDDL = 'createTableDDL'
}

interface GenCfgFileOpt {
  titlePrefix: string;
  formatMode: string;
  type: GenCfgFileType;
  editable?: true;
  updateMethod?: string;
}

class GenerateCfgs {
  dataxFiles: Array<DataXCfgFile>;
  createDDLFiles: Array<string>;
  genTime: number;
  transformerInfo: Array<TransformerInfo>;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-page-header *ngIf="editMeta.editable" class="recent-using-tool" [nzGhost]="false">
      <nz-page-header-extra>
        <button nz-button [disabled]="this.formDisabled" nzType="primary" (click)="saveContent()"><i nz-icon
                                                                                                     nzType="save"
                                                                                                     nzTheme="outline"></i>保存
        </button>
      </nz-page-header-extra>
    </nz-page-header>
    <div class="item-block" style="height: 90%;">
      <tis-codemirror #codemirror [name]="'script'" [config]="{mode: formatMode ,lineNumbers: true}"
                      [size]="{width:null,height:'100%'}" [(ngModel)]="fileMeta.content"></tis-codemirror>
    </div>
  `
  , styles: [`
  `]
})
export class ViewGenerateCfgComponent extends AppFormComponent implements AfterViewInit {

  @ViewChild('codemirror', {static: false}) codeMirror: CodemirrorComponent;
  @Input()
  fileMeta: { content?: string, fileName?: string } = {};


  @Input()
  processModel: StepType;

  @Input()
  formatMode: string;

  @Input()
  editMeta: EditMeta = {};

  constructor(private drawerRef: NzDrawerRef<{ hetero: HeteroList }>, tisService: TISService
    , route: ActivatedRoute, modalService: NzModalService, notification: NzNotificationService, private cd: ChangeDetectorRef) {
    super(tisService, route, modalService, notification);
    this.getCurrentAppCache = true;
    // this.cd.detach()
  }

  ngAfterViewInit(): void {
    // setTimeout(() => {
    //   this.codeMirror.save();
    // }, 2000);
  }


  ngOnInit(): void {
    super.ngOnInit();
    //  this.cd.detectChanges();
  }

  protected initialize(app: CurrentCollection): void {

  }

  close(): void {
    this.drawerRef.close();
  }

  saveContent() {
    let post = this.fileMeta;
    if (!this.editMeta.editable) {
      throw new Error("must be editable");
    }
    this.jsonPost("/coredefine/corenodemanage.ajax?event_submit_do_"
      + this.editMeta.updateMethod + "=y&action=datax_action&"
      + DataxDTO.KEY_PROCESS_MODEL + "=" + this.processModel
      , post).then((result) => {
      this.cd.detectChanges();
      if (result.success) {
        this.drawerRef.close();
      }
    });
  }
}


interface ITableAlias {
  from: string;
  to: string;
}

interface EditMeta {
  editable?: boolean;
  updateMethod?: string;
}
