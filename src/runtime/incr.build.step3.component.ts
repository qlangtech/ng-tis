import {AfterContentInit, AfterViewInit, Component, EventEmitter, Input, Output, ViewChild} from "@angular/core";
import {TISService} from "../service/tis.service";
import {AppFormComponent, CurrentCollection} from "../common/basic.form.component";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ActivatedRoute} from "@angular/router";
import {NgTerminal} from "ng-terminal";
import {IndexIncrStatus} from "./incr.build.component";
import {NzModalService} from "ng-zorro-antd";


@Component({
  template: `
     
      <tis-steps type="createIncr" [step]="2"></tis-steps>
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

  constructor(tisService: TISService, route: ActivatedRoute, modalService: NzModalService) {
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
