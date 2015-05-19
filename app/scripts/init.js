/* global define, requirejs */
define([
    'jquery',
    'helpers/radio.shim',
    'backbone.radio',
    'app',
    'initializers',
    'bootstrap'
], function($, shim, Radio, App) {
    'use strict';

    console.time('App');

    var exts = [
        'modules/pagedown/module',
        'modules/fuzzySearch/module'
    ];

    // Load all modules then start an application
    requirejs([
        // Helpers
        'helpers/storage',
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
        'collections/modules/configs',

        // Modules
        'apps/confirm/appConfirm',
        'apps/encryption/appEncrypt',
        'apps/navbar/appNavbar',
        'apps/notes/appNote',
        'apps/notebooks/appNotebooks',
        'apps/settings/appSettings',
        'apps/help/appHelp'
    ].concat(exts), function(storage) {
        // Get profile name from location hash
        var profile = document.location.hash.match(/\/?p\/([^/]*)\//);
        profile     = (!profile ? profile : profile[profile.index]);

        console.warn('prof', profile);

        Radio.request('configs', 'get:all', {profile: profile})
        .then(storage.check)
        .then(Radio.request('init', 'start', 'app:before app module'))
        .then(function() {
            console.log('modules are loaded');
            App.start();
        });

    });
});
