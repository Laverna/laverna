/*global define*/
define([
    'underscore',
    'jquery',
    'backbone',
    'devicejs',
    'regions/regionManager',
    'marionette'
], function(_, $, Backbone, Device, regions) {
    'use strict';

    var App = new Backbone.Marionette.Application();

    App.isMobile = Device.mobile() === true || Device.tablet() === true;

    // Customize underscore template
    _.templateSettings = {
        interpolate: /\{\{(.+?)\}\}/g,
        evaluate: /<%([\s\S]+?)%>/g
    };

    // @TODO remove this fallback after refactoring
    App.content = regions.content;

    _.extend(App, {

        // Debug
        log: function(str) {
            if (console && typeof console.log === 'function') {
                console.log(str);
            }
        },

        // Document title
        setTitle: function(title, mainTitle) {
            App.title = (App.title || {main: '', index: ''});
            if (mainTitle) {
                App.title.main = mainTitle;
            }
            App.title.index = (title ? title + ' - ' : App.title.index);
            document.title = App.title.index + App.title.main;
        }

    });

    // Start a module
    App.startSubApp = function(appName, args) {
        if (appName !== 'Encryption' && !App.Encryption.API.checkAuth()) {
            return;
        }

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
