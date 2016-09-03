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
    'apps/settings/module/controller'
], function(_, Marionette, Radio, App, Controller) {
    'use strict';

    var Module = App.module('AppSettings.Module', {startWithParent: false});

    /**
     * Initializer & finalizer
     */
    Module.on('before:start', function(options) {
        Module.controller = new Controller(options);
    });

    Module.on('before:stop', function() {
        Module.controller.destroy();
        Module.controller = null;
    });

    return Module;
});
