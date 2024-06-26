import {EventEmitter, Injectable, Input, Output} from "@angular/core";
import {BasicFormComponent} from "../basic.form.component";
import {StepType} from "../steps.component";
import {HeteroList, PluginSaveResponse, PluginType, SavePluginEvent} from "../tis.plugin";
import {TISService} from "../tis.service";
import {NzDrawerRef} from "ng-zorro-antd/drawer";
import {SelectedTabDTO} from "./plugin-sub-form.component";

@Injectable()
export abstract class BasicSelectedTabManagerComponent extends BasicFormComponent {

  savePlugin = new EventEmitter<SavePluginEvent>();
//  @Input() hetero: HeteroList[] = [];

  // @Input() pluginMeta: PluginType[] = [];

  @Output()
  public nextStep = new EventEmitter<SelectedTabDTO>();
  @Output()
  protected preStep = new EventEmitter<SelectedTabDTO>();
  @Input()
  public dto: SelectedTabDTO;

  constructor(tisService: TISService, public drawer: NzDrawerRef<{ hetero: HeteroList }>) {
    super(tisService);
  }
 abstract verifyPluginConfig(e: PluginSaveResponse);
  // verifyPluginConfig(e: PluginSaveResponse) {
  //   if (e.saveSuccess && e.verify) {
  //     this.drawer.close({hetero: this.hetero[0]});
  //   }
  // }
}
