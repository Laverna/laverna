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
    'apps/settings/sidebar/controller'
], function(_, Marionette, Radio, App, Controller) {
    'use strict';

    var Sidebar = App.module('AppSettings.Sidebar', {startWithParent: false});

    /**
     * Initializer & finalizer
     */
    Sidebar.on('before:start', function(options) {
        Sidebar.controller = new Controller(options);
    });

    Sidebar.on('before:stop', function() {
        Sidebar.controller.destroy();
        Sidebar.controller = null;
    });

    return Sidebar;
});
