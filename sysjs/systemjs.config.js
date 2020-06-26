/**
 * System configuration for Angular samples
 * Adjust as necessary for your application needs.
 */

(function (global) {
  var jsLoader = {
    defaultExtension: 'js',
    meta: {
      './*.js': {
        loader: '/sysjs/systemjs-angular-loader.js'
      }
    }
  };


  System.config({
    meta: {
      '*.css': {loader: 'css'}
    },
    paths: {
      // paths serve as alias
      'npm:': '/node_modules/'
    },
    // map tells the System loader where to look for things
    map: {
      // our app is within the app folder
      // './runtime': 'runtime',
      'xterm': 'npm:xterm',
      'chart.js': 'npm:chart.js',
      'moment': 'npm:moment',
      'ng-terminal': 'npm:ng-terminal',
      'ng2-charts': 'npm:ng2-charts',
      'angular-resizable-element': 'npm:angular-resizable-element/bundles/angular-resizable-element.umd.js',
      'lodash': 'npm:lodash',
      'graphlib': 'npm:graphlib',
      'date-fns': 'npm:date-fns',
      'css': 'npm:systemjs-plugin-css/css.js',
      'ng-zorro-antd': 'npm:ng-zorro-antd/bundles',
      'tinycolor2': 'npm:tinycolor2/tinycolor.js',
      '@ant-design/colors': 'npm:@ant-design/colors/lib/',
      '@ant-design/icons-angular': 'npm:@ant-design/icons-angular/bundles/ant-design-icons-angular.umd.js',
      '@ant-design/icons-angular/icons': 'npm:@ant-design/icons-angular/bundles/ant-design-icons-angular-icons.umd.js',

      'nprogress': 'npm:nprogress',
      'font-awesome': 'npm:font-awesome',
      // angular bundles
      '@angular/animations': 'npm:@angular/animations/bundles/animations.umd.js',
      '@angular/animations/browser': 'npm:@angular/animations/bundles/animations-browser.umd.js',
      '@angular/cdk': 'npm:@angular/cdk/bundles',
      '@angular/core': 'npm:@angular/core/bundles/core.umd.js',
      '@angular/common': 'npm:@angular/common/bundles/common.umd.js',
      '@angular/common/http': 'npm:@angular/common/bundles/common-http.umd.js',
      '@angular/compiler': 'npm:@angular/compiler/bundles/compiler.umd.js',
      '@angular/platform-browser': 'npm:@angular/platform-browser/bundles/platform-browser.umd.js',
      '@angular/platform-browser/animations': 'npm:@angular/platform-browser/bundles/platform-browser-animations.umd.js',
      '@angular/platform-browser-dynamic': 'npm:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',
      '@angular/http': 'npm:@angular/http/bundles/http.umd.js',
      '@angular/router': 'npm:@angular/router/bundles/router.umd.js',
      '@angular/forms': 'npm:@angular/forms/bundles/forms.umd.js',
      '@shopify/draggable': 'npm:@shopify/draggable/lib/draggable.bundle.js',
      '@antv/g6': 'npm:@antv/g6/build/g6.js',
      'dagre': 'npm:dagre',
      '@antv/plugins': 'npm:@antv/g6/build/plugins.js',
      'jquery': 'npm:jquery/dist/jquery.js',
      // other libraries
      'ng-sidebar': 'npm:ng-sidebar',
      'rxjs': 'npm:rxjs',
      'rxjs-compat': 'npm:rxjs-compat',
      'angular-in-memory-web-api': 'npm:angular-in-memory-web-api/bundles/in-memory-web-api.umd.js',
      // 百岁add
      'angular-2-local-storage': 'npm:angular-2-local-storage/bundles/angular-2-local-storage.umd.js',
      '@ng-bootstrap/ng-bootstrap': 'npm:@ng-bootstrap/ng-bootstrap',
      'popper.js': 'npm:popper.js/dist/umd/popper.js',
      'bootstrap4': 'npm:bootstrap',
      // 'angular-tree-component': 'npm:angular-tree-component/dist/angular-tree-component.umd.js',
      'codemirror': 'npm:codemirror'
    },
    // packages tells the System loader how to load when no filename and/or no extension
    packages: {
      'moment' :{
        main: 'moment.js',
        defaultExtension : 'js'
      },
      'chart.js' :{
        main: 'dist/Chart.js',
        defaultExtension : 'js'
      },
      'ng2-charts' :{
        main: 'bundles/ng2-charts.umd.js',
        defaultExtension : 'js'
      },
      'ng-terminal': {
        main: 'bundles/ng-terminal.umd',
        defaultExtension: 'js'
      },
      'xterm':{
        main: 'lib/public/Terminal' ,
        defaultExtension: 'js'
      },
      'lodash': {
        main: 'lodash',
        defaultExtension: 'js',
      },
      'graphlib': {
        main: 'index',
        defaultExtension: 'js',
        map: {
          './lib.js': './lib/index.js',
          './lib/alg.js': './lib/alg/index.js'
        }
      },
      'dagre': {
        defaultExtension: 'js',
        main: 'index',
        // meta: {
        //   '*.js': {
        //     loader: '/sysjs/systemjs-dagre-loader.js'
        //   }
        // },
        map: {
          "./lib/order.js": "./lib/order/index.js",
          "./lib/rank.js": "./lib/rank/index.js",
          "./lib/position.js": "./lib/position/index.js",
          "./lib/data.js": "./lib/data/index.js",
          // "./lodash.js": "./lib/lodash.js"
        }
      },
      'date-fns': {
        main: 'index',
        defaultExtension: 'js',
      },
      'date-fns/format': {
        main: 'index',
        defaultExtension: 'js',
      },
      'date-fns/get_iso_week': {
        main: 'index',
        defaultExtension: 'js',
      },
      'date-fns/parse': {
        main: 'index',
        defaultExtension: 'js',
      },
      'date-fns/add_years': {
        main: 'index',
        defaultExtension: 'js',
      },
      'date-fns/add_months': {
        main: 'index',
        defaultExtension: 'js',
      },
      'date-fns/set_day': {
        main: 'index',
        defaultExtension: 'js',
      },
      'date-fns/set_month': {
        main: 'index',
        defaultExtension: 'js',
      },
      'rxjs-compat': {
        main: 'Rx',
        defaultExtension: 'js'
      },
      '@angular/cdk/observers': {
        main: '../cdk-observers.umd',
        defaultExtension: 'js'
      },
      '@angular/cdk/platform': {
        main: '../cdk-platform.umd',
        defaultExtension: 'js'
      },
      '@angular/cdk/collections': {
        main: '../cdk-collections.umd',
        defaultExtension: 'js'
      },
      '@angular/cdk/coercion': {
        main: '../cdk-coercion.umd',
        defaultExtension: 'js'
      },
      '@angular/cdk/overlay': {
        main: '../cdk-overlay.umd',
        defaultExtension: 'js'
      },
      '@angular/cdk/scrolling': {
        main: '../cdk-scrolling.umd',
        defaultExtension: 'js'
      },
      '@angular/cdk/bidi': {
        main: '../cdk-bidi.umd',
        defaultExtension: 'js'
      },
      '@angular/cdk/portal': {
        main: '../cdk-portal.umd',
        defaultExtension: 'js'
      },
      '@angular/cdk/layout': {
        main: '../cdk-layout.umd',
        defaultExtension: 'js'
      },
      '@angular/cdk/a11y': {
        main: '../cdk-a11y.umd',
        defaultExtension: 'js'
      },
      '@angular/cdk/keycodes': {
        main: '../cdk-keycodes.umd',
        defaultExtension: 'js'
      },
      '@ng-bootstrap/ng-bootstrap': {
        main: 'bundles/ng-bootstrap.umd',
        defaultExtension: 'js'
      },
      'bootstrap': {
        main: 'dist/js/bootstrap',
        defaultExtension: 'js'
      },
      'codemirror': {
        main: 'lib/codemirror',
        defaultExtension: 'js'
      },
      'ng-zorro-antd': {
        main: 'bundles/ng-zorro-antd.umd',
        defaultExtension: 'js'
      },
      'ng-zorro-antd/steps': {
        main: '../ng-zorro-antd-steps.umd',
        defaultExtension: 'js'
      },
      'ng-zorro-antd/input-number': {
        main: '../ng-zorro-antd-input-number.umd',
        defaultExtension: 'js'
      },
      'ng-zorro-antd/checkbox': {
        main: '../ng-zorro-antd-checkbox.umd',
        defaultExtension: 'js'
      },
      'ng-zorro-antd/pagination': {
        main: '../ng-zorro-antd-pagination.umd',
        defaultExtension: 'js'
      },
      'ng-zorro-antd/collapse': {
        main: '../ng-zorro-antd-collapse.umd',
        defaultExtension: 'js'
      },
      'ng-zorro-antd/menu': {
        main: '../ng-zorro-antd-menu.umd',
        defaultExtension: 'js'
      },
      'ng-zorro-antd/divider': {
        main: '../ng-zorro-antd-divider.umd',
        defaultExtension: 'js'
      },
      'ng-zorro-antd/empty': {
        main: '../ng-zorro-antd-empty.umd',
        defaultExtension: 'js'
      },
      'ng-zorro-antd/layout': {
        main: '../ng-zorro-antd-layout.umd',
        defaultExtension: 'js'
      },
      'ng-zorro-antd/dropdown': {
        main: '../ng-zorro-antd-dropdown.umd',
        defaultExtension: 'js'
      },
      'ng-zorro-antd/tabs': {
        main: '../ng-zorro-antd-tabs.umd',
        defaultExtension: 'js'
      },
      'ng-zorro-antd/notification': {
        main: '../ng-zorro-antd-notification.umd',
        defaultExtension: 'js'
      },
      'ng-zorro-antd/message': {
        main: '../ng-zorro-antd-message.umd',
        defaultExtension: 'js'
      },
      'ng-zorro-antd/modal': {
        main: '../ng-zorro-antd-modal.umd',
        defaultExtension: 'js'
      },
      'ng-zorro-antd/tree': {
        main: '../ng-zorro-antd-tree.umd',
        defaultExtension: 'js'
      },
      'ng-zorro-antd/select': {
        main: '../ng-zorro-antd-select.umd',
        defaultExtension: 'js'
      },
      'ng-zorro-antd/form': {
        main: '../ng-zorro-antd-form.umd',
        defaultExtension: 'js'
      },
      'ng-zorro-antd/grid': {
        main: '../ng-zorro-antd-grid.umd',
        defaultExtension: 'js'
      },
      'ng-zorro-antd/input': {
        main: '../ng-zorro-antd-input.umd',
        defaultExtension: 'js'
      },
      'ng-zorro-antd/i18n': {
        main: '../ng-zorro-antd-i18n.umd',
        defaultExtension: 'js'
      },
      'ng-zorro-antd/cascader': {
        main: '../ng-zorro-antd-cascader.umd',
        defaultExtension: 'js'
      },
      'ng-zorro-antd/button': {
        main: '../ng-zorro-antd-button.umd',
        defaultExtension: 'js'
      },
      'ng-zorro-antd/drawer': {
        main: '../ng-zorro-antd-drawer.umd',
        defaultExtension: 'js'
      },
      'ng-zorro-antd/descriptions': {
        main: '../ng-zorro-antd-descriptions.umd',
        defaultExtension: 'js'
      },
      'ng-zorro-antd/core': {
        main: '../ng-zorro-antd-core.umd',
        defaultExtension: 'js'
      },
      'ng-zorro-antd/icon': {
        main: '../ng-zorro-antd-icon.umd',
        defaultExtension: 'js'
      },
      'ng-zorro-antd/spin': {
        main: '../ng-zorro-antd-spin.umd',
        defaultExtension: 'js'
      },
      'ng-zorro-antd/statistic': {
        main: '../ng-zorro-antd-statistic.umd',
        defaultExtension: 'js'
      },
      'ng-zorro-antd/table': {
        main: '../ng-zorro-antd-table.umd',
        defaultExtension: 'js'
      },
      'ng-zorro-antd/radio': {
        main: '../ng-zorro-antd-radio.umd',
        defaultExtension: 'js'
      },
      '@ant-design/colors': {
        main: 'index',
        defaultExtension: 'js'
      },
      '/user': jsLoader,
      '/common': jsLoader,
      '/base': jsLoader,
      '/runtime': jsLoader,
      '/offline': jsLoader,
      '/corecfg': jsLoader,
      '/service': jsLoader,
      '/index': jsLoader,
      rxjs: {
        main: 'index',
        defaultExtension: 'js'
      },
      'rxjs/operators': {
        main: 'index',
        defaultExtension: 'js'
      }
    }
  });
})(this);
