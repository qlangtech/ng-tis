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

interface Scripts {
  name: string;
  src: string;
}
// <script src="$manageModule.setTarget('/js/codemirror/codemirror.js')"></script>
// <script src="$manageModule.setTarget('/js/codemirror/xml.js')"></script>

export const ScriptStore: Scripts[] = [
  {name: 'codeMirror', src: '/runtime/js/codemirror/codemirror.js'},
  {name: 'codeMirrorXml', src: '/runtime/js/codemirror/xml.js'},
  {name: 'codeMirrorCLike', src: '/runtime/js/codemirror/clike.js'}
];
