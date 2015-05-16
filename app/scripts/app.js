/*global define*/
define([
    'underscore',
    'jquery',
    'backbone',
    'backbone.radio',
    'devicejs',
    'regions/regionManager',
    'marionette'
], function(_, $, Backbone, Radio, Device) {
    'use strict';

    var App = new Backbone.Marionette.Application();

    App.isMobile = Device.mobile() === true || Device.tablet() === true;

    // Customize underscore template
    _.templateSettings = {
        interpolate : /\{\{(.+?)\}\}/g,
        evaluate    : /<%([\s\S]+?)%>/g
    };

    // Start a module
    App.startSubApp = function(appName, args) {
        var currentApp = appName ? App.module(appName) : null;
        if (App.currentApp === currentApp) { return; }

        // Stop previous app if current app is not modal
        if (App.currentApp && (!currentApp.options.modal || App.isMobile)) {
            App.currentApp.stop();
        }

        App.currentApp = currentApp;
        if (currentApp) {
            App.channel.trigger('app:module', appName);
            currentApp.start(args);
        }
    };

    // Returns current app
    Radio.reply('global', 'app:current', function() {
        return App.currentApp;
    });

    // @ToMove somewhere else
    App.channel.on('app:start', function() {
        $('.loading').removeClass('loading');
    });

    App.on('before:start', function() {
        App.settings = App.request('configs');
        App.constants = App.request('constants');
        App.channel.trigger('app:init');
    });

    App.on('start', function() {
        console.timeEnd('App');
        Backbone.history.start({ pushState: false });
        App.channel.trigger('app:start');
    });

    return App;
});
