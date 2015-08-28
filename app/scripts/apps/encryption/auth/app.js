/* global define */
define([
    'underscore',
    'marionette',
    'backbone.radio',
    'app',
    'apps/encryption/auth/controller'
], function(_, Marionette, Radio, App, Controller) {
    'use strict';

    var Auth = App.module('AppEncrypt.Auth', {startWithParent: false});

    /**
     * Initializers and finalizers
     */
    Auth.on('before:start', function(options) {
        Auth.controller = new Controller(options);
    });

    Auth.on('before:stop', function() {
        Auth.controller.destroy();
        delete Auth.controller;
    });

    return Auth;
});
