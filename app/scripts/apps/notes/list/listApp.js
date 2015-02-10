/* global define */
define([
    'underscore',
    'app',
    'apps/notes/list/controller'
], function(_, App, Controller) {
    'use strict';

    var List = App.module('AppNote.List', {
        startWithParent: false
    });

    List.addInitializer(function(options) {
        List.controller = new Controller(options);
    });

    List.addFinalizer(function() {
        List.controller.destroy();
        delete List.controller;
    });

    return List;
});
