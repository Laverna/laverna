/*global define*/
define([
    'underscore',
    'marionette',
    'app'
], function (_, Marionette, App) {
    'use strict';

    var Settings = App.module('AppSettings', {startWithParent : false, modal: true}),
        executeAction,
        API;

    Settings.on('start', function () {
        App.vent.trigger('mousetrap:reset');
        App.log('AppSettings has started');
    });

    Settings.on('stop', function () {
        App.vent.trigger('mousetrap:restart');
        App.log('AppSettings has stoped');

        API.controller.destroy();
        delete API.controller;
    });

    // The router
    Settings.Router = Marionette.AppRouter.extend({
        appRoutes: {
            '(p/:profile/)settings(/:tab)' : 'showSettings'
        }
    });

    // Start the application
    executeAction = function (action, args) {
        App.startSubApp('AppSettings');
        action(args);
    };

    // Controller
    API = {
        showSettings: function (profile, tab) {
            require(['apps/settings/show/showController'], function (Controller) {
                API.controller = new Controller();
                executeAction(API.controller.show, {profile: profile, tab: tab});
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
