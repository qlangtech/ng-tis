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

// import {Injectable} from '@angular/core';
// import {ScriptStore} from './script.store';
//
// declare var document: any;
//
// @Injectable()
// export class ScriptService {
//
//   private scripts: any = {};
//
//   constructor() {
//     ScriptStore.forEach((script: any) => {
//       this.scripts[script.name] = {
//         loaded: false,
//         src: script.src
//       };
//     });
//   }
//
//   load(...scripts: string[]): Promise<any[]> {
//     let promises: any[] = [];
//     scripts.forEach((script) => promises.push(this.loadScript(script)));
//     return Promise.all(promises);
//   }
//
//   loadScript(name: string) {
//     return new Promise((resolve, reject) => {
//       // resolve if already loaded
//       if (this.scripts[name].loaded) {
//         resolve({script: name, loaded: true, status: 'Already Loaded'});
//       } else {
//         // load script
//         let script = document.createElement('script');
//         script.type = 'text/javascript';
//         script.src = this.scripts[name].src;
//         if (script.readyState) {  // IE
//           script.onreadystatechange = () => {
//             if (script.readyState === 'loaded' || script.readyState === 'complete') {
//               script.onreadystatechange = null;
//               this.scripts[name].loaded = true;
//               resolve({script: name, loaded: true, status: 'Loaded'});
//             }
//           };
//         } else {  // Others
//           script.onload = () => {
//             this.scripts[name].loaded = true;
//             resolve({script: name, loaded: true, status: 'Loaded'});
//           };
//         }
//         script.onerror = (error: any) => resolve({script: name, loaded: false, status: 'Loaded'});
//         document.getElementsByTagName('head')[0].appendChild(script);
//       }
//     });
//   }
//
// }
