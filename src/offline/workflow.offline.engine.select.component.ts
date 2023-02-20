import {Component, OnInit} from "@angular/core";
import {BasicWFComponent} from "./workflow.component";
import {TISService} from "../common/tis.service";
import {NzModalService} from "ng-zorro-antd/modal";
import {ActivatedRoute, Router} from "@angular/router";
import {NzNotificationService} from "ng-zorro-antd/notification";


@Component({
  // templateUrl: '/offline/workflowList.htm'
  template: `
    <tis-page-header title="数据流" [result]="result">
      <tis-header-tool>
<!--        <button nz-button nzType="primary" (click)="addWorkflowBtnClick()">-->
<!--          <i nz-icon nzType="plus" nzTheme="outline"></i>创建-->
<!--        </button>-->
      </tis-header-tool>
    </tis-page-header>

    <h1>
      Offline Engine
    </h1>

  `
})
// 工作流
export class WorkflowOfflineEngineSelectComponent extends BasicWFComponent implements OnInit {
  constructor(tisService: TISService, modalService: NzModalService, router: Router, route: ActivatedRoute, notification: NzNotificationService) {
    super(tisService, modalService, router, route, notification);
  }

  ngOnInit(): void {
  }



}
