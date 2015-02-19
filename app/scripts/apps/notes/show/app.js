/* global define */
define([
    'underscore',
    'jquery',
    'app',
    'backbone.radio',
    'marionette',
    'apps/notes/show/controller'
], function(_, $, App, Radio, Marionette, Controller) {
    'use strict';

    /**
     * A module which instantiates the controller that shows a note.
     */
    var Show = App.module('AppNote.Show', {
        startWithParent: false
    });

    Show.on('before:start', function(options) {
        Show.controller = new Controller(options);
    });

    Show.on('before:stop', function() {
        Show.controller.destroy();
        delete Show.controller;
    });

    return Show;
});
