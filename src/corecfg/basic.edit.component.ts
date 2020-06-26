import {Component, OnInit, ViewChild, ElementRef, Input} from '@angular/core';
import {TISService} from '../service/tis.service';
import {NgbModal, ModalDismissReasons, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
// import {ScriptService} from '../service/script.service';
import {BasicFormComponent} from '../common/basic.form.component';

declare var CodeMirror: any;
declare var document: any;
declare var jQuery: any;


import {Subject} from 'rxjs/Subject';
import {EditorConfiguration} from "codemirror";
import {ActivatedRoute, Params} from "@angular/router";

// import {Observable} from 'rxjs/Observable';

export abstract class BasicEditComponent extends BasicFormComponent implements OnInit {

  showSaveControl = true;

  public model: FormData = new FormData();
  // protected code: ElementRef;
  // protected codeMirror: any;
  // schemaContent: string;
  snid: number;

  // private resSnapshotid = new Subject<number>();

  constructor(tisService: TISService, modalService: NgbModal, protected route: ActivatedRoute) {
    super(tisService, modalService);
  }

  @Input() set snapshotid(val: number) {
    this.snid = val;
    // this.resSnapshotid.next(val);
  }


  ngOnInit(): void {

    this.route.params
      .subscribe((params: Params) => {
        let snapshotid = params['snapshotid']
        if (!snapshotid) {
          throw new Error("can not find rout param restype");
        }
        // tslint:disable-next-line:radix
        this.snid = parseInt(snapshotid);
        this.httpPost('/runtime/jarcontent/schema.ajax'
          , 'action=' + this.executeAction + '&snapshot='
          + snapshotid + '&editable=false&restype='
          + this.getResType(params) + '&event_submit_' + this.getExecuteMethod() + '=y')
          .then(result => result.success ? result.bizresult : super.processResult(result))
          .then(result => this.processConfigResult(result));
      });
  }

  protected getResType(params: Params): string {
    let resType = params['restype']
    if (!resType) {
      throw new Error("can not find rout param restype");
    }
    if ('schema' === resType) {
      return 'schema.xml';
    } else if ('config' === resType) {
      return 'solrconfig.xml';
    } else {
      throw new Error(`restype:${resType} is illegal`);
    }
  }

  protected get executeAction(): string {
    return "save_file_content_action";
  }

  protected getExecuteMethod(): string {
    return 'do_get_config';
  }

  get codeMirrirOpts(): EditorConfiguration {
    return {
      mode: {name: 'xml', alignCDATA: true},
      lineNumbers: true
    };
  }

  // 保存提交内容
  public doSaveContent(): void {
    // this.result = null;
    //
    // this.tisService.httpPost('/runtime/jarcontent/schema.ajax'
    //   , (jQuery(exitform)).serialize()).then(result => {
    //
    //   this.processResult(result);
    //   // if (result.success) {
    //   //   this.afterSaveContent(result.bizresult);
    //   // } else {
    //   //
    //   // }
    //   this.afterSaveContent(result);
    // });
  }


  public get editFormAppendParam(): { name: string, val: string }[] {
    return [];
  }

  protected abstract afterSaveContent(bizresult: any): void;

  protected processConfigResult(conf: any): void {
    this.initialView(conf);
  }

  // incrCount: number = 1;

  // public updateContent(): void {
  //   this.codeMirror.setValue(this.code.nativeElement.value);
  // }

  protected afterCodeSet(cfgContent: string): void {
  }

  private setCodeMirrorContent(cfgContent: string, initTime: boolean): void {
  }

  initialView(cfgContent: string): void {
    this.model.content = cfgContent;
  }
}

export class FormData {
  snapshotid: number;
  content: string;
  filename: string;
  memo: string;
}



