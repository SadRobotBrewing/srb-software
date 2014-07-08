/* global require */

require(['require-config'], function() {
  require([
    'riggr',
    'controllers/app',
  ], function(rigg, app) {
    app.title = 'SRB Control Station';
    app.transition = 150;
    app.paths = {
      controllers : 'controllers',
      views       : '../views'
    };

    rigg(app);
  });
});
