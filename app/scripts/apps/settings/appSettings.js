/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
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
            '(p/:profile/)settings(/:tab)'      : 'showSettings',
            '(p/:profile/)settings/module/:tab' : 'showModule'
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
                if (Settings.currentApp && controller.args.tab !== tab) {
                    Settings.currentApp.stop();
                }

                Settings.currentApp = Module;
                Module.start(controller.getOptions(profile, tab));
            });
        },

        showModule: function(profile, module) {
            requirejs(['apps/settings/module/app'], function(Module) {
                // Stop previously started module
                if (Settings.currentApp) {
                    Settings.currentApp.stop();
                }

                Settings.currentApp = Module;
                Module.start({profile: profile, module: module});
            });
        },

        getOptions: function() {
            controller.args = {
                profile : arguments[0],
                tab     : arguments[1] || 'general',
            };
            return controller.args;
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
        Settings.currentApp = null;
        controller.args = null;

        SidebarApp.stop();
    });

    // Register the router
    App.on('before:start', function() {
        new Settings.Router({
            controller: controller
        });
    });

});
