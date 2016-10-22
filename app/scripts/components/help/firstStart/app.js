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
    'app',
    'apps/help/firstStart/controller'
], function(_, App, Controller) {
    'use strict';

    /**
     * Submodule shows first-start guide.
     */
    var FirstStart = App.module('AppHelp.FirstStart', {startWithParent: false});

    /**
     * Initializers and finalizers
     */
    FirstStart.on('before:start', function(options) {
        FirstStart.controller = new Controller(options);

        // Stop module if controller stops
        this.listenTo(FirstStart.controller, 'destroy', FirstStart.stop);
    });

    FirstStart.on('before:stop', function() {
        this.stopListening();
        FirstStart.controller = null;
    });

    return FirstStart;
});
