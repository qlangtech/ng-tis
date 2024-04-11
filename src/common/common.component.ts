import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewInit,
  Component,
  ContentChildren,
  Input,
  OnInit, QueryList, TemplateRef, ViewChild, ViewContainerRef
} from "@angular/core";
import {ItemPropVal} from "./tis.plugin";
import {NzInputDirective} from "ng-zorro-antd/input";
import {NzSelectComponent} from "ng-zorro-antd/select";
import {TisInputProp} from "./form.component";

@Component({
  selector: 'blibli',
  template: `
    <span> <i style="font-size: 20px;display: inline-block;margin-right: 10px;margin-left: 10px" nz-icon nzType="blibli" nzTheme="fill"></i>
                  <a target="_blank" href="https://www.bilibili.com/video/{{videoId}}"><ng-content></ng-content></a></span>
  `
})
export class BliBliComponent {

  @Input()
  videoId:string;

}
