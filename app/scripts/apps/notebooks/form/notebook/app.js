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
    'app',
    'apps/notebooks/form/notebook/controller'
], function(_, Marionette, Radio, App, Controller) {
    'use strict';

    /**
     * Notebook form module.
     *
     * Replies to requests on channel `appNotebooks`
     * 1. request: `form:stop` - stops itself.
     */
    var Form = App.module('AppNotebooks.Form.Notebook', {startWithParent: false});

    Form.on('before:start', function(options) {
        Form.controller = new Controller(options);

        Radio.reply('appNotebooks', 'form:stop', Form.stop, Form);
    });

    Form.on('before:stop', function() {
        Radio.stopReplying('appNotebooks', 'form:stop');

        Form.controller.destroy();
        Form.controller = null;
    });

    return Form;

});
