import {AfterContentInit, AfterViewInit, Component, EventEmitter, Input, Output, ViewChild} from "@angular/core";
import {TISService} from "../service/tis.service";
import {AppFormComponent, CurrentCollection} from "../common/basic.form.component";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ActivatedRoute} from "@angular/router";
import {NgTerminal} from "ng-terminal";
import {IndexIncrStatus} from "./incr.build.component";


@Component({
  template: `
      <nz-steps [nzCurrent]="2">
          <nz-step nzTitle="第一步" nzDescription="脚本生成"></nz-step>
          <nz-step nzTitle="第二步" nzDescription="构建部署"></nz-step>
          <nz-step nzTitle="第三步" nzDescription="状态确认"></nz-step>
      </nz-steps>
      <tis-page-header [showBreadcrumb]="false" [result]="result">
          <tis-header-tool>
              <button nz-button nzType="default" (click)="createIndexStepPre()">上一步</button>
              <button nz-button nzType="primary" (click)="createIndexStepNext()">回到首页</button>
              <button nz-button nzType="default" (click)="cancelStep()">取消</button>
          </tis-header-tool>
      </tis-page-header>
     <incr-pod-logs-status></incr-pod-logs-status>
  `
})
export class IncrBuildStep3Component extends AppFormComponent implements AfterContentInit, AfterViewInit {
  @Output() nextStep = new EventEmitter<any>();
  @Output() preStep = new EventEmitter<any>();
  @Input() dto: IndexIncrStatus;
  private currCollection: CurrentCollection;

  constructor(tisService: TISService, route: ActivatedRoute, modalService: NgbModal) {
    super(tisService, route, modalService);
  }

  protected initialize(app: CurrentCollection): void {
    this.currCollection = app;
  }

  ngAfterViewInit(): void {
  }

  ngAfterContentInit(): void {
  }

  public createIndexStepPre() {
    this.preStep.emit(this.dto);
  }

  createIncrSyncChannal() {

  }

  createIndexStepNext() {
    this.nextStep.emit(this.dto);
  }

  cancelStep() {
  }
}
