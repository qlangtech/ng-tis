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
    <fieldset >
      <ng-content select="tis-page-header"></ng-content>

      <form #form>
        <div *ngFor="let i of inputs" class="form-group row">
          <label [for]="'ipt-'+i.name" class="col-sm-2 col-form-label">{{i.title}}</label>
          <div class="col-sm-10">
            <ng-template tis-ipt-content [ipt-meta]="i"></ng-template>
          </div>
        </div>
      </form>
    </fieldset>
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
