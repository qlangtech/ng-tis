/**
 * Created by baisui on 2017/4/18 0018.
 */
import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'consuming'})
export class ConsumeTimePipe implements PipeTransform {

  transform(value: number, args?: string[]): any {
    let t = new Date();
    t.setTime(value);
    return  t.getHours() + ':' + t.getMinutes() + ':' + t.getSeconds();
  }
}
