/*global define*/
/*global sjcl*/
define([
    'underscore',
    'app',
    'marionette',
    'sjcl'
], function (_, App, Marionette) {
    'use strict';

    /**
     * This module provides encryption API
     */
    var Encryption = App.module('Encryption', {startWithParent: false}),
        executeAction, API;

    Encryption.on('start', function () {
        App.log('Encryption module is started');
    });

    Encryption.on('stop', function () {
        App.log('Encryption module is stoped');
        App.brand.close();
    });

    // Router
    Encryption.Router = Marionette.AppRouter.extend({
        appRoutes: {
            'auth': 'showAuth'
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
        }
    };

    // API
    Encryption.API = {
        checkKey: function () {
            if (App.settings.encrypt === 1 && !App.settings.secureKey) {
                App.notesArg = null;
                App.navigate('/auth', true);
            }
        },

        encrypt: function (content) {
            this.checkKey();
            if (App.settings.encrypt === 1) {
                content = sjcl.encrypt(App.settings.secureKey.toString(), content);
            }
            return content;
        },

        decrypt: function (content) {
            this.checkKey();
            if (App.settings.encrypt === 1) {
                try {
                    content = sjcl.decrypt(App.settings.secureKey, content);
                } catch(e) {
                    App.log('Can\'t decrypt ' + e);
                }
            }
            return content;
        }
    };

    App.addInitializer(function () {
        new Encryption.Router({
            controller: API
        });
    });

    return Encryption;
});
