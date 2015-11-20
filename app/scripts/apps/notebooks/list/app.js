/* global define */
define([
    'underscore',
    'marionette',
    'backbone.radio',
    'app',
    'apps/notebooks/list/controller'
], function(_, Marionette, Radio, App, Controller) {
    'use strict';

    /**
     * Notebooks list sub module.
     * It shows notebooks and tags list.
     */
    var List = App.module('AppNotebooks.List', {startWithParent: false});

    List.on('before:start', function(options) {
        List.controller = new Controller(options);
    });

    List.on('before:stop', function() {
        List.controller.destroy();
        List.controller = null;
    });

    return List;

});
