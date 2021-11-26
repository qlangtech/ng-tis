/**
 * Copyright (c) 2020 QingLang, Inc. <baisui@qlangtech.com>
 * <p>
 *   This program is free software: you can use, redistribute, and/or modify
 *   it under the terms of the GNU Affero General Public License, version 3
 *   or later ("AGPL"), as published by the Free Software Foundation.
 * <p>
 *  This program is distributed in the hope that it will be useful, but WITHOUT
 *  ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 *   FITNESS FOR A PARTICULAR PURPOSE.
 * <p>
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program. If not, see <http://www.gnu.org/licenses/>.
 */


import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from "@angular/core";
import {Descriptor} from "./tis.plugin";
import {BasicFormComponent} from "./basic.form.component";
import {TISService} from "./tis.service";
import {NzDrawerRef, NzDrawerService} from "ng-zorro-antd/drawer";
import {PluginManageComponent} from "../base/plugin.manage.component";
import {NzButtonSize} from "ng-zorro-antd/button/button.component";

@Component({
  selector: 'tis-plugin-add-btn',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
      <ng-container [ngSwitch]="this.descriptors.length> 0 ">
          <ng-container *ngSwitchCase="true">
              <button [style]="btnStyle" nz-button nz-dropdown [nzSize]="btnSize" [nzDropdownMenu]="menu" [disabled]="this.disabled">
                  <ng-content></ng-content>
              </button>
              <nz-dropdown-menu #menu="nzDropdownMenu">
                  <ul nz-menu>
                      <li nz-menu-item *ngFor="let d of descriptors">
                          <a href="javascript:void(0)" (click)="addNewPluginItem(d)">{{d.displayName}}</a>
                      </li>
                      <li nz-menu-divider></li>
                      <li nz-menu-item>
                          <a href="javascript:void(0)" (click)="addNewPlugin()"><i nz-icon nzType="api" nzTheme="outline"></i>添加</a>
                      </li>
                  </ul>
              </nz-dropdown-menu>
          </ng-container>
          <ng-container *ngSwitchCase="false">
              <button [style]="btnStyle" nz-button nzType="default" [nzSize]="'small'" (click)="addNewPlugin()" [disabled]="this.disabled">
                  <i nz-icon nzType="api" nzTheme="outline"></i>添加
              </button>
          </ng-container>
      </ng-container>

  `
})
export class PluginAddBtnComponent extends BasicFormComponent {
  @Input()
  descriptors: Array<Descriptor> = [];
  @Input()
  extendPoint: string | Array<String>;
  @Input()
  disabled: boolean;

  @Input()
  btnSize: NzButtonSize = 'default';

  @Input()
  btnStyle = '';

  @Output()
  addPlugin = new EventEmitter<Descriptor>();

  @Output()
  afterPluginAddClose = new EventEmitter<Descriptor>();



  constructor(tisService: TISService
    , private drawerService: NzDrawerService) {
    super(tisService);
  }

  addNewPluginItem(desc: Descriptor) {
    this.addPlugin.emit(desc);
  }

  addNewPlugin() {
    const drawerRef = PluginManageComponent.openPluginManage(this.drawerService, this.extendPoint);

    drawerRef.afterClose.subscribe(() => {
      this.afterPluginAddClose.emit();
    })
  }


}
