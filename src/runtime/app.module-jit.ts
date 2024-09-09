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

import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule} from "@angular/forms";
import {RouterModule} from "@angular/router";
import {registerLocaleData} from '@angular/common';
import zh from '@angular/common/locales/zh';
import {AppComponent} from "./app.component";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TISService} from "../common/tis.service";
import {TisCommonModule} from "../common/common.module";
import {RootWelcomeComponent} from "./root-welcome-component";
import {MarkdownModule, MarkedOptions, MarkedRenderer} from 'ngx-markdown';
import {NZ_I18N, zh_CN} from "ng-zorro-antd/i18n";
import {NzMessageService} from "ng-zorro-antd/message";
import {TRASH_FOLDER_ID_TOKEN} from "@zeppelin/interfaces";
import {NZ_CODE_EDITOR_CONFIG} from "@zeppelin/share/code-editor";
import {loadMonaco} from "@zeppelin/app.module";
import {NzIconService} from "ng-zorro-antd/icon";
import {IconDefinition} from "@ant-design/icons-angular";
import {LocalStorageService} from "angular-2-local-storage";


const local_endtype_icons = 'local_endtype_icons';
registerLocaleData(zh);

export function markedOptionsFactory(): MarkedOptions {
  const renderer = new MarkedRenderer();

  renderer.link = (href: string | null, title: string | null, text: string) => {
    return `<a href="${href}" target="_blank">${text}</a>`;
  };
  return {
    renderer: renderer
  };
}

// https://github.com/angular/angular/issues/11075 loadChildren 子模块不支持aot编译的问题讨论
// router 的配置
// @ts-ignore
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
        loadChildren: () => import( "../base/base.manage.module").then(m => m.BasiManageModule)
      },
      {  // 用户权限
        path: 'usr',
        loadChildren: () => import("../user/user.module").then(m => m.UserModule)
      },
      {   // 离线模块
        path: 'offline',
        loadChildren: () => import("../offline/offline.module").then(m => m.OfflineModule)
      },
      {   // 索引控制台
        path: 'c/:name',
        loadChildren: () => import("./core.node.manage.module").then(m => m.CoreNodeManageModule)
      },
      {   // datax控制台
        path: 'x/:name',
        loadChildren: () => import("../datax/datax.module").then(m => m.DataxModule)
      },
      {
        path: 'z/zeppelin',
        loadChildren: () => import('@zeppelin/pages/workspace/workspace.module').then(m => m.WorkspaceModule),
        outlet: "zeppelin"
      },
      {
        path: 'z/zpl',
        loadChildren: () => import('../zeppelin_app/pages/workspace/workspace.module').then(m => m.WorkspaceModule),
      },
    ])
  ],
  declarations: [AppComponent, RootWelcomeComponent
    // CodemirrorComponent///
  ],
  exports: [],
  entryComponents: [],
  bootstrap: [AppComponent],
  // bootstrap: [CodemirrorComponent],
  providers: [TISService, NzIconService, NzMessageService
    , {provide: NZ_I18N, useValue: zh_CN},
    {
      provide: TRASH_FOLDER_ID_TOKEN,
      useValue: '~Trash'
    },
    {
      provide: NZ_CODE_EDITOR_CONFIG,
      useValue: {
        defaultEditorOption: {
          scrollBeyondLastLine: false,
          lineHeight: 20
        },
        onLoad: loadMonaco
      }
    }
  ]

})
export class AppModule {

  private appendIconService(iconService: NzIconService, iconDefs: Array<TISIconDefinition>): void {

    let id: TISIconDefinition = null;
    let ref: IconDefinition = null;
    let iconMap: Map<string, TISIconDefinition> = new Map<string, TISIconDefinition>();

    for (let i = 0; i < iconDefs.length; i++) {
      id = iconDefs[i];
      iconMap.set(id.name + "_" + id.theme, id);
    }

    for (let i = 0; i < iconDefs.length; i++) {
      id = iconDefs[i];
      if (id.ref) {
        ref = iconMap.get(id.ref + "_" + id.theme);
        if (!ref) {
          throw new Error("resource reference:'" + id.ref + "_" + id.theme + "' can not be null");
        }
        iconService.addIcon({name: id.name, theme: id.theme, icon: ref.icon});
      } else {
        if (id.icon) {
          iconService.addIcon(iconDefs[i]);
        }else{
          ref = iconMap.get(id.name + "_fill"  );
          if (!ref) {
            throw new Error("resource:'" + id.name + "_" + id.theme + "' can not find relevant schema of 'fill' type");
          }
          iconService.addIcon({name: id.name, theme: id.theme, icon: ref.icon});
        }

      }
    }
  }

  constructor(iconService: NzIconService, tisService: TISService, _localStorageService: LocalStorageService) {
    let localEndTypesIcons: LocalEndtypeIcons = _localStorageService.get(local_endtype_icons)
    // console.log(localEndTypesIcons);
    let requestBody = `action=plugin_action&emethod=get_endtype_icons`;
    if (localEndTypesIcons) {
      requestBody += ("&vertoken=" + localEndTypesIcons.verToken);
      this.appendIconService(iconService, localEndTypesIcons.iconsDefs);
    }

    tisService.httpPost('/coredefine/corenodemanage.ajax', requestBody)
      .then((result) => {
        let r: LocalEndtypeIcons = result.bizresult;

        if (r.iconsDefs.length > 0) {
          this.appendIconService(iconService, r.iconsDefs);
          _localStorageService.set(local_endtype_icons, r);
        }


        // console.log("xxxxxxxxxxxxxxxxxxxxx");
      });
    // })();
    //


  }

}

interface LocalEndtypeIcons {
  // 引用其他类型的Icon
  iconsDefs: Array<TISIconDefinition>;
  verToken: string;
}

interface TISIconDefinition extends IconDefinition {
  // 引用其他类型的Icon
  ref: string;
}
