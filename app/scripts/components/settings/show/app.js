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
    'apps/settings/show/controller'
], function(_, Marionette, Radio, App, Controller) {
    'use strict';

    var Show = App.module('AppSettings.Show', {startWithParent: false});

    /**
     * Initializer & finalizer
     */
    Show.on('before:start', function(options) {
        Show.controller = new Controller(options);
    });

    Show.on('before:stop', function() {
        Show.controller.destroy();
        Show.controller = null;
    });

    return Show;
});
