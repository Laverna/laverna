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
    'helpers/radio.shim',
    'backbone.radio',
    'app',
    'initializers',
    'backbone.sync',
    'bootstrap'
], function($, Q, shim, Radio, App) {
    'use strict';

    var hash = document.location.hash;
    Radio.reply('global', 'hash:original', function() {
        return hash;
    });

    console.time('App');

    // Load all modules then start an application
    requirejs([
        // Helpers
        'helpers/uri',
        'helpers/install',
        'helpers/title',
        'helpers/i18next',
        'helpers/keybindings',

        // Classes
        'classes/encryption',

        // Collection modules
        'collections/modules/notes',
        'collections/modules/notebooks',
        'collections/modules/tags',
        'collections/modules/files',
        'collections/modules/configs',

        // Modules
        'apps/confirm/appConfirm',
        'apps/encryption/appEncrypt',
        'apps/navbar/appNavbar',
        'apps/notes/appNote',
        'apps/notebooks/appNotebooks',
        'apps/settings/appSettings',
        'apps/help/appHelp',

        // Optional modules
        'modules/pagedown/module',
        'modules/tags/module',
        'modules/tasks/module',
        'modules/linkDialog/module',
        'modules/fileDialog/module',
        'modules/fuzzySearch/module',
        'modules/codePrettify/module',
        'modules/mathjax/module'
    ], function() {
        // Get profile name from location hash
        var profile = document.location.hash.match(/\/?p\/([^/]*)\//);
        profile     = (!profile ? profile : profile[profile.index]);

        console.warn('prof', profile);

        Radio.request('configs', 'get:all', {profile: profile})
        .then(function() {
            var modules = [],
                defer   = Q.defer();

            switch (Radio.request('configs', 'get:config', 'cloudStorage')) {
                case 'remotestorage':
                    modules.push('modules/remotestorage/module');
                    break;

                case 'dropbox':
                    modules.push('modules/dropbox/module');
                    break;

                default:
                    return defer.resolve();
            }

            requirejs(modules, function() {
                defer.resolve();
            });

            return defer.promise;
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
