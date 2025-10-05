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

import { Component, Input } from '@angular/core';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

@Component({
  selector: 'tis-loading-state',
  template: `
    <!-- 加载中状态 -->
    <div *ngIf="state === 'loading'" class="loading-container">
      <nz-spin [nzSpinning]="true" [nzTip]="loadingText">
        <div class="loading-content"></div>
      </nz-spin>
    </div>

    <!-- 错误状态 -->
    <div *ngIf="state === 'error'" class="error-container">
      <nz-result
        nzStatus="error"
        [nzTitle]="errorTitle"
        [nzSubTitle]="errorMessage">
        <div nz-result-extra>
          <button nz-button nzType="primary" (click)="onRetry()" *ngIf="showRetry">
            重试
          </button>
        </div>
      </nz-result>
    </div>

    <!-- 成功状态或空闲状态显示内容 -->
    <div *ngIf="state === 'success' || state === 'idle'">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 200px;
    }

    .loading-content {
      width: 100%;
      height: 200px;
    }

    .error-container {
      padding: 20px;
      text-align: center;
    }
  `]
})
export class LoadingStateComponent {
  @Input() state: LoadingState = 'idle';
  @Input() loadingText = '加载中...';
  @Input() errorTitle = '加载失败';
  @Input() errorMessage = '请求发生错误，请稍后重试';
  @Input() showRetry = true;

  onRetry() {
    // 子组件可以监听这个事件来处理重试逻辑
    this.state = 'loading';
  }
}