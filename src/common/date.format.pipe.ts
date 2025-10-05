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

/**
 * Created by baisui on 2017/4/18 0018.
 */
import {Pipe, PipeTransform} from '@angular/core';
import {ItemPropVal} from "./tis.plugin";

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

@Pipe({name: 'itemPropFilter'})
export class ItemPropValPipe implements PipeTransform {

  transform(value: ItemPropVal[], all = false): ItemPropVal[] {
    if (all) {
      return value;
    }
    return value.filter((ip) => {
      return !ip.advance;
    });
  }
}

@Pipe({name: 'errormsg'})
export class ErrorMsgPipe implements PipeTransform {

  // @ts-ignore
  transform(value: any): string {
    if (typeof value === 'string') {
      return value
    }

    if (value && value.message) {
      return value.message;
    }
  }
}


@Pipe({
  name: 'maxLength'
})
export class MaxLengthPipe implements PipeTransform {

  transform(value: string, maxLength: number): string {
    if (value && maxLength > 0) {
      return value.length > maxLength ? value.substring(0, maxLength) + '...' : value;
    }
    return value;
  }
}
