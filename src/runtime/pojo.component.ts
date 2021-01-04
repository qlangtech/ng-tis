/**
 * Created by baisui on 2017/3/29 0029.
 */
import {Component, ElementRef, ViewChild} from '@angular/core';
import {TISService} from '../service/tis.service';
// import {BasicEditComponent} from '../corecfg/basic.edit.component';
// import {ScriptService} from '../service/script.service';

import {AppFormComponent, CurrentCollection} from '../common/basic.form.component';
import {ActivatedRoute} from '@angular/router';
import {EditorConfiguration} from "codemirror";
import {NzModalService} from "ng-zorro-antd";

@Component({
  template: `
          <tis-codemirror  [config]="codeMirrirOpts" [ngModel]="pojoJavaContent"></tis-codemirror>
  `,
})
export class PojoComponent extends AppFormComponent {
  // private code: ElementRef;

  pojoJavaContent: string;

  // @ViewChild('codeArea', {static: false}) set codeArea(e: ElementRef) {
  //   this.code = e;
  // }

  constructor(tisService: TISService, route: ActivatedRoute, modalService: NzModalService) {
    super(tisService, route, modalService);
  }

  get codeMirrirOpts(): EditorConfiguration {
    return {
      mode: "text/x-java",
      lineNumbers: true
    };
  }

  protected initialize(app: CurrentCollection): void {
    console.log(app);
    this.httpPost('/coredefine/corenodemanage.ajax'
      , 'action=core_action&emethod=get_pojo_data')
      .then((r) => {
        if (r.success) {
          //       this.code.nativeElement.innerHTML = r.bizresult;
          this.pojoJavaContent = r.bizresult;
        }
      });
  }

}
