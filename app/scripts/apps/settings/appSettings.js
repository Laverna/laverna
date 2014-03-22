/*global define*/
define([
    'underscore',
    'marionette',
    'app'
], function (_, Marionette, App) {
    'use strict';

    var Settings = App.module('AppSettings', {startWithParent : false}),
        executeAction,
        API;

    Settings.on('start', function () {
        App.mousetrap.API.reset();
        App.log('AppSettings is started');
    });

    Settings.on('stop', function () {
        App.mousetrap.API.restart();
        App.log('AppSettings is stoped');
    });

    // The router
    Settings.Router = Marionette.AppRouter.extend({
        appRoutes: {
            'settings' : 'showSettings'
        }
    });

    // Start the application
    executeAction = function (action, args) {
        App.startSubApp('AppSettings');
        action(args);
    };

    // Controller
    API = {
        showSettings: function () {
            require(['apps/settings/show/showController'], function (Controller) {
                executeAction(new Controller().show);
            });
        }
    };

    // Register the modules router
    App.addInitializer(function () {
        new Settings.Router({
            controller: API
        });
    });

    return Settings;
});
