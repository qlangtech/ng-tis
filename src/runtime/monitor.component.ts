import {Component} from "@angular/core";
import {TISService} from "../service/tis.service";
import {BasicFormComponent} from "../common/basic.form.component";

import {NzModalService} from "ng-zorro-antd";


@Component({
  // templateUrl: '/coredefine/monitor.htm'
  template: `
    monitor
  `
})
export class MonitorComponent extends BasicFormComponent {
  constructor(tisService: TISService, modalService: NzModalService) {
    super(tisService, modalService);
  }
}
