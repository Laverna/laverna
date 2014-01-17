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
        App.mousetrap.API.pause();
        App.log('AppHelp is started');
    });

    Help.on('stop', function () {
        App.mousetrap.API.unpause();
        App.log('AppHelp is stoped');
    });

    // Router
    Help.Router = Marionette.AppRouter.extend({
        appRoutes: {
            'help': 'showHelp',
            'about': 'about'
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
