/**
 * Created by Qinjiu on 5/15/2017.
 */
import {Component} from '@angular/core';
import {BasicFormComponent} from '../common/basic.form.component';
import {TISService} from '../service/tis.service';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {NzModalService} from "ng-zorro-antd";

/**
 * Created by Qinjiu on 5/15/2017.
 */

@Component({
  // templateUrl: '/offline/gitcommitdiff.htm'
  template : `
    <fieldset [disabled]='formDisabled'>
      <div class="modal-header">
        <h4 class="modal-title">Git Diff</h4>
        <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss('Cross click')">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
          <tis-msg [result]="result"></tis-msg>    
          <div class="container">
        <div class="form-group col-12" *ngIf="commits">
          <h4>文件变更详细 <span class="badge badge-default">New</span></h4>
          <div style="overflow:auto" *ngIf="diffs">
            <tis-page [rows]="diffs">
              <tis-col title="原路径" width="50" field="oldPath"></tis-col>
              <tis-col title="变更状态" width="50" field="status"></tis-col>
            </tis-page>
          </div>
          <br>
          <div *ngIf="targetDiff">
            <pre>{{ targetDiff.diff }}</pre>
          </div>
        </div>
      </div></div>
    </fieldset>
  `
})
export class GitCommitDiffComponent extends BasicFormComponent {
  private _info: any;
  commits: any;
  diffs: any;
  targetDiff: any;

  constructor(public tisService: TISService,
              public activeModal: NgbActiveModal, modalService: NzModalService) {
    super(tisService, modalService);
  }


  set info(value: any) {
    this._info = value;

    this.commits = this._info.commits;
    this.diffs = this._info.diffs;
    console.log('--------------');
    console.log(this.diffs);
    console.log(this.diffs.length);

    for (let diff of this.diffs) {
      if (diff.newFile === true) {
        diff.status = 'Added';
      } else if (diff.deletedFile === true) {
        diff.status = 'Deleted';
      } else if (diff.renamedFile === true) {
        diff.status = 'Rename';
      } else {
        diff.status = 'Modified';
      }
    }

    if (this.diffs.length >= 1) {
      this.targetDiff = this.diffs[0];
    }
    console.log(this.targetDiff);
  }

  onSelect(diff: any) {
    this.targetDiff = diff;
  }

}

