/*global define*/
define([
    'underscore',
    'backbone',
    'modalRegion',
    'collections/configs',
    'marionette',
], function (_, Backbone, ModalRegion, Configs) { 'use strict';

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

    // Backbone history navigate
    App.navigate = function (route, options) {
        if (!options) {
            options = {};
        }
        Backbone.history.navigate(route, options);
    };

    // Debug
    App.log = function (str) {
        if (console && typeof console.log === 'function') {
            console.log(str);
        }
    };

    // Return current route
    App.getCurrentRoute = function () {
        return Backbone.history.fragment;
    };

    // For submodules
    App.startSubApp = function(appName, args){
        var currentApp = appName ? App.module(appName) : null;
        if (App.currentApp === currentApp){ return; }

        if (App.currentApp){
            App.currentApp.stop();
        }

        App.currentApp = currentApp;
        if(currentApp){
            currentApp.start(args);
        }
    };

    // Initialize settings
    App.on('initialize:before', function () {
        var configs = new Configs();
        configs.fetch();

        // Set default set of configs
        if (configs.length === 0) {
            configs.firstStart();
        }

        App.settings = configs.getConfigs();
    });

    // Start default module
    App.on('initialize:after', function () {
        require([
            'apps/encryption/encrypt',
            'helpers/keybindings',
            'apps/notes/appNote',
            'apps/notebooks/appNotebooks'
        ], function () {
            Backbone.history.start({pushState: false});

            if (App.getCurrentRoute() === '') {
                App.trigger('notes:list');
            }
        });
    });

    return App;
});
