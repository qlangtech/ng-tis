/**
 * Created by baisui on 2017/3/29 0029.
 */
// import {Http} from '@angular/http';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import {TISService} from './tis.service';
import {HttpClient} from "@angular/common/http";

export class BasicService {

  constructor(protected http: HttpClient, protected tisService: TISService) {

  }

  protected handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
