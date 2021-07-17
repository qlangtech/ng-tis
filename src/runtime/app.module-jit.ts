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

import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule} from "@angular/forms";
import {RouterModule} from "@angular/router";
// import {HttpModule, JsonpModule} from "@angular/http";
import {NZ_I18N, zh_CN} from 'ng-zorro-antd';
import {registerLocaleData} from '@angular/common';
import zh from '@angular/common/locales/zh';
import {AppComponent} from "./app.component";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TISService} from "../service/tis.service";
//
// import {ScriptService} from "../service/script.service";
import {TisCommonModule} from "../common/common.module";
import {CorenodemanageComponent} from "./corenodemanage.component";
import {RootWelcomeComponent} from "./root-welcome-component";
import {MarkdownModule, MarkedOptions, MarkedRenderer} from 'ngx-markdown';


// export function offlineModuleFactory() {
//   return import("../offline/offline.module").then(mod => mod.OfflineModule);
// }
//
// export function usrModuleFactory() {
//   return import("../user/user.module").then(mod => mod.UserModule);
// }
//
// export function coreModuleFactory() {
//   return import("./core.node.manage.module").then(mod => mod.CoreNodeManageModule);
// }
//
// export function baseModuleFactory() {
//   return import("../base/base.manage.module").then(mod => mod.BasiManageModule);
// }

registerLocaleData(zh);

export function markedOptionsFactory(): MarkedOptions {
  const renderer = new MarkedRenderer();

  renderer.link = (href: string | null, title: string | null, text: string) => {
    return `<a href="${href}" target="_blank">${text}</a>`;
  };
  // renderer.code = (code: string, language: string | undefined, isEscaped: boolean) => {
  //   return '<code></code>';
  // };

  return {
    renderer: renderer
  };
}

// https://github.com/angular/angular/issues/11075 loadChildren 子模块不支持aot编译的问题讨论
// router 的配置
@NgModule({
  id: 'tisRoot',
  imports: [BrowserModule, FormsModule, TisCommonModule,
    BrowserAnimationsModule,
    MarkdownModule.forRoot({
      markedOptions: {
        provide: MarkedOptions,
        useFactory: markedOptionsFactory
      }
    }),
    RouterModule.forRoot([
      {  // 索引一览
        path: '',
        component: RootWelcomeComponent
      },
      {  // 索引一览
        path: 'base',
        loadChildren: "../base/base.manage.module#BasiManageModule"
      },
      {  // 用户权限
        path: 'usr',
        loadChildren: "../user/user.module#UserModule"
      },
      {   // 离线模块
        path: 'offline',
        loadChildren: "../offline/offline.module#OfflineModule"
      },
      {   // 索引控制台
        path: 'c/:name',
        loadChildren: "./core.node.manage.module#CoreNodeManageModule"
      },
      {   // datax控制台
        path: 'x/:name',
        loadChildren: "../datax/datax.module#DataxModule"
      }
    ])
  ],
  declarations: [AppComponent, RootWelcomeComponent
    // CodemirrorComponent///
  ],
  exports: [],
  entryComponents: [],
  bootstrap: [AppComponent],
  // bootstrap: [CodemirrorComponent],
  providers: [TISService, {provide: NZ_I18N, useValue: zh_CN}]

})
export class AppModule {
  constructor() {
  }
}
