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
    'backbone.radio',
    'marionette',
    'modules',
    'modules/fuzzySearch/regions/sidebar',
    'modules/fuzzySearch/controllers/main'
], function(_, Radio, Marionette, Modules, Region, Controller) {
    'use strict';

    /**
     * Fuzzy search module.
     *
     * It creates a new region on `init` event in order to show search results
     * there.
     *
     * Listens to
     * ----------
     * Events:
     * 1. channel: `global`, event: `search:shown`
     *    starts itself
     * 2. channel: `global`, event: `search:hidden`
     *    stops itself
     *
     * Requests:
     * 1. channel: `fuzzySearch`, request: `region:show`
     *    renders the provided view in fuzzy search region
     * 2. channel: `fuzzySearch`, request: `region:empty`
     */
    var Fuzzy = Modules.module('FuzzySearch', {});

    /**
     * Initializers & finalizers of the module
     */
    Fuzzy.on('start', function() {
        console.info('FuzzySearch module has started');

        Fuzzy.controller = new Controller();
    });

    Fuzzy.on('stop', function() {
        console.info('FuzzySearch module has stoped');

        Fuzzy.controller.destroy();
        Fuzzy.controller = null;
    });

    // Add a global module initializer
    Radio.request('init', 'add', 'module', function() {
        console.info('FuzzySearch module has been initialized');

        // Create a new region
        $('#sidebar').append(
            $('<div id="sidebar--fuzzy" class="layout--body -scroll hidden"/>')
        );
        var region = new Region();

        // Listen to search events
        Radio.channel('global')
        .on('search:shown', Fuzzy.start, Fuzzy)
        .on('search:hidden', Fuzzy.stop, Fuzzy);

        // Module events
        Radio.channel('fuzzySearch')
        .reply('region:show', region.show, region)
        .reply('region:empty', region.empty, region);
    });

    return Fuzzy;

});
