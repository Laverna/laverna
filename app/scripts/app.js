/*global define*/
define([
    'underscore',
    'jquery',
    'backbone',
    'modalRegion',
    'brandRegion',
    'devicejs',
    'marionette'
], function(_, $, Backbone, ModalRegion, BrandRegion, Device) {
    'use strict';

    var App = new Backbone.Marionette.Application();

    App.isMobile = Device.mobile() === true || Device.tablet() === true;

    // Customize underscore template
    _.templateSettings = {
        interpolate: /\{\{(.+?)\}\}/g,
        evaluate: /<%([\s\S]+?)%>/g
    };

    // Regions
    App.addRegions({
        sidebarNavbar : '#sidebar-navbar',
        sidebar       : '#sidebar-content',
        content       : '#content',
        brand         : BrandRegion,
        modal         : ModalRegion
    });

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
            App.vent.trigger('app:module', appName);
            currentApp.start(args);
        }
    };

    // @ToMove somewhere else
    App.vent.on('app:start', function() {
        $('.loading').removeClass('loading');
    });

    App.on('before:start', function() {
        App.settings = App.request('configs');
        App.constants = App.request('constants');
        App.vent.trigger('app:init');
    });

    App.on('start', function() {
        console.timeEnd('App');
        Backbone.history.start({ pushState: false });
        App.vent.trigger('app:start');
    });

    return App;
});
