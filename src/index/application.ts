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
 * Created by baisui on 2017/3/29 0029.
 */
export class Application {
  // constructor(public name: string,
  //             public tpl: string,
  //             public workflowId: number,
  //             public crontab: Crontab,
  //             public departmentId: number,
  //             public recept: string /*接口人*/) {
  // }
  appId: number;
  appType: AppType;
  createTime: number;
  dptId: number;
  dptName: string;
  projectName: string;
  recept: string;
  updateTime: number;
}

export enum AppType {
  DataX = 2,
  Solr = 1
}

export class Crontab {
}
