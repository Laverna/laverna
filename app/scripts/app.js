/*global define */
define(['backbone', 'marionette'], function (Backbone) {
    'use strict';

    var App = new Backbone.Marionette.Application();

    App.addRegions({
        sidebar :  '#sidebar-content',
        content :  '#content'
    });

    App.on('initialize:after', function() {
        Backbone.history.start();
    });

    return App;
});
