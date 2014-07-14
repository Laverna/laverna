/*global define*/
define([
    'underscore',
    'jquery',
    'backbone',
    'modalRegion',
    'brandRegion',
    'collections/configs',
    'helpers/uri',
    'i18next',
    'devicejs',
    'marionette'
], function (_, $, Backbone, ModalRegion, BrandRegion, Configs, URI, i18n, Device) {
    'use strict';

    // Underscore template
    _.templateSettings = {
        // interpolate : /\{\{(.+?)\}\}/g
        interpolate: /\{\{(.+?)\}\}/g,
        evaluate: /<%([\s\S]+?)%>/g
    };

    var App = new Backbone.Marionette.Application(),
        configs = new Configs();

    App.isMobile = Device.mobile() === true || Device.tablet() === true;

    App.addRegions({
        sidebarNavbar : '#sidebar-navbar',
        sidebar       : '#sidebar-content',
        content       : '#content',
        brand         : BrandRegion,
        modal         : ModalRegion
    });

    // Modal region events
    App.modal.on('close', function () {
        // App.notesArg = null; // Re render sidebar
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

    // Document title
    App.setTitle = function (title, mainTitle) {
        App.title = (App.title || {main: '', index: ''});
        if (mainTitle) {
            App.title.main = mainTitle;
        }
        App.title.index = (title ? title + ' - ' : App.title.index);
        document.title = App.title.index + App.title.main;
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
    App.startSubApp = function(appName, args) {
        if (appName !== 'Encryption' && !App.Encryption.API.checkAuth()) {
            return;
        }

        var currentApp = appName ? App.module(appName) : null;
        if (App.currentApp === currentApp){ return; }

        if (App.currentApp){
            App.currentApp.stop();
        }

        configs.createProfile(URI.getProfile() || 'notes-db');
        App.settings = configs.getConfigs();
        App.currentProfile = URI.getProfile();

        window.dropboxKey = App.settings.dropboxKey;

        App.currentApp = currentApp;
        if(currentApp){
            currentApp.start(args);
        }
    };

    // Initialize settings
    App.on('before:start', function () {
        configs.fetch();

        // Set default set of configs
        if (configs.length === 0) {
            App.firstStart = true;
        }

        App.settings = configs.getConfigs();
        configs.on('change', function () {
            App.settings = configs.getConfigs();
        });

        $.when(configs.firstStart()).done(function (collection) {
            configs = collection;
        });
    });

    App.on('profile:change', function () {
        App.currentProfile = URI.getProfile();
        App.mousetrap.API.restart();
    });

    App.on('configs:fetch', function () {
        configs.fetch();
    });

    // Start default module
    App.on('start', function () {
        require([
            'constants',
            'helpers/install',
            'apps/confirm/appConfirm',
            'apps/encryption/encrypt',
            'helpers/keybindings',
            'apps/navbar/appNavbar',
            'apps/notes/appNote',
            'apps/notebooks/appNotebooks',
            'apps/settings/appSettings',
            'apps/help/appHelp'
        ], function (constants, Install) {
            var lng = {
                lng             : App.settings.appLang,
                fallbackLng     : 'en',
                useCookie       : false,
                useLocalStorage : true
            };

            i18n.init(lng, function () {
                if (App.settings.appLang === '') {
                    configs.get('appLang').save({ 'value': i18n.lng() });
                }

                App.constants = constants;
                Install.start();

                Backbone.history.start({pushState: false});
                $('.loading').removeClass('loading');

                $(window).on('hashchange', function () {
                    var profile = URI.getProfile();
                    configs.createProfile(profile);

                    if (profile !== App.currentProfile) {
                        App.trigger('profile:change');
                    }
                });

                if (App.getCurrentRoute() === '') {
                    App.trigger('notes:list');
                }
            });
        });
    });

    return App;
});
