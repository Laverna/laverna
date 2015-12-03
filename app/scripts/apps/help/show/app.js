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
    'app',
    'apps/help/show/controller'
], function(_, Marionette, App, Controller) {
    'use strict';

    /**
     * Sub module shows keybindings list.
     */
    var Keybindings = App.module('AppHelp.Keybindings', {startWithParent: false});

    /**
     * Initializers and finalizers
     */
    Keybindings.on('before:start', function(options) {
        Keybindings.controller = new Controller(options);

        // Stop module if controller stops
        this.listenTo(Keybindings.controller, 'destroy', Keybindings.stop);
    });

    Keybindings.on('before:stop', function() {
        this.stopListening();
        Keybindings.controller = null;
    });

    return Keybindings;
});
