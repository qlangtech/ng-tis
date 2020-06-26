/**
 * Created by baisui on 2017/4/18 0018.
 */
import {Component, OnInit, Input} from '@angular/core';
import {SchemaXmlEditComponent, SchemaEditVisualizingModelComponent} from "./schema-xml-edit.component";
import {NgbModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";
// import {SolrCfgEditComponent} from "./solrcfg.edit.component";
import {BasicFormComponent} from "../common/basic.form.component";
import {TISService} from "../service/tis.service";
import {ActivatedRoute, Router} from "@angular/router";


@Component({
  selector: "snapshot-linker",
  template: `
      <a nz-dropdown [nzClickHide]="false" [nzDropdownMenu]="schemaEditDropdown">[schema.xml]<i nz-icon nzType="down"></i></a>
      <nz-dropdown-menu #schemaEditDropdown>
          <ul nz-menu>
              <li nz-menu-item (click)="openSchemaDialog(true)"><i nz-icon nzType="file-excel" nzTheme="outline"></i>xml</li>
              <li nz-menu-item (click)="openSchemaVisualDialog()"><i nz-icon nzType="eye" nzTheme="outline"></i>高级</li>
          </ul>
      </nz-dropdown-menu>
      <button nz-button nzType="link" (click)="openSolrConfigDialog()">[solr.xml]</button>
  `,
  // 不知道为啥西面这个加style的方法不行
  // styles:['.schema-edit-modal .modal-dialog {max-width:1200px;}']

})
export class SnapshotLinkComponent extends BasicFormComponent {
  @Input() snapshot: SnapshotLink;

  // constructor(private modalService: NgbModal) {
  //
  // }

  constructor(tisService: TISService, modalService: NgbModal, private router: Router, private route: ActivatedRoute) {
    super(tisService, modalService);
  }

  openSchemaDialog(editable: boolean): boolean {
    this.router.navigate(['../xml_conf/', 'schema', this.snapshot.snId], {relativeTo: this.route});
    return false;
  }

  openSchemaVisualDialog(): void {
    // let modalRef: NgbModalRef = this.openNormalDialog(SchemaEditVisualizingModelComponent);
    // modalRef.componentInstance.snapshotid = this.snapshot.snId;

    this.router.navigate(['../schema_visual/', this.snapshot.snId], {relativeTo: this.route});
  }


  openSolrConfigDialog(): void {
    this.router.navigate(['../xml_conf/', 'config', this.snapshot.snId], {relativeTo: this.route});
    // let modalRef: NgbModalRef = this.openNormalDialog(SchemaXmlEditComponent);
    // modalRef.componentInstance.resType = 'solrconfig.xml';
    // modalRef.componentInstance.snapshotid = this.snapshot.snId;
  }

}

// {
//   "appId":111498,
//   "createTime":1557187739000,
//   "createUserId":999,
//   "createUserName":"baisui",
//   "preSnId":20664,
//   "resApplicationId":13380,
//   "resCorePropId":13307,
//   "resJarId":13226,
//   "resSchemaId":15002,
//   "resSolrId":14478,
//   "snId":20688,
//   "updateTime":1557187739000
// },
interface SnapshotLink {
  snId: number;
  resSolrId: number;
  resSchemaId: number;
  appId: number;
  createTime: number;
}
