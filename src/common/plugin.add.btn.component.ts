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


import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from "@angular/core";
import {Descriptor} from "./tis.plugin";
import {BasicFormComponent} from "./basic.form.component";
import {TISService} from "./tis.service";
import {NzDrawerService} from "ng-zorro-antd/drawer";
import {PluginManageComponent} from "../base/plugin.manage.component";
import {NzButtonSize} from "ng-zorro-antd/button/button.component";
import {PluginsComponent} from "./plugins.component";

@Component({
  selector: 'tis-plugin-add-btn',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `

    <ng-container [ngSwitch]="this.hasPrimaryBtnClickObservers || this.descriptors.length> 0 ">
      <ng-container *ngSwitchCase="true">

        <button [style]="btnStyle" nz-button nz-dropdown
                [nzType]="this.hasPrimaryBtnClickObservers? 'primary':'default'"
                (click)="this.primaryBtnClick.emit()" [nzSize]="btnSize" [nzDropdownMenu]="this.disabled?null:menu"
                [disabled]="this.disabled || this.formDisabled">
          <ng-content></ng-content>
        </button>
        <nz-dropdown-menu  #menu="nzDropdownMenu">
          <ul nz-menu>
            <li nz-menu-item *ngFor="let d of descriptors" (click)="addNewPluginItem(d)">
              <a href="javascript:void(0)"><span *ngIf="d.supportIcon" nz-icon [nzType]="d.endtype"
                                                 nzTheme="outline"></span> {{d.displayName}}</a>
            </li>
            <li nz-menu-divider></li>
            <li nz-menu-item (click)="addNewPlugin()">
              <a href="javascript:void(0)"><i nz-icon nzType="api" nzTheme="outline"></i>添加</a>
            </li>
          </ul>
        </nz-dropdown-menu>
      </ng-container>
      <ng-container *ngSwitchCase="false">
        <button [style]="btnStyle" nz-button nzType="default" [nzSize]="'small'" (click)="addNewPlugin()"
                [disabled]="this.disabled || this.formDisabled">
          <i nz-icon nzType="api" nzTheme="outline"></i>添加
        </button>
      </ng-container>
    </ng-container>

  `
})
export class PluginAddBtnComponent extends BasicFormComponent implements OnInit {
  @Input()
  descriptors: Array<Descriptor> = [];

  @Input()
  initDescriptors = false;


  @Input()
  extendPoint: string | Array<string>;

  @Input()
  endType: string;

  @Input()
  filterTags: Array<string>;

  @Input()
  disabled: boolean;

  @Input()
  btnSize: NzButtonSize = 'default';

  @Input()
  btnStyle = '';

  @Output()
  addPlugin = new EventEmitter<Descriptor>();

  @Output()
  primaryBtnClick = new EventEmitter<void>();

  @Output()
  afterPluginAddClose = new EventEmitter<Descriptor>();


  constructor(tisService: TISService
    , private drawerService: NzDrawerService, private cd: ChangeDetectorRef) {
    super(tisService);
    this.formDisabled = true;
  }

  addNewPluginItem(desc: Descriptor) {
    this.addPlugin.emit(desc);
  }

  get hasPrimaryBtnClickObservers(): boolean {
    return this.primaryBtnClick.observers.length > 0;
  }


  ngOnInit(): void {

    if (this.descriptors.length < 1 && this.initDescriptors) {
      PluginsComponent.getAllDesc(this, this.extendPoint as string, this.endType)
        .then((descs) => {

          this.descriptors = Array.from(descs.values());
          this.cd.detectChanges();
          //   console.log([this.descriptors,this.initDescriptors,this.extendPoint,this.descriptors]);
        }).finally(() => {
        this.formDisabled = false;
      });
    } else {
      this.formDisabled = false;
    }
  }

  addNewPlugin() {
    // console.log(this.extendPoint);
    const drawerRef = PluginManageComponent.openPluginManage(this.drawerService, this.extendPoint, this.endType, this.filterTags);

    drawerRef.afterClose.subscribe(() => {
      this.afterPluginAddClose.emit();
    })
  }


}
