/*global define */
define([
    'underscore',
    'backbone',
    'marionette'
], function (_, Backbone) {
    'use strict';

    // Underscore template
    _.templateSettings = {
        // interpolate : /\{\{(.+?)\}\}/g
        interpolate: /\{\{(.+?)\}\}/g,
        evaluate: /<%([\s\S]+?)%>/g
    };

    var App = new Backbone.Marionette.Application();

    App.addRegions({
        sidebar :  '#sidebar',
        content :  '#content'
    });

    App.on('initialize:after', function() {
        Backbone.history.start({pushState: false});
    });

    return App;
});
