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
     * Commands:
     * 1. channel: `fuzzySearch`, command: `region:show`
     *    renders the provided view in fuzzy search region
     * 2. channel: `fuzzySearch`, command: `region:empty`
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
        delete Fuzzy.controller;
    });

    // Add a global module initializer
    Radio.command('init', 'add', 'module', function() {
        console.info('FuzzySearch module has been initialized');

        // Create a new region
        $('#sidebar').append($('<div id="fuzzy-sidebar" class="hidden"/>'));
        var region = new Region();

        // Listen to search events
        Radio.channel('global')
        .on('search:shown', Fuzzy.start, Fuzzy)
        .on('search:hidden', Fuzzy.stop, Fuzzy);

        // Module events
        Radio.channel('fuzzySearch')
        .comply('region:show', region.show, region)
        .comply('region:empty', region.empty, region);
    });

    return Fuzzy;

});
