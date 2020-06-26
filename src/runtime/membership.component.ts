import {Component} from "@angular/core";
import {TISService} from "../service/tis.service";
import {BasicFormComponent} from "../common/basic.form.component";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

// 会员权限管理
@Component({
  //  templateUrl: '/runtime/membership.htm'
  template: `
    <h1>Membership</h1>
  `
})
export class MembershipComponent extends BasicFormComponent {
  constructor(tisService: TISService, modalService: NgbModal) {
    super(tisService, modalService);
  }


}
