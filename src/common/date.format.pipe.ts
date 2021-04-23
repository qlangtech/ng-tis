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

/**
 * Created by baisui on 2017/4/18 0018.
 */
import {Pipe, PipeTransform} from '@angular/core';

// @Pipe({name: 'dateformat'})
// export class DateFormatPipe implements PipeTransform {
//
//   transform(value: number, args?: string[]): any {
//     let t = new Date();
//     t.setTime(value);
//     return t.getFullYear() + '/' + t.getMonth() + '/' + t.getDate() + ' ' + t.getHours() + ':' + t.getMinutes();
//   }
// }


@Pipe({name: 'timeconsume'})
export class TimeConsumePipe implements PipeTransform {

  transform(value: number, args?: string[]): any {
    let diff = (value / 1000);
    // tslint:disable-next-line:no-bitwise
    let sec = (diff % 60) | 0;
    diff = diff / 60;
    // tslint:disable-next-line:no-bitwise
    let m = ((diff % 60)) | 0;
    // tslint:disable-next-line:no-bitwise
    let h = (diff / 60) | 0;
    if (h > 0) {
      return `${h}小时 ${m}分 ${sec}秒`;
    } else if (m > 0) {
      return `${m}分 ${sec}秒`;
    } else {
      return `${sec}秒`;
    }
  }
}
