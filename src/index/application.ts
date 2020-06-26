
/**
 * Created by baisui on 2017/3/29 0029.
 */
export class Application {
  constructor(public name: string,
              public tpl: string,
              public workflowId: number,
              public crontab: Crontab,
              public departmentId: number,
              public recept: string /*接口人*/) {
  }

}

export class Crontab {
}
