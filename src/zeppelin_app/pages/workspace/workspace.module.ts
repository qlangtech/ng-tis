/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {CommonModule} from '@angular/common';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Router, RouterModule} from '@angular/router';

// import { HeliumManagerModule } from '@zeppelin/helium-manager';
// import { ShareModule } from '@zeppelin/share';

import {NzMessageModule, NzMessageService} from 'ng-zorro-antd/message';
import {WorkspaceComponent} from './workspace.component';

import {WorkspaceRoutingModule} from './workspace-routing.module';
import {NzFormModule} from 'ng-zorro-antd/form';
import {ShareModule} from "@zeppelin/share";
import {HeliumManagerModule} from "@zeppelin/helium-manager";
import {AppHttpInterceptor} from "@zeppelin/app-http.interceptor";
import {TicketService} from "@zeppelin/services";
import {NZ_CODE_EDITOR_CONFIG} from "@zeppelin/share/code-editor";
import {loadMonaco} from "@zeppelin/app.module";
import {MESSAGE_INTERCEPTOR, TRASH_FOLDER_ID_TOKEN} from "@zeppelin/interfaces";
import {AppMessageInterceptor} from "@zeppelin/app-message.interceptor";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {NzModalService} from "ng-zorro-antd/modal";
import {RUNTIME_COMPILER_PROVIDERS} from "@zeppelin/app-runtime-compiler.providers";

@NgModule({
  declarations: [WorkspaceComponent],
  imports: [
    CommonModule,
    WorkspaceRoutingModule,
    FormsModule,
    HttpClientModule,
    ShareModule,
    RouterModule,
    HeliumManagerModule,
    NzMessageModule,
    NzFormModule
  ],
  providers: [
    ...RUNTIME_COMPILER_PROVIDERS,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AppHttpInterceptor,
      multi: true,
      deps: [TicketService]
    },
    {
      provide: NZ_CODE_EDITOR_CONFIG,
      useValue: {
        defaultEditorOption: {
          scrollBeyondLastLine: false
        },
        onLoad: loadMonaco
      }
    },
    {
      provide: MESSAGE_INTERCEPTOR,
      useClass: AppMessageInterceptor,
      deps: [Router, NzNotificationService, TicketService, NzModalService]
    }
    // {
    //   provide: TicketService,
    //   deps: [NzMessageService]
    // }
  ]
})
export class WorkspaceModule {
}
