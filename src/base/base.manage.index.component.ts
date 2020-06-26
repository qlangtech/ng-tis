import {TISService} from '../service/tis.service';
import {Component} from '@angular/core';

@Component({
  // templateUrl: '/runtime/baseManageIndex.htm'
  template: `
    <my-navigate></my-navigate>
    <div class="body_content">
      <router-outlet></router-outlet>
    </div>
  `
})
export class BaseMangeIndexComponent {
  constructor(private tisService: TISService) {

  }
}
