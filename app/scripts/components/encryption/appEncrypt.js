/**
 * Copyright (C) 2015 Laverna project Authors.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define, requirejs */
define([
    'jquery',
    'underscore',
    'q',
    'marionette',
    'backbone.radio',
    'app',
    'text!apps/encryption/auth/errorConfirm.html'
], function($, _, Q, Marionette, Radio, App, ConfirmTmpl) {
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

        $('.-loading').removeClass('-loading');

        // Stop previous module
        if (Encrypt.currentApp) {
            Encrypt.currentApp.stop();
        }

        Encrypt.currentApp = module;
        args.profile       = args.profile || Radio.request('uri', 'profile');
        module.start(args);

        // If module has stopped, remove the variable
        module.on('stop', function() {
            Encrypt.currentApp = null;
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
            Radio.once('Confirm', 'auth', function() {
                Radio.request('encrypt', 'delete:secureKey');
                window.location.reload();
            });

            Radio.once('Confirm', 'openSettings', function() {
                Radio.request('uri', 'navigate', '/settings/encryption', {
                    trigger       : true,
                    includeProfile: true
                });
            });

            Radio.request('Confirm', 'start', {
                title     : 'encryption.error',
                content   : $.t('encryption.errorConfirm'),
                template  : ConfirmTmpl
            });
        },

        _checkAuth: function() {
            var isAuthed = Radio.request('encrypt', 'check:auth');

            if (isAuthed === true) {
                return Radio.trigger('appEncrypt', 'auth:success');
            }
            else if (isAuthed && isAuthed.isChanged === true) {
                return;
            }

            // Show auth form
            controller.showAuth();
        }
    };

    /**
     * Initializers and finalizers
     */
    Encrypt.on('before:start', function() {
    });

    Encrypt.on('before:stop', function() {
        Encrypt.currentApp.stop();
        Encrypt.currentApp = null;
    });

    // Check whether a user is authorized when everything is ready
    Radio.request('init', 'add', 'auth', function() {
        var defer = Q.defer();

        Radio.on('encrypt', 'changed', controller.showEncrypt, controller);
        Radio.on('encrypt', 'decrypt:error', controller._confirmAuth, controller);

        Radio.on('appEncrypt', 'auth:success', function() {
            if (Encrypt.currentApp) {
                Encrypt.currentApp.stop();
            }
            Encrypt.stop();
            defer.resolve();
        });

        controller._checkAuth();
        return defer.promise;
    });

    // Register the router
    App.on('before:start', function() {
        new Encrypt.Router({
            controller: controller
        });
    });
});
