/* global define */
define([
    'underscore',
    'backbone.radio',
    'marionette',
    'modules',
    'modules/remotestorage/classes/sync'
], function(_, Radio, Marionette, Modules, Sync) {
    'use strict';

    var RemoteStorage = Modules.module('RemoteStorage', {});

    /**
     * Initializers & finalizers of the module
     */
    RemoteStorage.on('start', function() {
        console.info('RemoteStorage started');
        new Sync();
    });

    RemoteStorage.on('stop', function() {
    });

    // Add a global module initializer
    Radio.request('init', 'add', 'module', function() {
        RemoteStorage.start();
    });

    return RemoteStorage;
});
