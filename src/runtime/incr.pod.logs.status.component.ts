import {AfterContentInit, AfterViewInit, Component, Input, OnDestroy, ViewChild} from "@angular/core";
import {TISService} from "../service/tis.service";
import {AppFormComponent, CurrentCollection} from "../common/basic.form.component";
import {ActivatedRoute} from "@angular/router";
import {NgTerminal} from "ng-terminal";
import {NzModalService, NzNotificationService} from "ng-zorro-antd";
import {Subject} from "rxjs";
import {WSMessage} from "./core.build.progress.component";


@Component({
  selector: 'incr-pod-logs-status',
  template: `
      <div style="height: 800px;">
          <nz-alert *ngIf="this.logMonitorTimeout" nzType="warning" [nzDescription]="warnTpl" nzShowIcon></nz-alert>
          <ng-template #warnTpl>
              日志监听已经超时，请重连
              <button nz-button nzType="primary" nzSize="small" (click)="reconnLogMonitor()">重连</button>
          </ng-template>
          <ng-terminal #term></ng-terminal>
      </div>
  `,
  styles: [
      `
          nz-alert {
              margin: 10px 0 10px 0;
          }
    `
  ]
})
export class IncrPodLogsStatusComponent extends AppFormComponent implements AfterContentInit, AfterViewInit, OnDestroy {
  private currCollection: CurrentCollection;
  @ViewChild('term', {static: true}) terminal: NgTerminal;
  private componentDestroy = false;
  @Input()
  msgSubject: Subject<WSMessage>;
  logMonitorTimeout = false;

  constructor(tisService: TISService, route: ActivatedRoute, modalService: NzModalService, notification: NzNotificationService) {
    super(tisService, route, modalService, notification);
  }


  ngAfterViewInit(): void {
    this.sendIncrdeployChange();
    // this.msgSubject.next(new WSMessage("incrdeploy-change"));
    // 服务端生成了taskid
    // this.tisService.wsconnect('ws://' + window.location.host
    //   + '/tjs/download/logfeedback?collection=' + this.currCollection.appName + "&logtype=incrdeploy-change")
    //   .subscribe((response: MessageEvent): void => {
    //     let msg = JSON.parse(response.data);
    //     this.terminal.write(msg.data + "\r\n");
    //   });

  }

  ngOnDestroy(): void {
    this.componentDestroy = true;
  }

  ngAfterContentInit(): void {
    this.msgSubject.subscribe((response: WSMessage): void => {
      if (!response || this.componentDestroy) {
        return;
      }
      // console.log(response);
      switch (response.logtype) {
        case "incrdeploy-change":

          if (response.data.msg.timeout) {
           // console.log("============timeout");
            this.logMonitorTimeout = true;
          } else {
            this.logMonitorTimeout = false;
            this.terminal.write(response.data.msg + "\r\n");
          }
          break;
      }
    });
  }

  protected initialize(app: CurrentCollection): void {
    this.currCollection = app;
  }

  /**
   * 重新连接
   */
  reconnLogMonitor() {
    // this.msgSubject.next();
    this.sendIncrdeployChange();
    this.successNotify("已经成功发送重连");
  }

  private sendIncrdeployChange() {
    this.msgSubject.next(new WSMessage("incrdeploy-change"));
  }
}
