import {AfterContentInit, Component, Input} from "@angular/core";


// implements OnInit, AfterContentInit
@Component({
  selector: 'tis-breadcrumb',
  template: `
      <nz-breadcrumb>
          <nz-breadcrumb-item>
              Home
          </nz-breadcrumb-item>
          <nz-breadcrumb-item>
              <a>Application List</a>
          </nz-breadcrumb-item>
          <nz-breadcrumb-item>
              An Application
          </nz-breadcrumb-item>
      </nz-breadcrumb>
  `,
  styles: [
      `
          nz-breadcrumb {
              margin: 10px 0 20px 0;
          }
    `
  ]
})
export class TisBreadcrumbComponent implements AfterContentInit {
  @Input()
  result: { success: boolean, msg: any[], errormsg: any[] }
    = {success: false, msg: [], errormsg: []};

  public get showSuccessMsg(): boolean {

    return (this.result != null) && (this.result.success === true)
      && (this.result.msg !== null) && this.result.msg.length > 0;

  }

  public get showErrorMsg(): boolean {
    return this.result != null && !this.result.success
      && this.result.errormsg && this.result.errormsg.length > 0;
  }

  ngAfterContentInit() {

  }

  jsonStr(v: any): string {
    return JSON.stringify(v);
  }


}
