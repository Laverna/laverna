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
    'modules/fs/classes/sync',
], (_, Radio, Marionette, Modules, Sync) => {
    'use strict';

    /**
     * Module which synchronizes all models to a file system.
     * (Works only on Electron app)
     */
    const FS = Modules.module('FS', {});

    /**
     * Initializers & finalizers of the module
     */
    FS.on('start', () => {
        console.info('FS started');
        new Sync();
    });

    FS.on('stop', () => {
    });

    // Add a global module initializer
    Radio.request('init', 'add', 'module', () => {
        FS.start();
    });

    return FS;
});
