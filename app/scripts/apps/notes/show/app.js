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
    'jquery',
    'app',
    'backbone.radio',
    'marionette',
    'apps/notes/show/controller'
], function(_, $, App, Radio, Marionette, Controller) {
    'use strict';

    /**
     * A module which instantiates the controller that shows a note.
     *
     * Listens to
     * ----------
     * Events:
     * 1. channel: `notes`, event: `model:navigate`
     *    stops itself after this event.
     */
    var Show = App.module('AppNote.Show', {
        startWithParent: false
    });

    Show.on('before:start', function(options) {
        Show.controller = new Controller(options);
        this.listenTo(Radio.channel('notes'), 'model:navigate', Show.stop, Show);
    });

    Show.on('before:stop', function() {
        this.stopListening(Radio.channel('notes'));
        Show.controller.destroy();
        Show.controller = null;
    });

    return Show;
});
