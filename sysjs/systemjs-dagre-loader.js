
const stringRegex = /^.+\/(\w+\.\w+)/i;

module.exports.transform = function (_id, source) {
 // console.log(source);
  return source;
};

// module.exports.locate = function(load){
//
//  var rewriteMap
//    = {'order.js':   'http://localhost:8080/node_modules/dagre/lib/order/index.js',
//       'rank.js':    'http://localhost:8080/node_modules/dagre/lib/rank/index.js',
//       'position.js':'http://localhost:8080/node_modules/dagre/lib/position/index.js'};
//
//   // console.log(load.address);
//  var d =  stringRegex.exec(load.address);
//  if(d && rewriteMap[d[1]]){
//    console.log(load);
//    return rewriteMap[d[1]];
//  }else{
//    return load.address;
//  }
//
// }

var systemNormalize = System.normalize;
// override the normalization function
// System.normalize = function(name, parentName, parentAddress) {
//  // console.log("ddddddddddd");
//
//   console.log({
//     'name': name,
//     'parentName': parentName,
//     'parentAddress': parentAddress
//   });
//
//   if (name == 'my/custom/rule')
//     return 'custom/name';
//   else
//     return systemNormalize.call(this, name, parentName, parentAddress);
// }
//
module.exports.normalize = function(name, parentName, parentAddress) {



  return name;
}

module.exports.translate = function(load){
 // console.log(load);
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
