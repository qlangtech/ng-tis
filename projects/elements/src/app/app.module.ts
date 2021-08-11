import {BrowserModule} from '@angular/platform-browser';
import {Injector, NgModule} from '@angular/core';
import {TisCommonModule} from "../../../../src/common/common.module";
import {DataxAddComponent} from "../../../../src/base/datax.add.component";
import {createCustomElement} from "@angular/elements";
import {TISService} from "../../../../src/service/tis.service";
import {RouterModule} from "@angular/router";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";


@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    TisCommonModule,
    RouterModule.forRoot([])
  ],
  providers: [TISService],
  entryComponents: [DataxAddComponent]
})
export class AppModule {
  constructor(private injector: Injector) {
  }

  ngDoBootstrap() {
    const element = createCustomElement(DataxAddComponent, {injector: this.injector});
    customElements.define('tis-add-datax', element);
  }
}
