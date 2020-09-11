import {Component} from '@angular/core';
import {TISService} from "../service/tis.service";

import {BasicFormComponent} from "../common/basic.form.component";
import {NzModalService} from "ng-zorro-antd";

// 这个类专门负责router
@Component({
  template: `
      <fieldset>
          <div class="modal-header">
              <h4 class="modal-title">触发全量索引构建</h4>
              <button type="button" class="close" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
              </button>
          </div>
          <div class="modal-body">
              <tis-msg [result]="result"></tis-msg>
              <style type="text/css"><!--
              #dumpcontrolblock em {
                  background-color: yellow;
                  padding: 3px;
                  color: red;
              }

              -->
              </style>
              <div id="dumpcontrolblock">


                  <div class="msg" id="triggerform"></div>
                  <input type="hidden" name="action" value="core_action"/>
                  <fieldset>
                      <legend>触发从客户端导入的全量</legend>
                      <p>
                          <button name="event_submit_do_trigger_dump"
                                  style="width:300px;height:30px;" onclick="btnTriggerFullClick()">开始执行
                          </button>
                      </p>
                  </fieldset>

                  <input type="hidden" name="action" value="core_action"/>
                  <fieldset>
                      <legend>同步某个时间点的全量索引数据</legend>
                      <p>
                          <span>userPoint:</span>
                          <input type="text" id="iptUserPoint1" name="userpoint" [(ngModel)]="iptUserPoint1"/><br/>
                          <em>必填，格式admin#yyyyMMddHHmmss</em>
                      </p>
                      <p>
                          <button
                                  name="event_submit_do_trigger_syn_index_file"
                                  (click)="btnTriggerLoadHistoryIndex()"
                                  style="width:300px;height:30px;">开始执行
                          </button>
                      </p>
                  </fieldset>
                  <input type="hidden" name="action" value="core_action"/>
                  <fieldset>
                      <legend>提交HDFS某个时间点的文件到Dump层进行DUMP</legend>
                      <p>
                          <span>userPoint:</span> <input type="text" id="iptUserPoint2"
                                                         [(ngModel)]="iptUserPoint2" name="userpoint"/><br/>
                          <em>必填，格式admin#yyyyMMddHHmmss</em>
                      </p>
                      <p>
                          <button
                                  name="event_submit_do_trigger_full_dump_file"
                                  style="width:300px;height:30px;"
                                  (click)="btnTriggerLoadHistoryDumpFile()">开始执行
                          </button>
                      </p>
                  </fieldset>
              </div>
          </div>
      </fieldset>
  `
})
export class TriggerDumpComponent extends BasicFormComponent {
  iptUserPoint2 = '';
  iptUserPoint1 = '';

  constructor(tisService: TISService, modalService: NzModalService, ) {
    super(tisService, modalService);
  }

  // 触发全量构建
  public btnTriggerFullClick(): void {
    this.tisService.httpPost('/coredefine/corenodemanage.ajax'
      , "event_submit_do_trigger_dump=y&action=core_action").then(result => result);
  }

  public btnTriggerLoadHistoryIndex(): void {
    this.tisService.httpPost('/coredefine/corenodemanage.ajax'
      , "event_submit_do_trigger_syn_index_file=y&action=core_action&userpoint=" + this.iptUserPoint1).then(result => result);
  }

  public btnTriggerLoadHistoryDumpFile(): void {
    this.tisService.httpPost('/coredefine/corenodemanage.ajax'
      , "event_submit_do_trigger_full_dump_file=y&action=core_action&userpoint=" + this.iptUserPoint2).then(result => result);
  }

}
