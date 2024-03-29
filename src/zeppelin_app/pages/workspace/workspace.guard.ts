/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Injectable} from '@angular/core';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import {of, Observable} from 'rxjs';
import {catchError, mapTo, map, tap} from 'rxjs/operators';

import {MessageService, TicketService} from '@zeppelin/services';
import {TisResponseResult} from "../../../common/tis.plugin";

@Injectable({
  providedIn: 'root'
})
export class WorkspaceGuard implements CanActivate {
  constructor(private ticketService: TicketService, private route: ActivatedRoute, private router: Router, private messageService: MessageService) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // console.log(this.route);
    return this.ticketService.getTicket().pipe(
      //  mapTo(true),
      map((val: TisResponseResult) => {
        if (val.bizresult) {
          this.messageService.bootstrap();
        }
        return true;
      }),
      //  tap((val) => this.messageService.bootstrap()),
      //   catchError(() => of(this.router.parseUrl('/z/zeppelin/tis-have-not-prepared')))
    );
    // this.messageService.bootstrap();
    // return true;
  }
}
