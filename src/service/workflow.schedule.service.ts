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

import {Injectable} from '@angular/core';
import {TISService} from '../common/tis.service';

export interface WorkflowScheduleConfig {
  id?: number;
  name: string;
  scheduleCron?: string;
  enableSchedule: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class WorkflowScheduleService {

  constructor(private tisService: TISService) {
  }

  /**
   * 保存工作流调度配置
   */
  saveScheduleConfig(config: WorkflowScheduleConfig): Promise<any> {
    const params: any = {
      action: 'workflow_action',
      emethod: 'doSaveWorkflow',
      name: config.name,
      enableSchedule: config.enableSchedule
    };

    if (config.id) {
      params.id = config.id;
    }

    if (config.scheduleCron) {
      params.scheduleCron = config.scheduleCron;
    }

    return this.tisService.httpPost('/coredefine/corenodemanage.ajax', params);
  }

  /**
   * 加载工作流调度配置
   */
  loadScheduleConfig(workflowId: number): Promise<any> {
    return this.tisService.httpPost('/coredefine/corenodemanage.ajax',
      'action=workflow_action&emethod=doLoadWorkflow&id=' + workflowId);
  }

  /**
   * 验证 Cron 表达式
   */
  validateCronExpression(cronExpression: string): Promise<any> {
    return this.tisService.httpPost('/coredefine/corenodemanage.ajax',
      'action=workflow_action&emethod=validateCron&cron=' + encodeURIComponent(cronExpression));
  }
}