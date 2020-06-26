import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector : '[tis-index-add-flow]'
})
export class AddAppFlowDirective  {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
