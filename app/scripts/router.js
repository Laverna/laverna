/*global define */
define(['app', 'marionette', 'controllers/main'], function(App, Marionette, ControllerMain){
    'use strict';
    var Router = Marionette.AppRouter.extend({
        appRoutes: {
            '': 'index'
        },
        controller: new ControllerMain()
    });
    return Router;
});
