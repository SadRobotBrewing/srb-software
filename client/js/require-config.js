/* global requirejs */
requirejs.config({
  paths: {
    'text'      : '../bower_components/riggr/src/lib/requirejs-text/text',
    'knockout'  : '../bower_components/riggr/src/lib/knockout/index',
    'jquery'    : '../bower_components/jquery/dist/jquery.min',
    'riggr'     : '../bower_components/riggr/src/riggr',
    'router'    : '../bower_components/riggr/src/router',
    'observer'  : '../bower_components/riggr/src/observer',
    'request'   : '../bower_components/riggr/src/request',
    'store'     : '../bower_components/riggr/src/store',
    'indexed'   : '../bower_components/riggr/src/indexed',
    'primus'    : '/primus/primus',
    'server'    : './server'
  }
});
