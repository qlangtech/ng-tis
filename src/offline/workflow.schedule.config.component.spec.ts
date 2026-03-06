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

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {WorkflowScheduleConfigComponent} from './workflow.schedule.config.component';
import {FormsModule} from '@angular/forms';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {NzNotificationService} from 'ng-zorro-antd/notification';
import {WorkflowScheduleService} from '../service/workflow.schedule.service';
import {TISService} from '../common/tis.service';

describe('WorkflowScheduleConfigComponent', () => {
  let component: WorkflowScheduleConfigComponent;
  let fixture: ComponentFixture<WorkflowScheduleConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WorkflowScheduleConfigComponent],
      imports: [
        FormsModule,
        RouterTestingModule,
        HttpClientTestingModule
      ],
      providers: [
        NzNotificationService,
        WorkflowScheduleService,
        TISService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WorkflowScheduleConfigComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate cron expression', () => {
    component.config.scheduleCron = '0 0 2 * * ?';
    component.onCronValidChange(true);
    expect(component.cronValid).toBe(true);
  });

  it('should not allow save with invalid cron when schedule is enabled', () => {
    component.config.enableSchedule = true;
    component.config.scheduleCron = '';
    component.cronValid = false;
    expect(component.canSave()).toBe(false);
  });

  it('should allow save when schedule is disabled', () => {
    component.config.enableSchedule = false;
    expect(component.canSave()).toBe(true);
  });
});