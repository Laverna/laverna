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
        'helpers/configs',
        'helpers/storage',
        'helpers/install',
        'helpers/uri',
        'helpers/title',
        'helpers/i18next',
        'helpers/keybindings',

        // Collection modules
        'collections/modules/notes',
        'collections/modules/notebooks',
        'collections/modules/tags',

        // Modules
        'apps/confirm/appConfirm',
        'apps/encryption/encrypt',
        'apps/navbar/appNavbar',
        'apps/notes/appNote',
        'apps/notebooks/appNotebooks',
        // 'apps/settings/appSettings',
        // 'apps/help/appHelp'
    ].concat(exts), function(Configs, storage) {

        Configs.fetch()
        .then(storage.check)
        .then(Radio.request('init', 'start', 'app:before app module'))
        .then(function() {
            console.log('modules are loaded');
            App.start();
        });

    });
});
