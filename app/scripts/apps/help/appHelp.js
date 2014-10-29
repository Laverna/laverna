/* global define */
define([
    'underscore',
    'marionette',
    'app'
], function (_, Marionette, App) {
    'use strict';

    var Help = App.module('AppHelp', {startWithParent: false, modal: true}),
        executeAction, API;

    Help.on('start', function () {
        App.vent.trigger('mousetrap:reset');
        App.log('AppHelp module has started');
    });

    Help.on('stop', function () {
        App.vent.trigger('mousetrap:restart');
        App.log('AppHelp module has stoped');

        API.controller.destroy();
        delete API.controller;
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
                API.controller = new Controller();
                executeAction(API.controller.show);
            });
        },

        about: function () {
            require(['apps/help/about/controller'], function (Controller) {
                API.controller = new Controller();
                executeAction(API.controller.show);
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
