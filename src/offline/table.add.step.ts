import {EventEmitter, Input, Output} from '@angular/core';
import {TISService} from '../service/tis.service';
import {BasicFormComponent} from '../common/basic.form.component';
import {Router} from '@angular/router';
import {Location} from '@angular/common';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

export class TableAddStep extends BasicFormComponent {
  @Input() isShow: boolean;
  @Output() previousStep: EventEmitter<any> = new EventEmitter();
  @Output() nextStep: EventEmitter<any> = new EventEmitter();

  constructor(protected tisService: TISService, protected router: Router
    , protected localtion: Location, modalService: NgbModal) {
    super(tisService, modalService);
  }

  // 执行下一步
  public createPreviousStep(form: any): void {
    this.previousStep.emit(form);
  }

  // 执行下一步
  public createNextStep(form: any): void {
    this.nextStep.emit(form);
  }

  protected goHomePage(tableId: number): void {
    // this.router.navigate(['/t/offline'], {queryParams: {tableId: tableId}});
  }

  protected goBack(): void {
    this.localtion.back();
  }
}
