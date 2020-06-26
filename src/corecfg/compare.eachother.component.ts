import {Component, OnInit, Input, ElementRef, ViewChild, ViewContainerRef} from '@angular/core';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { TISService} from '../service/tis.service';
import {BasicFormComponent} from '../common/basic.form.component';

declare var jQuery: any;
@Component({
  // templateUrl: '/runtime/jarcontent/file_compare_result.htm'
  template: `
    <fieldset [disabled]='formDisabled'>
      <div class="modal-header">
        <h4 class="modal-title"><i nz-icon nzType="diff" nzTheme="twotone"></i>版本配置比较  Ver[{{twoSnapshot.snapshotOtherId}}] ~ Ver[{{twoSnapshot.snapshotId}}]</h4>
        <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss('Cross click')">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
          <tis-page-header [breadcrumb]="false">
              <span class="edit-notify" style="background-color:#00FF00;">新增内容</span>
              <span class="edit-notify" style="background-color:pink;text-decoration:line-through;">删除内容</span></tis-page-header>
        <div style="margin-left:10px;">
          <div *ngFor="let r of compareResults">
              <h4>{{r.fileName}}</h4>
            <tis-compare-result [content]="r"></tis-compare-result>
          </div>
        </div>
      </div>
    </fieldset>
  `,
  styles: [
    `.edit-notify {
          display: inline-block;
          padding: 5px;
          margin-right: 10px;
          font-size: 20px;
      }`
  ]
})
export class CompareEachOtherComponent extends BasicFormComponent implements OnInit {

  compareResults: any[] = [];
  twoSnapshot: { snapshotId: number, snapshotOtherId: number } = {snapshotId: 0, snapshotOtherId: 0};
  @Input() compareSnapshotId: number[];

  constructor(tisService: TISService, public activeModal: NgbActiveModal, modalService: NgbModal) {
    super(tisService, modalService);
  }


  ngOnInit(): void {
    this.httpPost('/runtime/jarcontent/file_compare_result.ajax'
      , 'event_submit_do_get_compare_result=y&action=snapshot_revsion_action&comparesnapshotid='
      + this.compareSnapshotId[0] + '&comparesnapshotid=' + this.compareSnapshotId[1])
      .then(result => {
        this.compareResults = result.bizresult.results;
        this.twoSnapshot = result.bizresult;
      });
  }

}

@Component({
  selector: 'tis-compare-result',
  template: `
    <pre style="border:#000066 solid 3px;margin-left:5px;background-color:#E6E6E6;padding:5px;"></pre>`
})
export class CompareResultComponent {
  constructor(private c: ViewContainerRef) {
  }

  @Input() set content(d: any) {
    // this.c.element.nativeElement.firstChild.innerHTML = 'ddd' ; // d.htmlDiffer;

    jQuery(this.c.element.nativeElement).find(':first-child').html(d.htmlDiffer);
    // console.info( ); // .firstChild.innerHTML =   d.htmlDiffer;

  }
}

