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
     * Complies to commands:
     * 1. channel: `navbar`, command: `start`
     *    starts itself.
     */
    var Navbar = Modules.module('Navbar', {startWithParent: false});

    Navbar.on('start', function(options) {
        Navbar.controller = new Controller(options);
    });

    Navbar.on('stop', function() {
        Navbar.controller.destroy();
        delete Navbar.controller;
    });

    // Initializer
    Radio.command('init', 'add', 'app:before', function() {
        Radio.comply('navbar', 'stop', Navbar.stop, Navbar);

        Radio.comply('navbar', 'start', function(options) {
            // Just trigger an event
            if (Navbar._isInitialized) {
                return Navbar.controller.trigger('change:title', options);
            }

            Navbar.start(options);
        });

    });

    return Navbar;
});
