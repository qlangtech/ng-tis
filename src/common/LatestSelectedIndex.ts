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

import {CurrentCollection} from "./basic.form.component";
import {Application, AppType} from "../index/application";
import {LocalStorageService} from "angular-2-local-storage";
import {Router} from "@angular/router";

const maxQueueSize = 8;
const KEY_LOCAL_STORAGE_LATEST_INDEX = 'LatestSelectedIndex';

export class SelectedIndex {
  public timestamp: number;

  constructor(public name: string, public appType: AppType) {
    this.timestamp = (new Date()).getTime();
  }
}


export class LatestSelectedIndex {
  private _queue: Array<SelectedIndex> = [];

  public static popularSelectedIndex(_localStorageService: LocalStorageService): LatestSelectedIndex {
    let popularSelected: LatestSelectedIndex = _localStorageService.get(KEY_LOCAL_STORAGE_LATEST_INDEX);

    if (popularSelected) {
      popularSelected = Object.assign(new LatestSelectedIndex(), popularSelected); // $.extend(, );
    } else {
      popularSelected = new LatestSelectedIndex();
    }
    return popularSelected;
  }

  public static routeToApp(_localStorageService: LocalStorageService, r: Router, app: Application): Array<SelectedIndex> {
    // console.log(app);
    switch (app.appType) {
      case AppType.DataX:
        r.navigate(['/x/' + app.projectName]);
        break;
      case AppType.Solr:
        r.navigate(['/c/' + app.projectName]);
        break;
      default:
        throw new Error(`Error Type:${app.appType}`);
    }
    if (_localStorageService) {
      let popularSelected: LatestSelectedIndex = _localStorageService.get(KEY_LOCAL_STORAGE_LATEST_INDEX);
      if (!popularSelected) {
        popularSelected = new LatestSelectedIndex();
      } else {
        // Object.assign()
        popularSelected = Object.assign(new LatestSelectedIndex(), popularSelected);
      }
      // console.log(app);
      popularSelected.add(new SelectedIndex(app.projectName, app.appType));
      _localStorageService.set(KEY_LOCAL_STORAGE_LATEST_INDEX, popularSelected);
      // console.log(popularSelected.popularLatestSelected);
      // this.collectionOptionList = popularSelected.popularLatestSelected;
      return popularSelected.popularLatestSelected;
    }
  }

  public add(i: SelectedIndex): void {

    let find = this._queue.find((r) => r.name === i.name);
    if (find) {
      find.timestamp = i.timestamp;
      this._sort();
      return;
    }

    if (this._queue.length < maxQueueSize) {
      this._queue.push(i);
      this._sort();
      return;
    }

    let min = this._queue[0];
    let minIndex = 0;

    let s: SelectedIndex;
    for (let j = 0; j < this._queue.length; j++) {
      s = this._queue[j];
      // if (s.name === i.name) {
      //   s.count++;
      //   return;
      // }
      if (min.timestamp > s.timestamp) {
        min = s;
        minIndex = j;
      }
    }
    this._queue[minIndex] = i;
    // this._queue.sort((a, b) => (b.timestamp - a.timestamp));
    this._sort();
    // console.log(this._queue);
  }

  public addIfNotContain(idx: CurrentCollection): void {

    let find = this._queue.find((r) => {
      return r.name === idx.name;
    });

    if (find) {
      return;
    }

    this.add(new SelectedIndex(idx.name, idx.appTyp));
  }

  private _sort(): void {
    this._queue.sort((a, b) => (b.timestamp - a.timestamp));
  }

  public get popularLatestSelected(): Array<SelectedIndex> {
    // return this._queue.map((r) => r.name);
    return this._queue;
  }

}


