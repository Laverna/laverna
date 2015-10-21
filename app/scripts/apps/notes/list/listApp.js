/* global define */
define([
    'underscore',
    'app',
    'backbone.radio',
    'apps/notes/list/controller'
], function(_, App, Radio, Controller) {
    'use strict';

    /**
     * List module - shows notes list in the sidebar.
     *
     * Listens to events on channel `appNote`:
     * 1. `filter` - filters notes
     */
    var List = App.module('AppNote.List', {
        startWithParent: false
    });

    List.on('before:start', function(options) {
        List.controller = new Controller(options);
        Radio.reply('appNote', 'filter', List.controller.filter, List.controller);
    });

    List.on('before:stop', function() {
        Radio.channel('appNote').stopReplying('filter');
        List.controller.destroy();
        List.controller = null;
    });

    return List;
});
