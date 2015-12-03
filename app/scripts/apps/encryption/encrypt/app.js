/**
 * Copyright (C) 2015 Laverna project Authors.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
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
