import {AfterContentInit, Component, EventEmitter, Output} from "@angular/core";
import {TISService} from "../service/tis.service";
import {AppFormComponent, CurrentCollection} from "../common/basic.form.component";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ActivatedRoute} from "@angular/router";
import {NzModalService} from "ng-zorro-antd";


@Component({
  template: `
<nz-spin nzSize="large" [nzSpinning]="formDisabled" >
      <nz-empty
              [nzNotFoundImage]="
        'https://gw.alipayobjects.com/mdn/miniapp_social/afts/img/A*pevERLJC9v0AAAAAAAAAAABjAQAAAQ/original'
      "
              [nzNotFoundContent]="contentTpl"
      >
          <ng-template #contentTpl>
              <button class="btn btn-primary" (click)="createIncrSyncChannal()">创建增量通道</button>
          </ng-template>
      </nz-empty>
</nz-spin>
  `
})
export class IncrBuildStep0Component extends AppFormComponent implements AfterContentInit {
  @Output() nextStep = new EventEmitter<any>();

  constructor(tisService: TISService, route: ActivatedRoute, modalService: NzModalService) {
    super(tisService, route, modalService);
  }

  protected initialize(app: CurrentCollection): void {
  }

  ngAfterContentInit(): void {
  }

  public createIncrSyncChannal(): void {

    this.httpPost('/coredefine/corenodemanage.ajax', 'action=core_action&emethod=create_incr_sync_channal')
      .then((r) => {
        if (r.success) {
          // this.app = r.bizresult.app;
          // this.config = r.bizresult.config;
          // this.instanceDirDesc = r.bizresult.instanceDirDesc;
          // this._incrScript = "ddd";
          this.nextStep.next(r.bizresult);
        }
      });
  }
}
