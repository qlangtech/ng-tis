import {AfterContentInit, Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {Subject, Unsubscribable} from "rxjs";
import {NgTerminal} from "ng-terminal";
import {WSMessage} from "./basic.form.component";

/**
 * Copyright (c) 2020 QingLang, Inc. <baisui@qlangtech.com>
 * <p>
 *   This program is free software: you can use, redistribute, and/or modify
 *   it under the terms of the GNU Affero General Public License, version 3
 *   or later ("AGPL"), as published by the Free Software Foundation.
 * <p>
 *  This program is distributed in the hope that it will be useful, but WITHOUT
 *  ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 *   FITNESS FOR A PARTICULAR PURPOSE.
 * <p>
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

@Component({
  template: `
      <ng-terminal #term></ng-terminal>
  `,
  styles: [
      `
    `
  ]
})
export class TerminalComponent implements AfterContentInit, OnInit, OnDestroy {

  logSubject: Subject<WSMessage>;
  @ViewChild('term', {static: true}) terminal: NgTerminal;

  subscription: Unsubscribable;

  ngAfterContentInit(): void {
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  ngOnInit(): void {
    if (!this.logSubject) {
      throw new Error("logSubject can not be null");
    }
    if (!this.terminal) {
      throw new Error("terminal can not be null");
    }
    this.subscription = this.logSubject.subscribe((msg) => {
      if (msg.logtype === 'full') {
        this.terminal.write(msg.data.msg + "\r\n");
      }
    });
  }

}
