// import {Component} from '@angular/core';
// import {BasicFormComponent} from '../common/basic.form.component';
// import {TISService} from '../service/tis.service';
// import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
// @Component({
//   templateUrl: '/offline/workflowChangeDetail.htm'
// })
// export class WorkflowChangeDetailComponent extends BasicFormComponent {
//   private _content: DiffContent;
//
//   constructor(protected tisService: TISService, modalService: NgbModal, public activeModal: NgbActiveModal) {
//     super(tisService, modalService);
//   }
//
//
//   public set content(value: string) {
//     this._content = new DiffContent(value);
//   }
// }
//
// class DiffContent {
//   private _htmlDiffer: string;
//
//   constructor(htmlDiffer: string) {
//     this._htmlDiffer = htmlDiffer;
//   }
//
//
//   get htmlDiffer(): string {
//     return this._htmlDiffer;
//   }
// }
