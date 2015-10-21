/* global define */
define([
    'underscore',
    'marionette',
    'backbone.radio',
    'modules',
    'apps/confirm/show/controller'
], function(_, Marionette, Radio, Modules, Controller) {
    'use strict';

    /**
     * Confirm module. We use it as a replacement for window.confirm.
     *
     * Replies on channel `Confirm` to:
     * 1. request `start` - starts itself.
     * 2. request `stop`  - stops itself.
     */
    var Confirm = Modules.module('Confirm', {startWithParent: false});

    Confirm.on('start', function(options) {
        Confirm.controller = new Controller(options);
    });

    Confirm.on('stop', function() {
        Confirm.controller.destroy();
        Confirm.controller = null;
    });

    // Initializer
    Radio.request('init', 'add', 'app', function() {
        Radio.reply('Confirm', 'start', Confirm.start, Confirm);
        Radio.reply('Confirm', 'stop', Confirm.stop, Confirm);
    });

    return Confirm;

});
