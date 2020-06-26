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
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
// import {ScriptService} from "../service/script.service";
import {TisCommonModule} from "../common/common.module";
import {CorenodemanageComponent} from "./corenodemanage.component";
import {RootWelcomeComponent} from "./root-welcome-component";


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
// https://github.com/angular/angular/issues/11075 loadChildren 子模块不支持aot编译的问题讨论
// router 的配置
@NgModule({
  id: 'tisRoot',
  imports: [BrowserModule, FormsModule, NgbModule, TisCommonModule,
    BrowserAnimationsModule,
    RouterModule.forRoot([
      {  // 索引一览
        path: '',
        component: RootWelcomeComponent
      },
      {  // 索引一览
        path: 'base',
        loadChildren: "../base/base.manage.module#BasiManageModule" // baseModuleFactory
      },
      {  // 用户权限
        path: 'usr',
        loadChildren: "../user/user.module#UserModule"
      },
      {   // 离线模块
        path: 'offline',
        loadChildren: "../offline/offline.module#OfflineModule"
        // loadChildren: () => import('../offline/offline.module').then(m => m.OfflineModule)
      },
      {   // 索引控制台
        path: 'c/:name',
        loadChildren: "./core.node.manage.module#CoreNodeManageModule"
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
