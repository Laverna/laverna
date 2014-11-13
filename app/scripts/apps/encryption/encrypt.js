/*global define*/
define([
    'underscore',
    'app',
    'marionette',
    'apps/encryption/auth',
], function (_, App, Marionette, getAuth) {
    'use strict';

    /**
     * This module provides encryption API
     */
    var Encryption = App.module('Encryption', {startWithParent: false}),
        executeAction,
        API;

    Encryption.on('start', function () {
        App.log('Encryption module has started');
    });

    Encryption.on('stop', function () {
        App.log('Encryption module has stopped');
        App.brand.empty();
    });

    // Router
    Encryption.Router = Marionette.AppRouter.extend({
        appRoutes: {
            '(p/:profile/)auth': 'showAuth',
            '(p/:profile/)encrypt/all(/:db)': 'showEncryptAll',
        }
    });

    // Start the application
    executeAction = function (action, args) {
        App.startSubApp('Encryption');
        action(args);
    };

    // Controller
    API = {
        showAuth: function () {
            require(['apps/encryption/auth/controller'], function (Controller) {
                executeAction(new Controller().showForm);
            });
        },

        showEncryptAll: function (profile, db) {
            require(['apps/encryption/encrypt/controller'], function (Controller) {
                executeAction(new Controller().showEncrypt, db);
            });
        }
    };

    // API
    Encryption.API = {

        checkAuth: function () {
            var auth = getAuth(App.settings);
            if (auth.checkAuth() === false) {
                App.vent.trigger('navigate:link', '/auth');
                return false;
            }
            return true;
        }

    };

    App.addInitializer(function () {
        new Encryption.Router({
            controller: API
        });
    });

    return Encryption;
});
