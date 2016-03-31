/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define */
define([
    'backbone.radio',
    'modules',
    'mousetrap',
    'modules/electronSearch/controller',
    'mousetrap.global'
], function(Radio, Modules, Mousetrap, Controller) {
    'use strict';

    /**
     * Adds page search functionality into electron app.
     */
    var Search = Modules.module('ElectronSearch', {});

    Search.on('start', function() {
        this.controller = new Controller();

        this.controller.on('destroy', Search.stop, Search);
    });

    Search.on('stop', function() {
        this.controller.destroy();
    });

    // Add a global module initializer
    Radio.request('init', 'add', 'module', function() {

        // Start the module
        Mousetrap.bind(['ctrl+f', 'command+f'], function(e) {
            e.preventDefault();
            Search.start();
        });
    });

    return Search;
});
