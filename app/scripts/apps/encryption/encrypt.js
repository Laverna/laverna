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
        App.log('Encryption module has started');
    });

    Encryption.on('stop', function () {
        App.log('Encryption module has stopped');
        App.brand.close();
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
            if (App.settings.encrypt === 1 && !App.secureKey) {
                App.notesArg = null;
                App.navigate('/auth', true);
                return false;
            }
            return true;
        },

        // Cache encryption key within application
        // -----------------------------------
        encryptKey: function (password) {
            var pwd = App.settings.encryptPass,
                p = {};

            if (pwd.toString() === sjcl.hash.sha256.hash(password).toString()) {
                p.iter = parseInt(App.settings.encryptIter);
                p.salt = App.settings.encryptSalt;

                p = sjcl.misc.cachedPbkdf2(password, p);
                password = p.key.slice(0, parseInt(App.settings.encryptKeySize)/32);

                return password;
            } else {
                return false;
            }
        },

        encrypt: function (content) {
            if (!content || content === '') {
                return content;
            }

            var secureKey = App.settings.secureKey || App.secureKey;
            if (App.settings.encrypt === 1 && secureKey) {
                var conf = App.settings,
                    p = {
                        iter : conf.encryptIter,
                        ts   : parseInt(conf.encryptTag),
                        ks   : parseInt(conf.encryptKeySize),
                        // Random initialization vector every time
                        iv   : sjcl.random.randomWords(4, 0)
                    };

                content = sjcl.encrypt(secureKey.toString(), content, p);
            }
            return content;
        },

        decrypt: function (content) {
            if ( !content || content.length === 0) {
                return content;
            }

            var secureKey = App.settings.secureKey || App.secureKey;
            if (App.settings.encrypt === 1 && secureKey) {
                try {
                    content = sjcl.decrypt(secureKey.toString(), content);
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
