import {Component} from '@angular/core';
import {TISService} from '../service/tis.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {GitCommitsComponent} from './git.commits.component';
import {Router} from '@angular/router';

/**
 * Created by Qinjiu on 5/16/2017.
 */
@Component({
  // templateUrl: '/offline/gitcommitlogs.htm'
  template : `
    <h3>{{title}}变更历史一览</h3>
    <p style="text-align:right;">
      <button id="btnCompare" class="btn btn-secondary"
              (click)="returnToWf()">返回
      </button>
    </p>
    <div style="overflow:auto" class="form-group col-12 " *ngIf="gitCommitLogs">
      <table class="table table-sm">
        <thead>
        <tr>
          <th>#</th>
          <th>
            <button id="btnCompare" class="btn btn-secondary"
                    (click)="compareTwoCommits()">比较
            </button>
          </th>
          <th>shortId</th>
          <th>姓名</th>
          <th>email</th>
          <th>提交时间</th>
          <th>日志</th>
        </tr>
        </thead>
        <tbody>

        <tr *ngFor="let commitLog of gitCommitLogs; let i=index">
          <th scope="row">{{i + 1}}</th>
          <td><input class="compare" type="checkbox" name="commitLogVersion"
                     value="{{commitLog.id}}"
                     (click)="onCompareClick(commitLog, $event.target)"
                     [checked]="commitLog.compareChecked"></td>
          <td>{{commitLog.shortId}}</td>
          <td>{{commitLog.authorName}}</td>
          <td>{{commitLog.authorEmail}}</td>
          <td>{{commitLog.createdAt}}</td>
          <td>{{commitLog.message}}</td>
        </tr>
        </tbody>
      </table>
    </div>
  `
})
export class DatasourceGitCommitsComponent extends GitCommitsComponent {
  constructor(public tisService: TISService, modalService: NgbModal, protected router: Router) {
    super(tisService, modalService, router);
    this.directory = 'datasource_daily';
    this.title = '数据源';
  }
}

