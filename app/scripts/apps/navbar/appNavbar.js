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
    'modules',
    'apps/navbar/show/controller'
], function(_, Marionette, Radio, Modules, Controller) {
    'use strict';

    /**
     * Navbar module.
     *
     * Replies to requests:
     * 1. channel: `navbar`, reply: `start`
     *    starts itself.
     */
    var Navbar = Modules.module('Navbar', {startWithParent: false});

    Navbar.on('start', function(options) {
        Navbar.controller = new Controller(options);
    });

    Navbar.on('stop', function() {
        Navbar.controller.destroy();
        Navbar.controller = null;
    });

    // Initializer
    Radio.request('init', 'add', 'app:before', function() {
        Radio.reply('navbar', 'stop', Navbar.stop, Navbar);

        Radio.reply('navbar', 'start', function(options) {
            // Just trigger an event
            if (Navbar._isInitialized) {
                return Navbar.controller.trigger('change:title', options);
            }

            Navbar.start(options);
        });

    });

    return Navbar;
});
