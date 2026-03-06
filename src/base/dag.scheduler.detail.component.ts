import {Component, OnInit} from '@angular/core';
import {DAGMonitorService, ScheduleEntryInfo} from '../service/dag.monitor.service';

@Component({
  selector: 'dag-scheduler-detail',
  template: `
    <tis-page-header [title]="'DAG定时任务'" [showBreadcrumb]="true"
                     [breadcrumb]="['Akka集群监控', '/base/akka-monitor']">
    </tis-page-header>

    <nz-spin [nzSpinning]="loading">
      <nz-card nzTitle="定时任务列表">
        <nz-table #scheduleTable [nzData]="schedules" nzSize="small"
                  [nzShowPagination]="schedules.length > 10" nzBordered>
          <thead>
          <tr>
            <th>Pipeline名称</th>
            <th>Crontab表达式</th>
            <th>状态</th>
            <th>注册时间</th>
            <th>最后触发时间</th>
            <th>下次触发时间</th>
          </tr>
          </thead>
          <tbody>
          <tr *ngFor="let item of scheduleTable.data">
            <td>{{item.pipelineName}}</td>
            <td><code>{{item.cronExpression}}</code></td>
            <td>
              <nz-tag *ngIf="item.turnOn" nzColor="success">已启用</nz-tag>
              <nz-tag *ngIf="!item.turnOn" nzColor="error">已禁用</nz-tag>
            </td>
            <td>{{item.registerTime > 0 ? (item.registerTime | date:'yyyy-MM-dd HH:mm:ss') : '-'}}</td>
            <td>{{item.lastTriggerTime > 0 ? (item.lastTriggerTime | date:'yyyy-MM-dd HH:mm:ss') : '-'}}</td>
            <td>{{item.nextFireTime > 0 ? (item.nextFireTime | date:'yyyy-MM-dd HH:mm:ss') : '-'}}</td>
          </tr>
          <tr *ngIf="schedules.length === 0">
            <td colspan="6" style="text-align:center;color:#999">暂无定时任务</td>
          </tr>
          </tbody>
        </nz-table>
      </nz-card>
    </nz-spin>
  `,
  styles: [`
    :host {
      display: block;
      padding: 16px;
    }
  `]
})
export class DagSchedulerDetailComponent implements OnInit {

  schedules: ScheduleEntryInfo[] = [];
  loading = true;

  constructor(private dagMonitorService: DAGMonitorService) {
  }

  ngOnInit(): void {
    this.dagMonitorService.queryDAGSchedulerDetail().then(result => {
      this.loading = false;
      if (result.success) {
        let detail = result.bizresult as any;
        this.schedules = detail?.schedules || [];
      }
    }).catch(() => {
      this.loading = false;
    });
  }
}