/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define */
define([
    'backbone.radio',
    'modules/markdown/libs/markdown'
], function(Radio, Markdown) {
    'use strict';

    // Add a global module initializer
    Radio.request('init', 'add', 'module', function() {
        console.info('Markdown module has been initialized');
        var md = new Markdown();

        Radio.reply('markdown', {
            'render': md.render,
            'parse' : md.parse,
        }, md);

        if (md.workerPromise) {
            return md.workerPromise.promise;
        }
    });

});
