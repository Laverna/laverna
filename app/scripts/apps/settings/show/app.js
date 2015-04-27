/* global define */
define([
    'underscore',
    'marionette',
    'backbone.radio',
    'app',
    'apps/settings/show/controller'
], function(_, Marionette, Radio, App, Controller) {
    'use strict';

    var Show = App.module('AppSettings.Show', {startWithParent: false});

    /**
     * Initializer & finalizer
     */
    Show.on('before:start', function(options) {
        Show.controller = new Controller(options);
    });

    Show.on('before:stop', function() {
        Show.controller.destroy();
        delete Show.controller;
    });

    return Show;
});
