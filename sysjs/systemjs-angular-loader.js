/*
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

var templateUrlRegex = /templateUrl\s*:(\s*['"`](.*?)['"`]\s*)/gm;
var stylesRegex = /styleUrls *:(\s*\[[^\]]*?\])/g;
var stringRegex = /(['`"])((?:[^\\]\\\1|.)*?)\1/g;
//exports.instantiate = function(load, opts) {


module.exports.transform = function (_id, source) {
 // console.log(source);
  return source;
};


module.exports.translate = function(load){

  return load;
  // var url = document.createElement('a');
  // url.href = load.address;
  //
  // var basePathParts = url.pathname.split('/');
  //
  // basePathParts.pop();
  // var basePath = basePathParts.join('/');
  //
  // var baseHref = document.createElement('a');
  // baseHref.href = this.baseURL;
  // baseHref = baseHref.pathname;
  //
  // basePath = basePath.replace(baseHref, '');
  //
  // load.source = load.source
  //   .replace(templateUrlRegex, function(match, quote, url){
  //     var resolvedUrl = url;
  //
  //     if (url.startsWith('.')) {
  //       resolvedUrl = basePath + url.substr(1);
  //     }
  //
  //     return 'templateUrl: "' + resolvedUrl + '"';
  //   })
  //   .replace(stylesRegex, function(match, relativeUrls) {
  //     var urls = [];
  //
  //     while ((match = stringRegex.exec(relativeUrls)) !== null) {
  //       if (match[2].startsWith('.')) {
  //         urls.push('"' + basePath + match[2].substr(1) + '"');
  //       } else {
  //         urls.push('"' + match[2] + '"');
  //       }
  //     }
  //
  //     return "styleUrls: [" + urls.join(', ') + "]";
  //   });
  //
  // return load;
};
