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
        Auth.controller = null;
    });

    return Auth;
});
