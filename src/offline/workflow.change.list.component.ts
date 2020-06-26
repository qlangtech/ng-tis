import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {TISService} from '../service/tis.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {BasicFormComponent} from '../common/basic.form.component';
import {WorkflowChangeCreateComponent} from './workflow.change.create.component';
import {Workflow, WorkflowAddComponent} from './workflow.add.component';
// import {WorkflowChangeDetailComponent} from './workflow.change.detail.component';
// import {GitCommitsComponent} from './git.commits.component';


/**
 * Created by Qinjiu on 6/22/2017.
 */

@Component({
  // templateUrl: '/offline/workflowChangeList.htm'
  template: `
    <div class="container">
      <form #form>
        <fieldset [disabled]='formDisabled'>
          <legend>工作流变更管理</legend>
  
          <button type="button" class="btn btn-secondary btn-sm" (click)="createWorkflowChange()">
            <i class="fa fa-bank" aria-hidden="true"></i>创建变更
          </button>

          <div style="overflow:auto" class="form-group col-15" *ngIf="workflowChanges">
            <table class="table">
              <thead>
              <tr>
                <th>#</th>
                <th>使用中</th>
                <th>
                  <button id="btnCompare" class="btn btn-secondary"
                          (click)="compareTwoChanges()">比较
                  </button>
                </th>
                <th>对应工作流</th>
                <th>最近操作时间</th>
                <th>创建者</th>
                <th>类型</th>
                <th>变更原因</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
              </thead>
              <tbody>

              <tr *ngFor="let workflowChange of workflowChanges; let i=index">
                <th scope="row">{{i + 1}}</th>
                <td align="center">
                  <input type="radio" class="form-check-input" name="optionsRadios"
                         value="{{workflowChange.id}}"
                         *ngIf="workflowChange.publishState === 1 && workflowChange.type === 2"
                         [checked]="workflowChange.inUse" disabled>
                </td>
                <td><input class="compare" type="checkbox" name="commitLogVersion"
                           value="{{workflowChange.id}}"
                           (click)="onCompareClick(workflowChange, $event.target)"
                           [checked]="workflowChange.compareChecked"
                           *ngIf="workflowChange.publishState === 1 && workflowChange.type === 2"
                ></td>
                <td>{{workflowChange.workflowName}}</td>
                <td>{{workflowChange.opTime | date: 'yyyy/MM/dd HH:mm'}}</td>
                <td>{{workflowChange.opUserName}}</td>
                <td [ngSwitch]="workflowChange.type">
                  <p *ngSwitchCase=1>添加</p>
                  <p *ngSwitchCase=2>修改</p>
                  <p *ngSwitchCase=3>删除</p>
                  <p *ngSwitchDefault>其他</p>
                </td>
                <td>{{workflowChange.publishReason}}</td>
                <td [ngSwitch]="workflowChange.publishState">
                  <p *ngSwitchCase=1>发布成功</p>
                  <p *ngSwitchCase=2>撤销</p>
                  <p *ngSwitchCase=3>变更中</p>
                  <p *ngSwitchDefault>其他</p>
                </td>
                <td>
                  <button class="btn btn-secondary"
                          (click)="editWorkflow(workflowChange.workflowId)"
                          *ngIf="workflowChange.publishState === 3">编辑
                  </button>
                  <button class="btn btn-secondary"
                          (click)="deleteWorkflowChange(workflowChange.workflowId)"
                          *ngIf="workflowChange.publishState === 3">撤销
                  </button>
                  <button class="btn btn-secondary"
                          (click)="confirmWorkflowChange(workflowChange.workflowId)"
                          *ngIf="workflowChange.publishState === 3">发布
                  </button>
           
                  <button class="btn btn-secondary"
                          (click)="checkWorkflow(workflowChange.workflowName,workflowChange.gitSha1)"
                          *ngIf="workflowChange.publishState !== 3">查看
                  </button>
                  <button class="btn btn-secondary"
                          (click)="reuseWorkflowChange(workflowChange.id)"
                          *ngIf="workflowChange.publishState === 1 && workflowChange.type === 2 && !workflowChange.inUse">
                    使用
                  </button>
                </td>
              </tr>
              </tbody>
            </table>
          </div>

          <br>
        </fieldset>
      </form>
    </div>
  `
})

export class WorkflowChangeListComponent extends BasicFormComponent implements OnInit {
  workflowChanges: any[];
  private currCompareCheckedOrder: number = 1;

  constructor(tisService: TISService, modalService: NgbModal, private activateRoute: ActivatedRoute) {
    super(tisService, modalService);
  }

