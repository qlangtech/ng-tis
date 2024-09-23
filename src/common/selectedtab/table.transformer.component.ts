import {Component, EventEmitter, OnInit} from "@angular/core";
import {Descriptor, EXTRA_PARAM_DATAX_NAME, HeteroList, PluginMeta, PluginSaveResponse} from "../../common/tis.plugin";
import {PluginsComponent} from "../../common/plugins.component";
import {TISService} from "../../common/tis.service";
import {NzDrawerRef} from "ng-zorro-antd/drawer";
import {DataxAddStep4Component} from "../../base/datax.add.step4.component";
import {BasicSelectedTabManagerComponent} from "./basic-selected-tab-manager-component";


@Component({

  template: `

    <tis-steps-tools-bar *ngIf="!readonly" [formDisabled]="formDisabled"
                         [goBackBtnShow]="this.dto.offsetStep>0" (goBack)="goBack()" >

      <final-exec-controller>
        <button [disabled]="formDisabled" nz-button nzType="primary" (click)="createStepNext()">
          <i nz-icon nzType="step-forward"
             nzTheme="outline"></i>保存&关闭
        </button>
      </final-exec-controller>

    </tis-steps-tools-bar>
    <tis-plugins [disabled]="readonly" [disableVerify]="true" [getCurrentAppCache]="true" [pluginMeta]="transformerPluginMeta"
                 (afterSave)="verifyPluginConfig($event)"
                 [savePlugin]="transformerSavePlugin" [formControlSpan]="21"
                 [showSaveButton]="false" [shallInitializePluginItems]="false"
                 [_heteroList]="transformerHetero"></tis-plugins>
  `
})
export class TableTransformerComponent extends BasicSelectedTabManagerComponent implements OnInit {
  transformerPluginMeta: PluginMeta[] = [];
  transformerSavePlugin = new EventEmitter<{ verifyConfig: boolean }>();
  transformerHetero: HeteroList[] = [];

  readonly :boolean = false;

  constructor(tisService: TISService, drawer: NzDrawerRef<{ hetero: HeteroList }>) {
    super(tisService, drawer);
  }

  ngOnInit(): void {
   // this.dto.offsetStep = 1;
   // console.log(this.tisService);
    let currApp = this.tisService.currentApp;
    this.transformerPluginMeta = [
      {
        name: "transformer",
        require: true
        , extraParam: EXTRA_PARAM_DATAX_NAME + currApp.appName + ",id_" + this.dto.meta.id
        , descFilter:
          {
            localDescFilter: (desc: Descriptor) => true
          }
      }
    ];
    this.initTransformerHetero();
  }
  verifyPluginConfig(e: PluginSaveResponse) {
    //console.log([e.saveSuccess,e.verify]);
    if (e.saveSuccess) {
      this.drawer.close({hetero: this.dto.baseHetero[0]});
    }
  }
  initTransformerHetero() {
    // console.log(this.pluginMeta);

    let m = this.transformerPluginMeta[0];
    DataxAddStep4Component.processSubFormHeteroList(this, m, this.dto.meta, null
    ).then((hlist: HeteroList[]) => {

      hlist.forEach((h) => {
        PluginsComponent.addDefaultItem(m, h);
      })

      this.transformerHetero = hlist;
    });
  }

  createStepNext() {
    this.transformerSavePlugin.emit({verifyConfig: false});
  }

  goBack() {
    --this.dto.offsetStep;
    this.preStep.emit(this.dto);
  }
}
