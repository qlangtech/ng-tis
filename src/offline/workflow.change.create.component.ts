/**
 * Created by Qinjiu on 6/22/2017.
 */
import {Component, OnInit} from '@angular/core';
import {BasicFormComponent} from '../common/basic.form.component';
import {TISService} from '../service/tis.service';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Dataflow} from './workflow.component';

declare var jQuery: any;

@Component({
  template: `
      <!--from modal frame-->
      <fieldset [disabled]='formDisabled'>
          <div class="modal-header">
              <h4 class="modal-title">创建变更</h4>
              <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss('Cross click')">
                  <span aria-hidden="true">&times;</span>
              </button>
          </div>
          <div class="modal-body">
              <tis-msg [result]="result"></tis-msg>
              <div class="container">
                  <form #form>
                      <fieldset [disabled]='formDisabled'>
                          <input type="hidden" name="event_submit_do_create_workflow_change" value="y"/>
                          <input type="hidden" name="action" value="offline_datasource_action"/>

                          <div class="form-group row">
                              <label for="example-text-input" class="col-2 col-form-label">变更理由</label>
                              <div class="col-10">
                                  <input class="form-control" type="text" name="changeReason">
                              </div>
                          </div>

                          <div class="form-group row">
                              <label for="example-text-input" class="col-2 col-form-label">请选择工作流</label>
                              <div class="col-10">
                                  <select class="form-control" name="workflowName">
                                      <option *ngFor="let workflow of workflows">{{workflow.name}}</option>
                                  </select>
                              </div>
                          </div>
                          <p style="text-align:right;">
                              <button type="button" class="btn btn-secondary" (click)="goBack()">关闭</button>
                              <button type="submit" class="btn btn-primary" (click)="createWorkflowChange(form)">创建</button>
                          </p>
                      </fieldset>
                  </form>
              </div>
          </div>
      </fieldset>
  `
})

export class WorkflowChangeCreateComponent extends BasicFormComponent implements OnInit {
  workflows: Dataflow[];
  parent: any;

  constructor(tisService: TISService, modalService: NgbModal, public activeModal: NgbActiveModal) {
    super(tisService, modalService);
  }

  ngOnInit(): void {
    let action = 'event_submit_do_get_workflows=y&action=offline_datasource_action';
    this.httpPost('/offline/datasource.ajax', action)
      .then(result => {
        console.log(result);
        this.initWorkflows(result.bizresult);
      });
  }

  public initWorkflows(result: any): void {
    this.workflows = [];
    for (let workflow of result) {
      let workflow1 = new Dataflow();
      workflow1.id = workflow.id;
      workflow1.name = workflow.name;
      workflow1.opUserName = workflow.opUserName;
      workflow1.gitPath = workflow.gitPath;
      workflow1.opTime = new Date();
      workflow1.opTime.setTime(workflow.opTime);
      workflow1.inChange = workflow.inChange;

      if (workflow1.inChange === 0) {
        workflow1.state = '已发布';
      } else if (workflow1.inChange === 1) {
        workflow1.state = '新增变更';
      } else {
        workflow1.state = '原有变更';
      }
      this.workflows.push(workflow1);
    }
    console.log(this.workflows);
  }

  goBack(): void {
    this.activeModal.close();
  }


  createWorkflowChange(form: any): void {
    console.log(jQuery(form).serialize());
    let action = jQuery(form).serialize();
    this.httpPost('/offline/datasource.ajax',
      action)
      .then(
        result => {
          console.log(result);
          if (result.success) {
            this.activeModal.close();
            if (this.parent) {
              this.parent.goToWorkflowChange();
            }
          } else {
            this.processResult(result);
          }
        });

  }
}
