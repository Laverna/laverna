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

    List.on('before:start', function(options) {
        List.controller = new Controller(options);
        App.channel.on('notes:filter', List.controller.filter);
    });

    List.on('before:stop', function() {
        App.channel.off('notes:filter');
        List.controller.destroy();
        delete List.controller;
    });

    return List;
});
