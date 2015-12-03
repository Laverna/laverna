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
    'apps/help/about/controller'
], function(_, Marionette, App, Controller) {
    'use strict';

    /**
     * Sub module shows information about the app.
     */
    var About = App.module('AppHelp.About', {startWithParent: false});

    /**
     * Initializers and finalizers
     */
    About.on('before:start', function(options) {
        About.controller = new Controller(options);

        // Stop module if controller stops
        this.listenTo(About.controller, 'destroy', About.stop);
    });

    About.on('before:stop', function() {
        this.stopListening();
        About.controller = null;
    });

    return About;
});
