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

import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {NotebookComponent} from './notebook.component';
import {NotebookTestComponent} from "@zeppelin/pages/workspace/notebook/notebook.test.component";

//console.log("NotebookRoutingModule");
const routes: Routes = [
  {
    path: ':noteId',
    component: NotebookComponent
  },
  {
    path: 'test/test'
    , component: NotebookTestComponent
  },
  {
    path: ':noteId/revision/:revisionId',
    component: NotebookComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotebookRoutingModule {
}
