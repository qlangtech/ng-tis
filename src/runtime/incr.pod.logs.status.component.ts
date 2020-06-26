import {AfterContentInit, AfterViewInit, Component, ViewChild} from "@angular/core";
import {TISService} from "../service/tis.service";
import {AppFormComponent, CurrentCollection} from "../common/basic.form.component";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ActivatedRoute} from "@angular/router";
import {NgTerminal} from "ng-terminal";


@Component({
  selector: 'incr-pod-logs-status',
  template: `
      <div style="height: 800px">
          <ng-terminal #term></ng-terminal>
      </div>
  `,
  styles: [
      `

    `
  ]
})
export class IncrPodLogsStatusComponent extends AppFormComponent implements AfterContentInit, AfterViewInit {
  private currCollection: CurrentCollection;
  @ViewChild('term', {static: true}) terminal: NgTerminal;
  constructor(tisService: TISService, route: ActivatedRoute, modalService: NgbModal) {
    super(tisService, route, modalService);
  }


  ngAfterViewInit(): void {

    // 服务端生成了taskid
    this.tisService.wsconnect('ws://' + window.location.host
      + '/tjs/download/logfeedback?collection=' + this.currCollection.appName + "&logtype=incrdeploy-change")
      .subscribe((response: MessageEvent): void => {
        let msg = JSON.parse(response.data);
        this.terminal.write(msg.data + "\r\n");
      });

  }

  ngAfterContentInit(): void {
  }

  protected initialize(app: CurrentCollection): void {
    this.currCollection = app;
  }

}
