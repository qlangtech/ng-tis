import {OnInit} from '@angular/core';
import {BasicFormComponent} from '../common/basic.form.component';
import {TISService} from '../service/tis.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {GitCommitDiffComponent} from './git.commit.diff.component';
import {Router} from '@angular/router';

/**
 * Created by Qinjiu on 5/15/2017.
 */

export class GitCommitsComponent extends BasicFormComponent implements OnInit {
  protected directory: string;
  gitCommitLogs: GitCommitLog[];
  private currCompareCheckedOrder: number = 1;
  title: string;

  constructor(public tisService: TISService, modalService: NgbModal, protected router: Router,) {
    super(tisService, modalService);
  }


  ngOnInit(): void {
    let action = 'event_submit_do_get_git_commit_logs=y&action=offline_datasource_action' + '&directory=' + this.directory;
    this.httpPost('/offline/datasource.ajax', action)
      .then(result => {
        console.log(result);
        this.gitCommitLogs = [];
        for (let commitLog of result.bizresult) {
          this.gitCommitLogs.push(new GitCommitLog(commitLog.id, commitLog.shortId, commitLog.title,
            commitLog.authorName, commitLog.authorEmail, commitLog.createdAt, commitLog.message));
        }
      });
  }

  onCompareClick(commitLog: GitCommitLog, target: any): void {
    let checkedVersion: GitCommitLog[] = this.gitCommitLogs.filter(s => s.compareChecked);
    let maxOrder = 0;
    if (checkedVersion.length > 1) {
      checkedVersion.forEach(s => {
        if (s.compareCheckedOrder > maxOrder) {
          maxOrder = s.compareCheckedOrder;
        }
      });
      checkedVersion.forEach(s => {
        if (s.compareCheckedOrder !== maxOrder) {
          s.compareChecked = false;
        }
      });
    }
    commitLog.compareChecked = true;
    commitLog.compareCheckedOrder = this.currCompareCheckedOrder++;
    target.checked = commitLog.compareChecked;
  }

  compareTwoCommits(): void {
    console.log('compare');
    let checkedVersion: GitCommitLog[] = this.gitCommitLogs.filter(s => s.compareChecked);
    console.log(checkedVersion);
    if (checkedVersion.length !== 2) {
      alert('必须选中2个版本');
      return;
    }
    let fromVersion = checkedVersion[1].id;
    let toVersion = checkedVersion[0].id;
    console.log(fromVersion + ' ' + toVersion);
    let action = 'event_submit_do_get_commit_version_diff=y&action=offline_datasource_action&fromVersion=' + fromVersion
      + '&toVersion=' + toVersion + '&directory=' + this.directory;
    this.httpPost('/offline/datasource.ajax', action)
      .then(result => {
        console.log(result);
        let ref = // this.modalService.open(GitCommitDiffComponent, {size: 'lg'});
          this.openLargeDialog(GitCommitDiffComponent);
        ref.componentInstance.info = result.bizresult;
        // this.modalService.open(GitCommitsComponent, {size: 'lg'});
        // this.activeModal.close();
      });
  }

  public returnToWf(): void {
    this.router.navigate(['/t/offline/wf']);
  }

}

export class GitCommitLog {
  id: string;
  shortId: string;
  title: string;
  authorName: string;
  authorEmail: string;
  createdAt: string;
  message: string;
  public compareChecked: boolean;
  compareCheckedOrder: number;


  constructor(id: string, shortId: string, title: string, authorName: string, authorEmail: string, createdAt: string, message: string) {
    this.id = id;
    this.shortId = shortId;
    this.title = title;
    this.authorName = authorName;
    this.authorEmail = authorEmail;
    this.createdAt = createdAt;
    this.message = message;
    this.compareChecked = false;
    this.compareCheckedOrder = 0;
  }
}
