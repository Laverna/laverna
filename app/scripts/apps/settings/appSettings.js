/* global define, requirejs */
define([
    'underscore',
    'marionette',
    'backbone.radio',
    'app',
    'apps/settings/sidebar/app'
], function(_, Marionette, Radio, App, SidebarApp) {
    'use strict';

    /**
     * Settings sub app.
     */
    var Settings = App.module('AppSettings', {startWithParent: false}),
        controller;

    /**
     * The router
     */
    Settings.Router = Marionette.AppRouter.extend({
        appRoutes: {
            '(p/:profile/)settings(/:tab)' : 'showSettings'
        },

        // Starts itself
        onRoute: function() {
            if (!Settings._isInitialized) {
                App.startSubApp(
                    'AppSettings',
                    controller.getOptions.apply(controller, arguments[2])
                );
            }
        }
    });

    controller = {
        showSettings: function(profile, tab) {
            requirejs(['apps/settings/show/app'], function(Module) {
                // Stop previously started module
                if (Settings.currentApp) {
                    Settings.currentApp.stop();
                }

                Settings.currentApp = Module;
                Module.start(controller.getOptions(profile, tab));
            });
        },

        getOptions: function() {
            return {
                profile : arguments[0],
                tab     : arguments[1] || 'general',
            };
        }
    };

    /**
     * Initializer and finalizer
     */
    Settings.on('before:start', function(options) {
        SidebarApp.start(options);
    });

    Settings.on('before:stop', function() {
        Settings.currentApp.stop();
        delete Settings.currentApp;

        SidebarApp.stop();
    });

    // Register the router
    App.addInitializer(function() {
        new Settings.Router({
            controller: controller
        });
    });

});
