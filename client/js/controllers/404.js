/* global define */

define(['knockout'], function(ko) {
  return {
    pageTitle: '404 - Not Found',
    path: ko.observable(),
    load: function (path) {
      this.path(path);
    }
  };
});
