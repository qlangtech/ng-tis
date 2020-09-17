import {Component} from "@angular/core";
import {TISService} from "../service/tis.service";
import {BasicFormComponent} from "../common/basic.form.component";

import {NzModalService} from "ng-zorro-antd";


@Component({
  template: `
    <!--
      <tis-page-header  [showBreadcrumb]="false"   [needRefesh]='true' (refesh)="refesh()">
      </tis-page-header>
     -->
      <div nz-row [nzGutter]="16">
          <div class="line-chart-block" nz-col nzSpan="12">
              <line-chart queryType="solrQuery"></line-chart>
          </div>
          <div class="line-chart-block"  nz-col nzSpan="12">
              <line-chart queryType="docUpdate"></line-chart>
          </div>
      </div>
  `,
  styles: [
      `
          .line-chart-block {
          }
    `
  ]
})
export class MonitorComponent extends BasicFormComponent {
  constructor(tisService: TISService, modalService: NzModalService) {
    super(tisService, modalService);
  }

  refesh() {
  }
}
