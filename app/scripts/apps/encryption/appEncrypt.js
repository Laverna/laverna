/* global define, requirejs */
define([
    'jquery',
    'underscore',
    'marionette',
    'backbone.radio',
    'app',
], function($, _, Marionette, Radio, App) {
    'use strict';

    /**
     * Encryption module.
     *
     * Listens to events:
     * 1. channel: `encrypt`, event: `changed`
     *    navigate to re-encryption page.
     *
     * Requests:
     * 1. channel: `encrypt`, request: `check:auth`
     *    in order to check whether the user is authorized.
     */
    var Encrypt = App.module('AppEncrypt', {startWithParent: false}),
        controller;

    Encrypt.Router = Marionette.AppRouter.extend({
        appRoutes: {
            '(p/:profile/)auth'        : 'showAuth',
            '(p/:profile/)encrypt/all' : 'showEncrypt'
        },

        // Starts itself
        onRoute: function() {
            if (!Encrypt._isInitialized) {
                App.startSubApp('AppEncrypt', {profile: arguments[2][0]});
            }
        }
    });

    function startModule(module, args) {
        if (!module) {
            return;
        }

        // Stop previous module
        if (Encrypt.currentApp) {
            Encrypt.currentApp.stop();
        }

        Encrypt.currentApp = module;
        module.start(args);

        // If module has stopped, remove the variable
        module.on('stop', function() {
            delete Encrypt.currentApp;
        });
    }

    controller = {
        showAuth: function(profile) {
            requirejs(['apps/encryption/auth/app'], function(Module) {
                startModule(Module, {profile: profile});
            });
        },

        showEncrypt: function(profile) {
            requirejs(['apps/encryption/encrypt/app'], function(Module) {
                startModule(Module, {profile: profile});
            });
        },

        // On encrypt/decrypt error, remove PBKDF2 key from the session
        _confirmAuth: function() {
            Radio.command('Confirm', 'start', {
                title     : 'encryption.error',
                content   : $.t('encryption.errorConfirm'),
                onconfirm : function() {
                    Radio.command('encrypt', 'delete:secureKey');
                    window.location.reload();
                }
            });
        },

        // If encryption configs are changed, navigate to re-encryption page.
        _navigateEncrypt: function() {
            document.location.hash = Radio.request('uri', 'link:profile', '/encrypt/all');
        },

        _checkAuth: function() {
            if (Radio.request('encrypt', 'check:auth')) {
                return;
            }

            // Navigate to login page
            document.location.hash = Radio.request('uri', 'link:profile', '/auth');
        }
    };

    /**
     * Initializers and finalizers
     */
    Encrypt.on('before:start', function() {
    });

    Encrypt.on('before:stop', function() {
        Encrypt.currentApp.stop();
        delete Encrypt.currentApp;
    });

    // Check whether a user is authorized when everything is ready
    Radio.command('init', 'add', 'module', function() {
        Radio.on('encrypt', 'changed', controller._navigateEncrypt, controller);
        Radio.on('encrypt', 'decrypt:error', controller._confirmAuth, controller);

        controller._checkAuth();
    });

    // Register the router
    App.on('before:start', function() {
        new Encrypt.Router({
            controller: controller
        });
    });
});
