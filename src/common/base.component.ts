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

import {Injectable, OnDestroy} from '@angular/core';
import { Subject } from 'rxjs';

/**
 * 基础组件类，提供统一的订阅管理和内存泄露防护
 * 所有需要处理订阅的组件都应该继承此类
 */
@Injectable()
export abstract class BaseComponent implements OnDestroy {
  /**
   * 用于管理组件订阅的Subject
   * 组件销毁时会自动取消所有订阅
   */
  protected readonly destroy$ = new Subject<void>();

  /**
   * 组件销毁时的清理逻辑
   * 自动取消所有通过takeUntil(this.destroy$)管理的订阅
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
