import {
  AfterContentChecked,
  AfterContentInit, AfterViewInit, ChangeDetectionStrategy,
  Component, ContentChild,
  ContentChildren,
  Directive, ElementRef, EmbeddedViewRef,
  // EventEmitter,
  Input, OnInit,
  // Output,
  QueryList, TemplateRef, ViewChild,
  ViewContainerRef
} from "@angular/core";
import {IFieldError, Item, ItemPropVal} from "./tis.plugin";
import {NzInputDirective, NzSelectComponent} from "ng-zorro-antd";
// import {ActivatedRoute, Router} from "@angular/router";

declare var jQuery: any;

@Directive({selector: '[tis-ipt-prop]'})
export class TisInputProp implements AfterContentInit {
  // @Input('tis-ipt-prop') prop: { id: string, name: string };

  ngAfterContentInit(): void {
    // let e = this.viewContainerRef.element.nativeElement;
    // e.id = this.prop.id;
    // e.name = this.prop.name;
    // e.className = 'form-control';
  }

  constructor(public viewContainerRef: ViewContainerRef) {

  }
}

@Component({
  selector: 'tis-ipt',
  template: `
      <ng-template #inputTpl>
          <ng-content></ng-content>
      </ng-template>`
})
export class TisInputTool implements OnInit, AfterContentInit, AfterViewInit, AfterContentChecked {
  static emptyItemPropVal = new ItemPropVal();
  @Input() title: string;
  @Input() name: string;
  @Input() require: boolean;

  itemProp: ItemPropVal = TisInputTool.emptyItemPropVal;
  @ContentChildren(NzInputDirective) ipts: QueryList<NzInputDirective>;

  @ContentChildren(NzSelectComponent) select: QueryList<NzSelectComponent>;

  @ContentChildren(TisInputProp) inputProps: QueryList<TisInputProp>;


  @ViewChild("inputTpl", {static: true}) contentTempate: TemplateRef<any>;

  ngOnInit(): void {
  }

  ngAfterContentChecked(): void {

  }

  ngAfterContentInit(): void {
    this.ipts.forEach((ipt) => {
      if (ipt.ngControl) {
        ipt.ngControl.name = this.name;
        ipt.ngControl.valueChanges.subscribe((val) => {
          delete this.itemProp.error;
          // this.itemProp = Object.assign(this.itemProp);
          // console.log(this.itemProp);
        });
      }
    })

    this.select.forEach((s) => {
      s.nzFocus.subscribe(() => {
        delete this.itemProp.error;
      });
    });

    this.inputProps.forEach((ip) => {
      console.log("============");
      console.log(ip.viewContainerRef.element.nativeElement.innerHTML);
    })
  }

  ngAfterViewInit(): void {
    this.select.forEach((s) => {
      // s.nzAllowClear = true;
    });
    // console.log("ngAfterViewInit");
    // let e = jQuery(this.contentTempate.elementRef.nativeElement);
    // e.on("click", function () {
    //   console.log("on click");
    // })
  }

  constructor(public viewContainerRef: ViewContainerRef) {

  }
}

// https://stackoverflow.com/questions/49127877/render-elements-of-querylist-in-the-template
@Component({
  selector: 'tis-form',
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
      <ng-content select="tis-page-header"></ng-content>

      <form nz-form #form>
          <nz-form-item *ngFor="let i of ipts">
              <nz-form-label [nzRequired]="i.require" [nzSm]="6" [nzXs]="24" [nzFor]="i.name">{{i.title}}</nz-form-label>
              <nz-form-control [nzSm]="14" [nzXs]="24" [nzValidateStatus]="i.itemProp.validateStatus" [nzHasFeedback]="i.itemProp.hasFeedback" [nzErrorTip]="i.itemProp.error">
                  <!--
                    <ng-template tis-ipt-content [ipt-meta]="i"></ng-template>
                     https://stackoverflow.com/questions/49127877/render-elements-of-querylist-in-the-template
                    -->
                  <ng-container *ngTemplateOutlet="i.contentTempate"></ng-container>
              </nz-form-control>
          </nz-form-item>
      </form>
  `,
})
export class FormComponent implements AfterContentInit, OnInit {
  @ContentChildren(TisInputTool) ipts: QueryList<TisInputTool>;
  @Input() title: string;
  _fieldsErr: Item = Item.create([]);
  @Input() set fieldsErr(val: Item) {
   // console.log("fieldsErr");
    this._fieldsErr = val;
    if (this.ipts) {
      this.ngAfterContentInit();
    }
  }

  @ViewChild('form', {static: false}) _form: ElementRef;

  fields: TisInputTool[] = [];

  constructor() {

  }

  ngOnInit(): void {
  }

  ngAfterContentInit() {
   // console.log(this.ipts);
    let tplFields = this.ipts.toArray();
    tplFields.map((input) => {
      input.itemProp = this.fieldErr(input.name);
    });
    this.fields = tplFields;
  }

  fieldErr(field: string): ItemPropVal {
    let item = this._fieldsErr.vals[field];
    if (!item) {
      return TisInputTool.emptyItemPropVal;
    } else {
      return item;
    }
  }

  public get form(): String {
    // console.info((jQuery(this._form.nativeElement).serialize()));
    return (jQuery(this._form.nativeElement).serialize());
  }
}


// @Directive({selector: 'tis-ipt'})


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

    // if (this.iptMeta.contentTempate) {
    //   let embed = this.viewContainerRef.createEmbeddedView(
    //     this.iptMeta.contentTempate
    //     , {'i': {id: 'ipt-' + this.iptMeta.name, name: this.iptMeta.name}}
    //   );
    //
    //  // console.log(  this.iptMeta.contentTempate.elementRef.nativeElement );
    // }
  }
}


