/*global define */
define(['underscore', 'backbone', 'marionette'], function (_, Backbone) {
    'use strict';

    // Underscore template
    _.templateSettings = {
        interpolate :  /\{\{(.+?)\}\}/g,
        evaluate    :  /<%([\s\S]+?)%>/g
    };

    var App = new Backbone.Marionette.Application();

    App.addRegions({
        sidebar :  '#sidebar-content',
        content :  '#content'
    });

    App.on('initialize:before', function () {
    });

    App.on('initialize:after', function() {
        Backbone.history.start();
    });

    return App;
});
