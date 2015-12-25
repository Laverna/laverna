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
    'backbone.radio',
    'marionette',
    'modules',
    'modules/codemirror/controller'
], function(_, Radio, Marionette, Modules, Controller) {
    'use strict';

    /**
     * Codemirror module.
     */
    var Module = Modules.module('Codemirror', {});

    /**
     * Initializers & finalizers of the module
     */
    Module.on('start', function() {
        console.info('Codemirror module has started');
        Module.controller = new Controller();
    });

    Module.on('stop', function() {
        console.info('Codemirror module has stoped');

        Module.controller.destroy();
        Module.controller = null;
    });

    // Add a global module initializer
    Radio.request('init', 'add', 'module', function() {
        console.info('Codemirror module has been initialized');

        Radio.channel('notesForm')
        .on('view:ready', Module.start, Module)
        .on('view:destroy', Module.stop, Module);

    });

    return Module;

});
