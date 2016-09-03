/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define, requirejs */
define([
    'jquery',
    'q',
    'fastclick',
    'hammerjs',
    'helpers/radio.shim',
    'backbone.radio',
    'app',
    'initializers',
    'bootstrap',
    'jHammer'
], function($, Q, FastClick, Hammer, shim, Radio, App) {
    'use strict';

    var hash = document.location.hash;
    Radio.reply('global', 'hash:original', function() {
        return hash;
    });

    console.time('App');

    // Remove 300ms delay
    FastClick.attach(document.body);

    // Enable text selection
    delete Hammer.defaults.cssProps.userSelect;

    // Load all modules then start an application
    requirejs([
        // Helpers
        'helpers/storage',
        'helpers/uri',
        'helpers/title',
        'helpers/i18next',
        'helpers/keybindings',

        // Classes
        'moduleLoader',
        'classes/encryption',

        // Collection modules
        'collections/modules/notes',
        'collections/modules/notebooks',
        'collections/modules/tags',
        'collections/modules/files',
        'collections/modules/configs',

        // Apps
        'apps/confirm/appConfirm',
        'apps/encryption/appEncrypt',
        'apps/navbar/appNavbar',
        'apps/notes/appNote',
        'apps/notebooks/appNotebooks',
        'apps/settings/appSettings',
        'apps/help/appHelp',

        // Modules
        'modules/markdown/module',
        'modules/codemirror/module',
        'modules/linkDialog/module',
        'modules/fileDialog/module',
        'modules/importExport/module'
    ], function(storage) {
        // Get profile name from location hash
        var profile = document.location.hash.match(/\/?p\/([^/]*)\//);
        profile     = (!profile ? profile : profile[profile.index]);

        console.warn('prof', profile);

        return storage.check()
        .then(function() {
            return Radio.request('configs', 'get:all', {profile: profile});
        })
        // Load optional modules
        .then(function() {
            return Radio.request('init', 'start', 'load:modules')();
        })
        .then(Radio.request('init', 'start', 'app:before app auth module'))
        .then(function() {
            console.log('modules are loaded');
            App.start();
        })
        .fail(function(e) {
            console.error('Error', e);
        });

    });

});
