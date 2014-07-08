define([
  'knockout',
  'observer'
], function(ko, observer) {
  var app = {
    page: ko.observable(""),
    routes: {
      '/'               : 'pages/status',
      '/status'         : 'pages/status',
      '/programs'       : 'pages/programs',
      '/programs/:name' : 'pages/programs',
      '/404'            : '404'
    },
    onRoute: function() {}
  };
  
  observer.subscribe('page', function(page) {
    app.page(page);
  });
  
  return app;
});
