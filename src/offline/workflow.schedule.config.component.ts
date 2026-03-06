/**
 *   Licensed to the Apache Software Foundation (ASF) under one
 *   or more contributor license agreements.  See the NOTICE file
 *   distributed with this work for additional information
 *   regarding copyright ownership.  The ASF licenses this file
 *   to you under the Apache License, Version 2.0 (the
 *   "License"); you may not use this file except in compliance
 *   with the License.  You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NzNotificationService} from 'ng-zorro-antd/notification';
import {WorkflowScheduleService, WorkflowScheduleConfig} from '../service/workflow.schedule.service';
import {TISService} from '../common/tis.service';

@Component({
  selector: 'workflow-schedule-config',
  template: `
    <nz-spin [nzSpinning]="loading">
      <div style="padding: 24px; background: #fff;">
        <nz-page-header
          nzTitle="工作流调度配置"
          [nzSubtitle]="workflowName"
          (nzBack)="goBack()"
          nzBackIcon
        >
        </nz-page-header>

        <nz-divider></nz-divider>

        <form nz-form nzLayout="horizontal">
          <!-- 启用定时调度开关 -->
          <nz-form-item>
            <nz-form-label [nzSpan]="4" nzRequired>启用定时调度</nz-form-label>
            <nz-form-control [nzSpan]="20">
              <nz-switch
                [(ngModel)]="config.enableSchedule"
                [nzCheckedChildren]="checkedTemplate"
                [nzUnCheckedChildren]="unCheckedTemplate"
              ></nz-switch>
              <ng-template #checkedTemplate><span nz-icon nzType="check"></span></ng-template>
              <ng-template #unCheckedTemplate><span nz-icon nzType="close"></span></ng-template>
              <div style="margin-top: 8px;">
                <span nz-typography nzType="secondary">
                  开启后，工作流将按照设定的 Cron 表达式自动执行
                </span>
              </div>
            </nz-form-control>
          </nz-form-item>

          <!-- Cron 表达式输入 -->
          <div *ngIf="config.enableSchedule">
            <cron-expression-input
              [(ngModel)]="config.scheduleCron"
              (validChange)="onCronValidChange($event)"
            ></cron-expression-input>

            <!-- Cron 表达式预览 -->
            <div style="margin-top: 16px;">
              <cron-expression-preview
                [cronExpression]="config.scheduleCron || ''"
              ></cron-expression-preview>
            </div>

            <!-- Cron 表达式说明 -->
            <nz-divider nzText="Cron 表达式格式说明" nzOrientation="left"></nz-divider>
            <nz-alert
              nzType="info"
              nzShowIcon
              [nzMessage]="cronFormatMessage"
            ></nz-alert>
            <ng-template #cronFormatMessage>
              <div>
                <p><strong>Cron 表达式格式:</strong> 秒 分 时 日 月 周</p>
                <ul style="margin-bottom: 0;">
                  <li><code>*</code> - 任意值</li>
                  <li><code>?</code> - 不指定值（仅用于日和周）</li>
                  <li><code>-</code> - 范围，例如: 10-12</li>
                  <li><code>,</code> - 列举，例如: MON,WED,FRI</li>
                  <li><code>/</code> - 增量，例如: 0/15（每15分钟）</li>
                </ul>
                <p style="margin-top: 8px;"><strong>示例:</strong></p>
                <ul style="margin-bottom: 0;">
                  <li><code>0 0 2 * * ?</code> - 每天凌晨2点执行</li>
                  <li><code>0 0/30 * * * ?</code> - 每30分钟执行一次</li>
                  <li><code>0 0 2 ? * MON</code> - 每周一凌晨2点执行</li>
                  <li><code>0 0 2 1 * ?</code> - 每月1号凌晨2点执行</li>
                </ul>
              </div>
            </ng-template>
          </div>

          <!-- 操作按钮 -->
          <nz-form-item>
            <nz-form-control [nzSpan]="20" [nzOffset]="4">
              <button
                nz-button
                nzType="primary"
                (click)="saveConfig()"
                [nzLoading]="saving"
                [disabled]="!canSave()"
              >
                <span nz-icon nzType="save"></span>
                保存配置
              </button>
              <button
                nz-button
                style="margin-left: 8px;"
                (click)="goBack()"
              >
                取消
              </button>
            </nz-form-control>
          </nz-form-item>
        </form>
      </div>
    </nz-spin>
  `
})
export class WorkflowScheduleConfigComponent implements OnInit {
  workflowName: string = '';
  workflowId: number = 0;
  loading: boolean = false;
  saving: boolean = false;
  cronValid: boolean = false;

  config: WorkflowScheduleConfig = {
    name: '',
    enableSchedule: false,
    scheduleCron: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private scheduleService: WorkflowScheduleService,
    private notification: NzNotificationService,
    private tisService: TISService
  ) {
  }

  ngOnInit(): void {
    this.workflowName = this.route.snapshot.params['name'];
    if (!this.workflowName) {
      this.notification.error('错误', '工作流名称不能为空');
      this.goBack();
      return;
    }

    this.config.name = this.workflowName;
    this.loadConfig();
  }

  loadConfig(): void {
    this.loading = true;

    // 通过工作流名称获取工作流信息
    this.tisService.httpPost('/coredefine/corenodemanage.ajax',
      'action=workflow_action&emethod=doGetWorkflow&name=' + this.workflowName)
      .then((result) => {
        if (result.success) {
          const workflow = result.bizresult;
          this.workflowId = workflow.id;
          this.config.id = workflow.id;
          this.config.enableSchedule = workflow.enableSchedule || false;
          this.config.scheduleCron = workflow.scheduleCron || '';

          // 如果有 Cron 表达式，验证它
          if (this.config.scheduleCron) {
            this.cronValid = true;
          }
        } else {
          const errorMsg = Array.isArray(result.msg) ? result.msg.join(', ') : (result.msg || '加载工作流配置失败');
          this.notification.error('加载失败', errorMsg);
        }
      })
      .catch((error) => {
        this.notification.error('加载失败', '加载工作流配置时发生错误');
        console.error('Load workflow config error:', error);
      })
      .finally(() => {
        this.loading = false;
      });
  }

  onCronValidChange(valid: boolean): void {
    this.cronValid = valid;
  }

  canSave(): boolean {
    if (!this.config.enableSchedule) {
      return true;
    }
    return this.cronValid && !!this.config.scheduleCron;
  }

  saveConfig(): void {
    if (!this.canSave()) {
      this.notification.warning('验证失败', '请输入有效的 Cron 表达式');
      return;
    }

    this.saving = true;

    this.scheduleService.saveScheduleConfig(this.config)
      .then((result) => {
        if (result.success) {
          this.notification.success('保存成功', '工作流调度配置已保存');
          // 延迟返回，让用户看到成功提示
          setTimeout(() => {
            this.goBack();
          }, 1000);
        } else {
          const errorMsg = Array.isArray(result.msg) ? result.msg.join(', ') : (result.msg || '保存工作流调度配置失败');
          this.notification.error('保存失败', errorMsg);
        }
      })
      .catch((error) => {
        this.notification.error('保存失败', '保存工作流调度配置时发生错误');
        console.error('Save workflow schedule config error:', error);
      })
      .finally(() => {
        this.saving = false;
      });
  }

  goBack(): void {
    this.router.navigate(['/offline/wf']);
  }
}
