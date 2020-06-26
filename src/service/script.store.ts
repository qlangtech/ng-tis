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
