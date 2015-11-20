/* global define */
define([
    'underscore',
    'marionette',
    'backbone.radio',
    'app',
    'apps/encryption/encrypt/controller'
], function(_, Marionette, Radio, App, Controller) {
    'use strict';

    /**
     * Sub app which handles encryption and re-encryption.
     */
    var Encrypt = App.module('AppEncrypt.Encrypt', {startWithParent: false});

    /**
     * Initializers and finalizers
     */
    Encrypt.on('before:start', function(options) {
        Encrypt.controller = new Controller(options);
    });

    Encrypt.on('before:stop', function() {
        Encrypt.controller.destroy();
        Encrypt.controller = null;
    });

    return Encrypt;
});
