/**
 * Copyright (C) 2015 Laverna project Authors.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
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
