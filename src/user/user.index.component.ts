import {TISService} from '../service/tis.service';
import {Component} from '@angular/core';

@Component({
  template: '<my-navigate></my-navigate><router-outlet></router-outlet>'
})
export class UserIndexComponent {
  constructor(private tisService: TISService) {

  }
}
