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

import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import parser from 'cron-parser';

@Component({
  selector: 'cron-expression-preview',
  template: `
    <div *ngIf="cronExpression && isValid">
      <nz-divider nzText="未来执行时间预览" nzOrientation="left"></nz-divider>
      <nz-list nzSize="small" [nzDataSource]="nextExecutionTimes" nzBordered>
        <nz-list-item *ngFor="let time of nextExecutionTimes; let i = index">
          <span nz-typography>
            <span nz-text nzType="secondary">第 {{i + 1}} 次:</span>
            <span nz-text nzStrong style="margin-left: 8px;">{{time}}</span>
          </span>
        </nz-list-item>
      </nz-list>
    </div>
    <div *ngIf="cronExpression && !isValid">
      <nz-alert
        nzType="error"
        nzMessage="无法解析 Cron 表达式"
        [nzDescription]="errorMessage"
        nzShowIcon>
      </nz-alert>
    </div>
  `
})
export class CronExpressionPreviewComponent implements OnChanges {
  @Input() cronExpression: string = '';

  nextExecutionTimes: string[] = [];
  isValid: boolean = false;
  errorMessage: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cronExpression']) {
      this.updatePreview();
    }
  }

  private updatePreview(): void {
    this.nextExecutionTimes = [];
    this.isValid = false;
    this.errorMessage = '';

    if (!this.cronExpression || this.cronExpression.trim() === '') {
      return;
    }

    try {
      const interval = parser.parse(this.cronExpression.trim());

      // 计算未来 5 次执行时间
      for (let i = 0; i < 5; i++) {
        const next = interval.next();
        this.nextExecutionTimes.push(this.formatDate(next.toDate()));
      }

      this.isValid = true;
    } catch (err: any) {
      this.isValid = false;
      this.errorMessage = err.message || '未知错误';
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
}