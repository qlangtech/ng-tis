import {Component} from '@angular/core';
import {TISService} from '../service/tis.service';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {AddGlobalParamComponent} from './global.add.param';
import {GlobalUpdateParamComponent} from './global.update.param';

// 全局配置文件
@Component({
  // templateUrl: '/runtime/config_file_parameters.htm'
  template: `
    <tis-page-header title="全局参数">
        <button nz-button nzType="primary" (click)="openParametersAddDialog()">
            <i class="fa fa-plus" aria-hidden="true"></i>添加
        </button>
    </tis-page-header>
    <table class="table">
      <thead>
      <tr>
        <th>名称</th>
        <th>值</th>
      </tr>
      </thead>
      <tbody>
      <tr>
        <td width="200px;">
          test2
        </td>
        <td>
          <a href="javascript:void(0)" (click)="openSetParamDialog(39)">设置</a>
          <strong style="display:inline-block;width:4em">test24</strong> &nbsp;
        </td>
      </tr>
      <tr>
        <td width="200px;">
          test
        </td>
        <td>
          <a href="javascript:void(0)" (click)="openSetParamDialog(38)">设置</a>
          <strong style="display:inline-block;width:4em"></strong> &nbsp;
        </td>
      </tr>
      <tr>
        <td width="200px;">
          log_source_address
        </td>
        <td>
          <a href="javascript:void(0)" (click)="openSetParamDialog(37)">设置</a>
          <strong style="display:inline-block;width:4em">10.1.21.48</strong> &nbsp;
        </td>
      </tr>
      <tr>
        <td width="200px;">
          log_flume_agent
        </td>
        <td>
          <a href="javascript:void(0)" (click)="openSetParamDialog(36)">设置</a>
          <strong style="display:inline-block;width:4em">10.1.21.48:41414</strong> &nbsp;
        </td>
      </tr>
      <tr>
        <td width="200px;">
          max_db_dump_thread_count
        </td>
        <td>
          <a href="javascript:void(0)" (click)="openSetParamDialog(35)">设置</a>
          <strong style="display:inline-block;width:4em">1</strong> &nbsp;
        </td>
      </tr>
      <tr>
        <td width="200px;">
          hivehost
        </td>
        <td>
          <a href="javascript:void(0)" (click)="openSetParamDialog(34)">设置</a>
          <strong style="display:inline-block;width:4em">10.1.7.25:10000</strong> &nbsp;
        </td>
      </tr>
      <tr>
        <td width="200px;">
          jobtracker_transserver
        </td>
        <td>
          <a href="javascript:void(0)" (click)="openSetParamDialog(33)">设置</a>
          <strong style="display:inline-block;width:4em">10.1.7.72:8849</strong> &nbsp;
        </td>
      </tr>
      <tr>
        <td width="200px;">
          jobtracker_rpcserver
        </td>
        <td>
          <a href="javascript:void(0)" (click)="openSetParamDialog(32)">设置</a>
          <strong style="display:inline-block;width:4em">10.1.7.72:8848</strong> &nbsp;
        </td>
      </tr>
      <tr>
        <td width="200px;">
          terminator_host_address
        </td>
        <td>
          <a href="javascript:void(0)" (click)="openSetParamDialog(31)">设置</a>
          <strong style="display:inline-block;width:4em">http://10.1.5.214:8080</strong> &nbsp;
        </td>
      </tr>
      <tr>
        <td width="200px;">
          runenvironment
        </td>
        <td>
          <a href="javascript:void(0)" (click)="openSetParamDialog(30)">设置</a>
          <strong style="display:inline-block;width:4em">daily</strong> &nbsp;
        </td>
      </tr>
      <tr>
        <td width="200px;">
          hdfsaddress
        </td>
        <td>
          <a href="javascript:void(0)" (click)="openSetParamDialog(29)">设置</a>
          <strong style="display:inline-block;width:4em">hdfs://daily-cdh</strong> &nbsp;
        </td>
      </tr>
      <tr>
        <td width="200px;">
          zkaddress
        </td>
        <td>
          <a href="javascript:void(0)" (click)="openSetParamDialog(28)">设置</a>
          <strong style="display:inline-block;width:4em">
            zk1.2dfire-daily.com:2181,zk2.2dfire-daily.com:2181,zk3.2dfire-daily.com:2181/tis/cloud</strong>
          &nbsp;
        </td>
      </tr>
      </tbody>
    </table>
  `
})
export class GlobalParamsComponent {
  constructor(private tisService: TISService, private modalService: NgbModal) {
    // this.tisService.setAppSelectable(true);
  }


  // 打开添加参数对话框
  public openParametersAddDialog(): void {

    this.modalService.open(AddGlobalParamComponent, {size: 'lg', backdrop: 'static'});
  }

  public openSetParamDialog(rpid: number): void {
    const modalRef: NgbModalRef = this.modalService.open(GlobalUpdateParamComponent, {size: 'lg', backdrop: 'static'});
    modalRef.componentInstance.rpid = rpid;
  }


}
