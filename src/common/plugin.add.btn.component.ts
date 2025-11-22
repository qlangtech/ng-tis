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
  AfterContentInit, AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, ContentChild, ContentChildren, Directive,
  EventEmitter,
  Input,
  OnInit,
  Output, QueryList, TemplateRef, ViewContainerRef
} from "@angular/core";
import {Descriptor, SavePluginEvent} from "./tis.plugin";
import {BasicFormComponent} from "./basic.form.component";
import {TISService} from "./tis.service";
import {NzDrawerService} from "ng-zorro-antd/drawer";
import {PluginManageComponent} from "../base/plugin.manage.component";
import {NzButtonSize} from "ng-zorro-antd/button";
import {PluginsComponent} from "./plugins.component";
import {NzModalService} from "ng-zorro-antd/modal";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {TisColumn} from "./pagination.component";


@Directive({
  selector: 'tis-plugin-add-btn-extract-item',
})
export class TisPluginAddBtnExtractLiItem implements AfterContentInit, AfterViewInit {

  @Output()
  public click = new EventEmitter<void>();

  @Input("nz-icon")
  nzIcon: string;
  @Input("li-name")
  liName: string;

  ngAfterContentInit(): void {

  }

  ngAfterViewInit(): void {

  }
}


@Component({
  selector: 'tis-plugin-add-btn',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `

    <ng-container
      [ngSwitch]="this.hasPrimaryBtnClickObservers|| lazyInitDescriptors || this.descriptors.length> 0 || extractLiItems.length> 0  ">
      <ng-container *ngSwitchCase="true">

        <nz-button-group>
          <button nz-button [style]="btnStyle"
                  [nzType]="this.hasPrimaryBtnClickObservers? 'primary':'default'"

                  (mouseenter)="lazyInitialize()"
                  (click)="this.primaryBtnClick.emit()" [nzSize]="btnSize"
                  [disabled]="this.disabled || this.formDisabled">
            <ng-content></ng-content>
          </button>
          <button [disabled]="this.disabled || this.formDisabled" nz-button nz-dropdown
                  (mouseenter)="lazyInitialize()"
                  [nzType]="this.hasPrimaryBtnClickObservers? 'primary':'default'" [nzSize]="btnSize"
                  [nzDropdownMenu]="this.disabled?null:menu1" nzPlacement="bottomRight">
            <span nz-icon nzType="down"></span>
          </button>
        </nz-button-group>

        <nz-dropdown-menu #menu1="nzDropdownMenu">
          <ul nz-menu>
            <ng-container *ngIf="extractLiItems.length> 0 ">
              <li nz-menu-item *ngFor="let li of extractLiItems" (click)="li.click.emit()">
                <i nz-icon
                   [nzType]="li.nzIcon"
                   nzTheme="outline"></i>{{li.liName}}
              </li>
              <li nz-menu-divider></li>
            </ng-container>


            <li nz-menu-item *ngFor="let d of descriptors" (click)="addNewPluginItem(d)">
              <a href="javascript:void(0)"><span *ngIf="d.supportIcon" nz-icon [nzType]="d.endtype"
                                                 nzTheme="outline"></span> {{d.displayName}}</a>
            </li>
            <ng-container *ngIf="enableAddplugin">
              <li nz-menu-divider></li>
              <li nz-menu-item (click)="addNewPlugin()">
                <a href="javascript:void(0)"><i nz-icon nzType="api" nzTheme="outline"></i>添加</a>
              </li>
            </ng-container>
          </ul>
        </nz-dropdown-menu>

      </ng-container>
      <ng-container *ngSwitchCase="false">
        <button *ngIf="enableAddplugin" [style]="btnStyle" nz-button nzType="default" [nzSize]="'small'"
                (click)="addNewPlugin()"
                [disabled]="this.disabled || this.formDisabled">
          <i nz-icon nzType="api" nzTheme="outline"></i>添加
        </button>
      </ng-container>
    </ng-container>


  `
})
export class PluginAddBtnComponent extends BasicFormComponent implements OnInit {

  /**
   * 额外的下拉列表item
   */
  @ContentChildren(TisPluginAddBtnExtractLiItem) extractLiItems: QueryList<TisPluginAddBtnExtractLiItem>;

  @Input()
  descriptors: Array<Descriptor> = [];


  @Input()
  enableAddplugin = true;
  @Input()
  appname: string;

  @Input()
  initDescriptors = false;

  @Input()
  lazyInitDescriptors = false;


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
    , private drawerService: NzDrawerService, notification: NzNotificationService, private cd: ChangeDetectorRef) {
    super(tisService, null, notification);
    this.formDisabled = true;
  }

  addNewPluginItem(desc: Descriptor) {
    this.addPlugin.emit(desc);
  }

  get hasPrimaryBtnClickObservers(): boolean {
    return this.primaryBtnClick.observers.length > 0;
  }


  ngOnInit(): void {
    this.startInitDescriptors(!this.lazyInitDescriptors);
  }

  /**
   *
   * @param shallExec
   * @param forceInit 是否要强制重新刷新一下可选插件列表，例如，从仓库中新添加了一个插件就要刷新一下
   * @private
   */
  private startInitDescriptors(shallExec: boolean, forceInit: boolean = false): Promise<Array<Descriptor>> {

    return new Promise<Array<Descriptor>>((resolve, reject) => {
      if (forceInit || (this.descriptors.length < 1 && this.initDescriptors)) {
        if (shallExec) {
          let event = new SavePluginEvent();
          if (this.appname) {
            event.overwriteHttpHeaderOfAppName(this.appname);
          }
          PluginsComponent.getAllDesc(this, this.extendPoint as string, this.endType, event)
            .then((descs) => {

              this.descriptors = Array.from(descs.values());
              resolve(this.descriptors);
              this.cd.detectChanges();

            }).finally(() => {
            this.formDisabled = false;
          });
        } else {
          this.formDisabled = false;
        }
      } else {
        this.formDisabled = false;
      }
    });

  }

  lazyInitialize() {
    this.startInitDescriptors(this.lazyInitDescriptors);
  }

  addNewPlugin() {
    // console.log(this.extendPoint);
    const drawerRef = PluginManageComponent.openPluginManage(this.drawerService, this.extendPoint, this.endType, this.filterTags);

    drawerRef.afterClose.subscribe(() => {
      if (this.lazyInitDescriptors) {
        this.startInitDescriptors(true, true).then((_) => {
          this.successNotify("已经成功更新可选功能列表，请继续使用");
        });
      }
      this.afterPluginAddClose.emit();
    })
  }


}



