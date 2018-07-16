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
    'modules/remotestorage/classes/sync',
], (_, Radio, Marionette, Modules, Sync) => {
    'use strict';

    const RemoteStorage = Modules.module('RemoteStorage', {});

    /**
     * Initializers & finalizers of the module
     */
    RemoteStorage.on('start', () => {
        console.info('RemoteStorage started');
        new Sync();
    });

    RemoteStorage.on('stop', () => {
    });

    // Add a global module initializer
    Radio.request('init', 'add', 'module', () => {
        RemoteStorage.start();
    });

    return RemoteStorage;
});
