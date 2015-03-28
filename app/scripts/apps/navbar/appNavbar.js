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

    Navbar.on('start', function() {
        Navbar.controller = new Controller();
    });

    Navbar.on('stop', function() {
        Navbar.controller.destroy();
        delete Navbar.controller;
    });

    Radio.command('init', 'add', 'app', function() {
        Radio.complyOnce('navbar', 'start', Navbar.start, Navbar);
    });

    return Navbar;
});
