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
        delete Sidebar.controller;
    });

    return Sidebar;
});
