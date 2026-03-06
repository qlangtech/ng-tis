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

import {Component, EventEmitter, forwardRef, Input, Output} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import parser from 'cron-parser';

interface CronPreset {
  label: string;
  value: string;
  description: string;
}

@Component({
  selector: 'cron-expression-input',
  template: `
      <div>
          <nz-form-item>
              <nz-form-label [nzSpan]="labelSpan" nzRequired>Cron 表达式</nz-form-label>
              <nz-form-control [nzSpan]="controlSpan" [nzValidateStatus]="validateStatus" [nzErrorTip]="errorTip">
                  <input
                          nz-input
                          [(ngModel)]="cronValue"
                          (ngModelChange)="onInputChange($event)"
                          placeholder="例如: 0 0 2 * * ? (每天凌晨2点执行)"
                          [disabled]="disabled"
                  />
                  <div style="margin-top: 8px;">
                      <span nz-typography nzType="secondary">快捷选项: </span>
                      <nz-space>
                          <ng-container *ngFor="let preset of presets">
                              <button
                                      *nzSpaceItem

                                      nz-button
                                      nzType="link"
                                      nzSize="small"
                                      (click)="applyPreset(preset)"
                                      [disabled]="disabled"
                                      nz-tooltip
                                      [nzTooltipTitle]="preset.description"
                              >
                                  {{preset.label}}
                              </button>
                          </ng-container>
                      </nz-space>
                  </div>
              </nz-form-control>
          </nz-form-item>
      </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CronExpressionInputComponent),
      multi: true
    }
  ]
})
export class CronExpressionInputComponent implements ControlValueAccessor {
  @Input() labelSpan: number = 4;
  @Input() controlSpan: number = 20;
  @Output() validChange = new EventEmitter<boolean>();

  cronValue: string = '';
  disabled: boolean = false;
  validateStatus: 'success' | 'error' | '' = '';
  errorTip: string = '';

  presets: CronPreset[] = [
    {label: '每分钟', value: '0 * * * * ?', description: '每分钟执行一次'},
    {label: '每小时', value: '0 0 * * * ?', description: '每小时整点执行'},
    {label: '每天凌晨2点', value: '0 0 2 * * ?', description: '每天凌晨2点执行'},
    {label: '每周一凌晨2点', value: '0 0 2 ? * MON', description: '每周一凌晨2点执行'},
    {label: '每月1号凌晨2点', value: '0 0 2 1 * ?', description: '每月1号凌晨2点执行'}
  ];

  private onChange: (value: string) => void = () => {
  };
  private onTouched: () => void = () => {
  };

  writeValue(value: string): void {
    this.cronValue = value || '';
    this.validateCron();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInputChange(value: string): void {
    this.cronValue = value;
    this.validateCron();
    this.onChange(value);
    this.onTouched();
  }

  applyPreset(preset: CronPreset): void {
    this.cronValue = preset.value;
    this.validateCron();
    this.onChange(this.cronValue);
    this.onTouched();
  }

  private validateCron(): void {
    if (!this.cronValue || this.cronValue.trim() === '') {
      this.validateStatus = '';
      this.errorTip = '';
      this.validChange.emit(false);
      return;
    }

    try {
      parser.parse(this.cronValue.trim());
      this.validateStatus = 'success';
      this.errorTip = '';
      this.validChange.emit(true);
    } catch (err: any) {
      this.validateStatus = 'error';
      this.errorTip = err.message || 'Cron 表达式格式错误';
      this.validChange.emit(false);
    }
  }
}
