import {TISService} from '../service/tis.service';
import {Component} from '@angular/core';

// import 'ng-zorro-antd/../ng-zorro-antd.min.css';

@Component({
  template: `
    <my-navigate></my-navigate>
    <div class="body_content">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [
      `
    `
  ]
})
export class OffileIndexComponent {
  constructor(private tisService: TISService) {

  }
}
