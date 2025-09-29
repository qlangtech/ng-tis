/**
 *   Licensed to the Apache Software Foundation (ASF) under one
 *   or more contributor license agreements.  See the NOTICE file
 *   distributed with this work for additional information
 *   regarding copyright ownership.  The ASF licenses this file
 *   to you under the Apache License, Version 2.0 (the
 *   "License"); you may not use this file except in compliance
 *   with the License.  You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import {CurrentCollection} from "./basic.form.component";
import {Application, AppType} from "./application";
import {LocalStorageService} from "./local-storage.service";
import {Router} from "@angular/router";
import {TISService} from "./tis.service";
import {TISBaseProfile} from "./navigate.bar.component";

const maxQueueSize = 8;
const KEY_LOCAL_STORAGE_LATEST_INDEX = 'LatestSelectedIndex';

export class SelectedIndex {
  public timestamp: number;

  constructor(public name: string, public appType: AppType) {
    if (!appType) {
      throw new Error("param appType can not be null");
    }
    this.timestamp = (new Date()).getTime();
  }
}


export class LatestSelectedIndex {
  private _queue: Array<SelectedIndex> = [];

  constructor(public localLatestIndexKey: string) {
  }

  public static popularSelectedIndex(tisMeta: TISBaseProfile, _localStorageService: LocalStorageService): LatestSelectedIndex {


    let tisVer = tisMeta.tisMeta.buildVersion;
    let localLatestIndexKey = KEY_LOCAL_STORAGE_LATEST_INDEX + "_" + tisVer;
    //  console.log(localLatestIndexKey);
    let popularSelected: LatestSelectedIndex = _localStorageService.get(localLatestIndexKey);

    if (popularSelected) {
      popularSelected = Object.assign(new LatestSelectedIndex(localLatestIndexKey), popularSelected); // $.extend(, );
    } else {
      popularSelected = new LatestSelectedIndex(localLatestIndexKey);
      _localStorageService.set(localLatestIndexKey, popularSelected);
    }
    return popularSelected;


    // let tisVer =  tisService.tisMeta.tisMeta.buildVersion ;

  }

  public static routeToApp(tisService: TISService, _localStorageService: LocalStorageService, r: Router, app: Application): Promise<Array<SelectedIndex>> {
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

      return tisService.tisMeta.then((meta) => {
        let popularSelected: LatestSelectedIndex = meta.latestSelectedAppsIndex();
        popularSelected.add(new SelectedIndex(app.projectName, app.appType));
        _localStorageService.set(popularSelected.localLatestIndexKey, popularSelected);
        return popularSelected.popularLatestSelected;
      })

    }
  }

  public remove(_localStorageService: LocalStorageService, app: CurrentCollection) {
    let findIndex = this._queue.findIndex((r) => {
      return (r.name === app.name && r.appType === app.appTyp);
    });
    if (findIndex > -1) {
      this._queue.splice(findIndex, 1)
    }

    _localStorageService.set(this.localLatestIndexKey, this);
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


