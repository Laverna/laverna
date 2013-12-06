/*global define */
define([
    'underscore',
    'backbone',
    'modalRegion',
    'marionette',
    'configsView'
], function (_, Backbone, ModalRegion, ConfigsView) {
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
        content :  '#content',
        modal   :  ModalRegion
    });

    App.on('initialize:after', function() {
        Backbone.history.start({pushState: false});
    });

    App.commands.setHandler('show settings', function () {
        console.log(ConfigsView);
        var configsView = new ConfigsView({
        });
        App.model.show(configsView);
    });

    return App;
});
