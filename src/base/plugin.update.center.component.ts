import {BasicFormComponent} from "../common/basic.form.component";
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output} from "@angular/core";
import {TISService} from "../common/tis.service";
import {NzModalService} from "ng-zorro-antd/modal";

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

@Component({
  selector: "update-center",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
      <nz-list nzItemLayout="vertical" [nzDataSource]="plugins">
          <ng-container *ngFor="let item of plugins">
              <nz-list-item *ngIf="item.type === 'InstallationJob'">
                  <nz-list-item-meta>
                      <nz-list-item-meta-title>
                          {{item.name}}
                          <ng-container [ngSwitch]="item.status.type">
                              <nz-tag *ngSwitchCase="'Success'" nzColor="success">
                                  <i nz-icon nzType="check-circle"></i>
                                  <span>success</span>
                              </nz-tag>
                              <nz-tag *ngSwitchCase="'Installing'" nzColor="processing">
                                  <i nz-icon nzType="sync" nzSpin></i>
                                  <span>Installing</span>
                              </nz-tag>
                              <nz-tag *ngSwitchCase="'Failure'" nzColor="error">
                                  <i nz-icon nzType="close-circle"></i>
                                  <span>Failure</span>
                              </nz-tag>
                              <nz-tag *ngSwitchCase="'Pending'" nzColor="warning">
                                  <i nz-icon nzType="coffee"></i>
                                  <span>Pending</span>
                              </nz-tag>
                          </ng-container>
                      </nz-list-item-meta-title>
                  </nz-list-item-meta>
                  <ng-container [ngSwitch]="item.status.type">
                      <div *ngSwitchCase="'Success'">
                      </div>
                      <div *ngSwitchCase="'Installing'">
                          <nz-progress nzStrokeLinecap="round" nzType="circle" [nzPercent]="item.status.percentage < 1 ? 1 : item.status.percentage"></nz-progress>
                      </div>
                      <pre *ngSwitchCase="'Failure'">{{item.status.problemStackTrace}}</pre>
                  </ng-container>
                  <nz-list-item-extra>
                  </nz-list-item-extra>
              </nz-list-item>
          </ng-container>
      </nz-list>

  `, styles: [
      `
    `
  ]
})
export class PluginUpdateCenterComponent extends BasicFormComponent implements OnInit, OnDestroy {

  plugins: Array<any> = [];
  hasDestroy = false;

  @Output()
  loading = new EventEmitter<boolean>();
  firstLoad = true;

  constructor(tisService: TISService, modalService: NzModalService, private cd: ChangeDetectorRef) {
    super(tisService, modalService);
    cd.detach();
  }

  ngOnDestroy(): void {
    this.hasDestroy = true;
  }

  ngOnInit(): void {
    if (this.firstLoad) {
      this.loading.emit(true);
    }
    this.httpPost('/coredefine/corenodemanage.ajax'
      , `action=plugin_action&emethod=get_update_center_status`)
      .then((r) => {
        if (this.firstLoad) {
          this.loading.emit(false);
          this.firstLoad = false;
        }
        // console.log(r.bizresult);
        this.plugins = r.bizresult;
        this.cd.detectChanges();
        if (!this.hasDestroy) {
          setTimeout(() => {
            this.ngOnInit();
          }, 2000);
        }
      });
  }
}
