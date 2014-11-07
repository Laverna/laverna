/* global define, requirejs */
define([
    'jquery',
    'app',
    'bootstrap'
], function($, App) {
    'use strict';

    console.time('App');

    // Load all modules then start an application
    requirejs([
        // Helpers
        'helpers/configs',
        'helpers/storage',
        'helpers/install',
        'helpers/uri',
        'helpers/i18next',
        'helpers/keybindings',

        // Modules
        'apps/confirm/appConfirm',
        'apps/encryption/encrypt',
        'apps/navbar/appNavbar',
        'apps/notes/appNote',
        'apps/notebooks/appNotebooks',
        'apps/settings/appSettings',
        'apps/help/appHelp'
    ], function(Configs, storage) {
        console.log('modules are loaded');

        Configs.fetch()
            .then(storage.check)
            .then(function() {
                App.start();
            });
    });
});
