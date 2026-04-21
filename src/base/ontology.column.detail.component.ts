import {AfterViewInit, Component, Input, OnInit} from "@angular/core";
import {BasicFormComponent} from "../common/basic.form.component";
import {TISService} from "../common/tis.service";
import {NzModalService} from "ng-zorro-antd/modal";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {PluginSaveResponse} from "../common/tis.plugin";
import {buildObjectTypePluginExtraParam, ObjectType, ObjectTypeProperty} from "./common/ontology.common";


@Component({
  styles: [`

  `],
  template: `
<div class="item-block">
  <tis-plugins  (afterSave)="afterPluginSave($event)" [errorsPageShow]="false"
                [formControlSpan]="20" [shallInitializePluginItems]="false" [showSaveButton]="true"
                [disabled]="false"
                [plugins]="[{name: 'ontology-property', require: true, extraParam: pluginExtraParam}]"></tis-plugins>
</div>
  `
})
export class OntologyColumnDetailComponent extends BasicFormComponent implements AfterViewInit, OnInit {
  //breadcrumb: Breadcrumb;
  // ontologyDetail: OntologyDetail;
  // selectedMenu: MenuKey = 'objectTypes';
  // private ontologyName: string;

  @Input()
  prop: ObjectTypeProperty;

  @Input()
  objectType: ObjectType;

  constructor(tisService: TISService, modalService: NzModalService, notification: NzNotificationService) {
    super(tisService, modalService, notification);
  }

  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
    // this.route.params.subscribe(params => {
    //   this.ontologyName = params[KEY_TARGET_NAME];
    //   this.breadcrumb = {
    //     "breadcrumb": ["Ontology", "/base/ontology"],
    //     "name": this.ontologyName
    //   };
    //   this.loadDetail();
    // });
    console.log(this.prop)
  }


  get pluginExtraParam(): string {
    if (!this.prop) {
      throw new Error("param prop can not be null")
    }
    return buildObjectTypePluginExtraParam(this.objectType) + ",ontology-property_" + this.prop.name;
  }

  protected afterPluginSave($event: PluginSaveResponse) {

  }
}