  ngOnInit(): void {
    let action = 'event_submit_do_get_workflow_changes=y&action=offline_datasource_action&page=1';
    let queryParams = this.activateRoute.snapshot.queryParams;
    if (queryParams['workflowId']) {
      action = action + '&workflowId=' + queryParams['workflowId'];
    }
    this.httpPost('/offline/datasource.ajax', action)
      .then(result => {
        console.log(result);
        if (result.success) {
          this.initWorkflowChanges(result.bizresult);
        }
      });
  }

  /**
   * 初始化变更，为了能进行版本比较，对每个变更添加两个属性
   * compareChecked 是否被选中
   * compareCheckedOrder 选中的序号
   * @param workflowChanges
   */
  initWorkflowChanges(workflowChanges: any[]): void {
    for (let workflowChange of workflowChanges) {
      workflowChange.compareChecked = false;
      workflowChange.compareCheckedOrder = 0;
    }
    this.workflowChanges = workflowChanges;
    console.log(this.workflowChanges);
  }

  /**
   * 点击比较的选中框，每次都会发送变化
   * @param workflowChange
   * @param target
   */
  onCompareClick(workflowChange: any, target: any): void {
    let checkedVersion: any[] = this.workflowChanges.filter(s => s.compareChecked);
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
    workflowChange.compareChecked = true;
    workflowChange.compareCheckedOrder = this.currCompareCheckedOrder++;
    target.checked = workflowChange.compareChecked;
  }

  /**
   * 进行版本比较
   */
  compareTwoChanges(): void {
    console.log('compare');
    let checkedVersion: any[] = this.workflowChanges.filter(s => s.compareChecked);
    console.log(checkedVersion);
    if (checkedVersion.length !== 2) {
      alert('必须选中2个版本');
      return;
    }
    let fromVersion = checkedVersion[1].gitSha1;
    let toVersion = checkedVersion[0].gitSha1;
    console.log(fromVersion + ' ' + toVersion);
    let action = 'event_submit_do_compare_workflow_changes=y&action=offline_datasource_action&fromVersion=' + fromVersion
      + '&toVersion=' + toVersion + '&path=' + checkedVersion[0].workflowName;
    console.log(action);
    this.httpPost('/offline/datasource.ajax', action)
      .then(result => {
        console.log(result);
        if (result.success) {
          // let ref = // this.modalService.open(WorkflowChangeDetailComponent, {size: 'lg'});
         // this.openLargeDialog(WorkflowChangeDetailComponent);

          // ref.componentInstance.content = result.bizresult;
        }
      });
  }

  createWorkflowChange(): void {
   // this.modalService.open(WorkflowChangeCreateComponent, {size: 'lg'});

    this.openLargeDialog(WorkflowChangeCreateComponent);
  }

  deleteWorkflowChange(id: number): void {
    let action = 'event_submit_do_delete_workflow_change=y&action=offline_datasource_action&id=' + id;
    this.httpPost('/offline/datasource.ajax', action)
      .then(result => {
        this.processResult(result);
      });
  }

  confirmWorkflowChange(id: number): void {
    let action = 'emethod=confirm_workflow_change&action=offline_datasource_action&id=' + id;
    this.httpPost('/offline/datasource.ajax', action)
      .then(result => {
        this.processResult(result);
      });
  }

  editWorkflow(id: number): void {
    let action = 'event_submit_do_get_workflow_config_branch=y&action=offline_datasource_action&id=' + id;
    this.httpPost('/offline/datasource.ajax', action)
      .then(result => {
        console.log(result);
        if (result.success) {
          let modalRef =  // this.modalService.open(WorkflowAddComponent, {size: 'lg', backdrop: 'static'});
           this.openNormalDialog(WorkflowAddComponent) ;
          modalRef.componentInstance.parent = this;
          modalRef.componentInstance.workflow = new Workflow();
          modalRef.componentInstance.initWorkflow(result.bizresult);
        } else {
          this.processResult(result);
        }
      });
  }

  checkWorkflow(name: string, gitSha1: string): void {
    let action = 'event_submit_do_get_workflow_config_sha1=y&action=offline_datasource_action&name=' + name + '&gitSha1=' + gitSha1;
    this.httpPost('/offline/datasource.ajax', action)
      .then(result => {
        console.log(result);
        if (result.success) {
          console.log(result.bizresult);
        }
      });
  }

  reuseWorkflowChange(id: number): void {
    let action = 'event_submit_do_use_workflow_change=y&action=offline_datasource_action&id=' + id;
    this.httpPost('/offline/datasource.ajax', action)
      .then(result => {
        console.log(result);
        this.processResult(result);
        if (result.success) {
          console.log(result.bizresult);
          this.initWorkflowChanges(result.bizresult);
        }
      });
  }
}
