/* global define */
define([
    'underscore',
    'marionette',
    'app'
], function (_, Marionette, App) {
    'use strict';

    var Help = App.module('AppHelp', {startWithParent: false}),
        executeAction, API;

    Help.on('start', function () {
        App.mousetrap.API.reset();
        App.log('AppHelp has been started');
    });

    Help.on('stop', function () {
        App.mousetrap.API.restart();
        App.log('AppHelp has been stoped');
    });

    // Router
    Help.Router = Marionette.AppRouter.extend({
        appRoutes: {
            '(p/:profile/)help': 'showHelp',
            '(p/:profile/)about': 'about'
        }
    });

    // Start the application
    executeAction = function (action, args) {
        App.startSubApp('AppHelp');
        action(args);
    };

    // Controller
    API = {
        showHelp: function () {
            require(['apps/help/show/controller'], function (Controller) {
                executeAction(new Controller().show);
            });
        },

        about: function () {
            require(['apps/help/about/controller'], function (Controller) {
                executeAction(new Controller().show);
            });
        }
    };

    App.addInitializer(function () {
        new Help.Router({
            controller: API
        });
    });

    return Help;
});
