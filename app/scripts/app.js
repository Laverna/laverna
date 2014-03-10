/*global define*/
define([
    'underscore',
    'backbone',
    'modalRegion',
    'brandRegion',
    'collections/configs',
    'i18next',
    'marionette'
], function (_, Backbone, ModalRegion, BrandRegion, Configs, i18n) {
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
        brand   :  BrandRegion,
        modal   :  ModalRegion
    });

    // Modal region events
    App.modal.on('close', function () {
        App.notesArg = null; // Re render sidebar
    });

    // Backbone history navigate
    App.navigate = function (route, options) {
        if (!options) {
            options = {};
        }
        Backbone.history.navigate(route, options);
    };

    // Go back
    App.navigateBack = function (defUrl) {
        var url = window.history;
        defUrl = (defUrl) ? defUrl : '/notes';

        if (url.length === 0) {
            App.navigate(defUrl, {trigger: true});
        } else {
            url.back();
        }
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
        if (appName !== 'Encryption' && !App.Encryption.API.checkAuth()) {
            return;
        }

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
            App.firstStart = true;
            configs.firstStart();
        }

        App.settings = configs.getConfigs();

        i18n.init({ lng: App.settings.appLang });
        if (App.settings.appLang === '') {
            configs.get('appLang').save({ 'value': i18n.lng() });
        }
    });

    // Start default module
    App.on('initialize:after', function () {
        require([
            'constants',
            'helpers/install',
            'apps/confirm/appConfirm',
            'apps/encryption/encrypt',
            'helpers/dualstorage',
            'helpers/keybindings',
            'apps/notes/appNote',
            'apps/notebooks/appNotebooks',
            'apps/settings/appSettings',
            'apps/help/appHelp'
        ], function (constants, Install) {

            App.constants = constants;
            Install.start();

            Backbone.history.start({pushState: false});

            if (App.getCurrentRoute() === '') {
                App.trigger('notes:list');
            }
        });
    });

    return App;
});
