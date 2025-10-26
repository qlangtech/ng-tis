import {Component, OnInit} from "@angular/core";
import {TISService} from "../../common/tis.service";
import {NzDrawerRef} from "ng-zorro-antd/drawer";
import {HeteroList, PluginSaveResponse, SavePluginEvent, VerifyConfig} from "../../common/tis.plugin";
import {BasicSelectedTabManagerComponent} from "./basic-selected-tab-manager-component";
const KEY_SKIP_TRANSFORMER = 'skip';

@Component({
  // selector: 'nz-drawer-custom-component',
  template: `

    <tis-steps-tools-bar [nextBtnPrimary]="false" [formDisabled]="formDisabled"
                         [goBackBtnShow]="this.dto.offsetStep>0" (goOn)="createStepNext()">
      <break-next>
        <button nzType="primary" [disabled]="formDisabled" nz-button (click)="saveAndSkipTransformer()">
          <i nz-icon nzType="save" nzTheme="outline"></i>保存&关闭
        </button>
      </break-next>
    </tis-steps-tools-bar>
    <tis-plugins [disableVerify]="true" [getCurrentAppCache]="true" [pluginMeta]="dto.basePluginMeta"
                 (afterVerifyConfig)="verifyPluginConfig($event)"
                 [savePlugin]="savePlugin" [formControlSpan]="21"
                 [showSaveButton]="false" [shallInitializePluginItems]="false"
                 [_heteroList]="dto.baseHetero"></tis-plugins>

  `,
  styles: [`
    button {
      margin-right: 10px;
    }`]
})
export class TableBaseComponent extends BasicSelectedTabManagerComponent implements OnInit {


  constructor(tisService: TISService, drawer: NzDrawerRef<{ hetero: HeteroList }>) {
    super(tisService, drawer);
  }

  verifyPluginConfig(e: PluginSaveResponse) {
    if (e.saveSuccess) {
      //console.log([ 'shallSkip' ,this.shallSkip(e),e]);
      if (this.shallSkip(e)) {
        this.drawer.close({hetero: this.dto.baseHetero[0]});
      } else {
        this.dto.offsetStep++;
        this.nextStep.emit(this.dto);
      }
    }
  }

  ngOnInit(): void {
    // console.log([this.pluginMeta,this.hetero,this.dto]);

  }


  createStepNext() {
    let evt = this.createSaveEvent(false);
    this.savePlugin.emit(evt);

  }

  saveAndSkipTransformer() {
    let evt = this.createSaveEvent(true);
    this.savePlugin.emit(evt);
  }

  private createSaveEvent(skip: boolean) {
    let evt = new SavePluginEvent();
   // evt.verifyConfig = true;
    evt.verifyConfig = VerifyConfig.VERIFY;
    evt.postPayload = {};
    evt.postPayload[KEY_SKIP_TRANSFORMER] = skip;
    return evt;
  }

  private shallSkip(e: PluginSaveResponse): boolean {
    return e.getPostPayloadPropery(KEY_SKIP_TRANSFORMER);
  }


}
