import {
  AfterContentInit,
  Component, ContentChild,
  ContentChildren,
  Directive, ElementRef,
  // EventEmitter,
  Input, OnInit,
  // Output,
  QueryList, TemplateRef, ViewChild,
  ViewContainerRef
} from "@angular/core";
// import {ActivatedRoute, Router} from "@angular/router";

declare var jQuery: any;


@Directive({selector: '[tis-ipt-prop]'})
export class TisInputProp implements AfterContentInit {
  @Input('tis-ipt-prop') prop: { id: string, name: string };

  ngAfterContentInit(): void {
    // console.info(this.contentTempate.elementRef.nativeElement.innerHTML);
    // console.info(this.prop);
    // console.info(  this.viewContainerRef.element.nativeElement.innerHTML);
    let e = this.viewContainerRef.element.nativeElement;
    e.id = this.prop.id;
    e.name = this.prop.name;
    e.className = 'form-control';
  }

  constructor(public viewContainerRef: ViewContainerRef) {

  }

  // @ContentChild(TemplateRef) contentTempate: TemplateRef<any>;
  // nativeElement: any;

  // constructor(viewContainerRef: ViewContainerRef) {
  // this.nativeElement = viewContainerRef.element.nativeElement;
  // }
}

@Directive({selector: 'tis-ipt'})
export class TisInputTool implements AfterContentInit {
  @Input() title: string;
  @Input() name: string;

  @ContentChild(TemplateRef, {static: false})
  contentTempate: TemplateRef<any>;


  ngAfterContentInit(): void {
    // console.info(this.contentTempate.elementRef.nativeElement.innerHTML);
    // console.info("dddddd");
    // console.info(  this.viewContainerRef.element.nativeElement.innerHTML);
  }

  constructor(public viewContainerRef: ViewContainerRef) {

  }

  // @ContentChild(TemplateRef) contentTempate: TemplateRef<any>;
  // nativeElement: any;

  // constructor(viewContainerRef: ViewContainerRef) {
  // this.nativeElement = viewContainerRef.element.nativeElement;
  // }
}


// @ts-ignore
@Directive({
  selector: '[tis-ipt-content]'
})
export class InputContentDirective implements OnInit {
  // @Input('row') row: any;
  @Input('ipt-meta') iptMeta: TisInputTool;

  constructor(private viewContainerRef: ViewContainerRef) {
  }

  ngOnInit(): void {

    if (this.iptMeta.contentTempate) {
      this.viewContainerRef.createEmbeddedView(
        this.iptMeta.contentTempate
        , {'i': {id: 'ipt-' + this.iptMeta.name, name: this.iptMeta.name}}
      );
    }
  }
}

// <input type="text" class="form-control" id="staticEmail" value="email@example.com">
@Component({
  selector: 'tis-form',
  template: `
      <ng-content select="tis-page-header"></ng-content>

      <form nz-form #form>
          <nz-form-item *ngFor="let i of inputs">
              <nz-form-label [nzSm]="6" [nzXs]="24" [nzFor]="'ipt-'+i.name">{{i.title}}</nz-form-label>
              <nz-form-control [nzSm]="14" [nzXs]="24">
                  <ng-template tis-ipt-content [ipt-meta]="i"></ng-template>
              </nz-form-control>
          </nz-form-item>
      </form>
  `,

})
export class FormComponent implements AfterContentInit {

  @ContentChildren(TisInputTool) ipts: QueryList<TisInputTool>;
  @Input() title: string;


  @ViewChild('form', {static: false}) _form: ElementRef;

  constructor() {

  }

  public get form(): String {
    // console.info((jQuery(this._form.nativeElement).serialize()));
    return (jQuery(this._form.nativeElement).serialize());
  }

  get inputs(): TisInputTool[] {
    return this.ipts.toArray();
  }

  ngAfterContentInit() {
  }


}
