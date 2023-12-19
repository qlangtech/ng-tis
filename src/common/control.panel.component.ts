import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output} from "@angular/core";
import {BasicFormComponent} from "./basic.form.component";
import {TISService} from "./tis.service";
import {NzModalService} from "ng-zorro-antd/modal";
import {NzNotificationService} from "ng-zorro-antd/notification";

export declare type PanelType = 'normal-stop-incr' | 'danger-delete';

class PanelMeta {
  constructor(public title: string, public subTitle: string, public danger: boolean, public btnType: string, public btnLabel: string) {
  }
}

const typeMeta = new Map<string, PanelMeta>();
typeMeta.set('danger-delete', new PanelMeta("危险操作", "以下操作可能造成某些组件功能不可用", true, 'delete', '删除'));
typeMeta.set('normal-stop-incr', new PanelMeta("一般操作", "", false, 'stop', '停止'));
// const typeMeta: { key: PanelType, val: PanelMeta } = {
//   <PanelType>'danger-delete': new PanelMeta("危险操作", "以下操作可能造成某些组件功能不可用", true)
// }


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "control-prompt",
  template: `
    <div class="typography-panel">
      <nz-page-header class="danger-control-title" [nzTitle]="typeMeta.title" [nzSubtitle]="typeMeta.subTitle">
      </nz-page-header>

      <nz-list class="ant-advanced-search-form"
               [ngClass]="{'ant-advanced-search-form-danger': typeMeta.danger ,'ant-advanced-search-form-normal':!typeMeta.danger}"
               nzBordered>
        <nz-list-item>
          <span nz-typography>{{this.procDesc}}</span>
          <button nz-button nzType="primary" [nzLoading]="this.formDisabled" [disabled]="disabled"
                  [nzDanger]="typeMeta.danger"
                  (click)="btnClick()">
            <i nz-icon [nzType]="typeMeta.btnType" nzTheme="outline"></i>{{typeMeta.btnLabel}}
          </button>
        </nz-list-item>
      </nz-list>
    </div>
  `,
  styles: [
    `
      .typography-panel {
        margin-left: 20px;

      }

      nz-descriptions {
        margin-top: 15px;
      }

      nz-tab {
        padding-left: 10px;
      }

      .danger-control-title {
        margin-top: 20px;
        padding: 0px 0;
      }

      .ant-advanced-search-form {
        padding: 10px;
        #background: #fbfbfb;
        border: 2px solid;
        border-radius: 6px;
        margin-bottom: 10px;
        clear: both;
      }

      .ant-advanced-search-form-danger {
        border-color: #d97f85;
      }

      .ant-advanced-search-form-normal {
        border-color: #91d5ff;
      }

      .typography-desc {
        font-size: 10px;
        color: #999999;
      }

      [nz-row] {
        margin-bottom: 10px;
      }
    `
  ]
})
export class ControlPanelComponent extends BasicFormComponent  //implements AfterContentInit, OnDestroy
{
  constructor(tisService: TISService, modalService: NzModalService, notification: NzNotificationService, private cd: ChangeDetectorRef) {
    super(tisService, modalService, notification);
  }

  get typeMeta(): PanelMeta {
    return typeMeta.get(this.panelType);
  }

  @Input()
  panelType: PanelType


  @Input()
  procDesc: string;

  @Input()
  disabled: boolean;

  @Output()
  controlClick = new EventEmitter<ControlPanelComponent>();

  public restoreInitialState() {
    this.formDisabled = false;
    this.cd.detectChanges();
  }

  btnClick() {
    //'${this.currentApp.appName}'
    // console.log(this.currentApp);
    this.modalService.confirm({
      nzTitle: this.typeMeta.title,
      nzContent: `是否确定要${this.procDesc}`,
      nzOkText: '执行',
      nzCancelText: '取消',
      nzOnOk: () => {
        this.formDisabled = true;
        this.controlClick.emit(this);
        this.cd.detectChanges();
      }
    });
  }

  public enableComponent() {
    this.formDisabled = false;
    this.cd.detectChanges();
  }
}
