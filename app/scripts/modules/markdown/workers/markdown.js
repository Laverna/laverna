/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global requirejs, importScripts, self */
'use strict';
importScripts('../../../../bower_components/requirejs/require.js');

requirejs.config({
    baseUrl: '../../../',
    packages: [
        // Prismjs
        {
            name     : 'prism',
            location : '../bower_components/prism',
            main     : 'bundle'
        },
    ],
    paths: {
        q                    : '../bower_components/q/q',
        underscore           : '../bower_components/underscore/underscore',
        'markdown-it'        : '../bower_components/markdown-it/dist/markdown-it.min',
        'markdown-it-san'    : '../bower_components/markdown-it-sanitizer/dist/markdown-it-sanitizer.min',
        'markdown-it-hash'   : '../bower_components/markdown-it-hashtag/dist/markdown-it-hashtag.min',
        'markdown-it-math'   : '../bower_components/markdown-it-math/dist/markdown-it-math.min',
        'markdown-it-imsize' : '../bower_components/markdown-it-imsize/dist/markdown-it-imsize.min',
    },
    shim: {
        'prism/bundle': {
            exports: 'Prism'
        },
    }
});

// Prevent Prismjs from listening to our events
self.addEventListener = undefined;

requirejs([
    'modules/markdown/libs/markdown-it'
], function(Markdown) {
    var markdown = new Markdown();

    // Listen to the webworker messages
    self.onmessage = function(data) {
        var msg = data.data;

        if (markdown[msg.msg]) {
            return markdown[msg.msg](msg.data)
            .then(function(result) {
                self.postMessage({
                    msg       : 'done',
                    promiseId : msg.promiseId,
                    data      : result
                });
            })
            .fail(function(e) {
                self.postMessage({
                    msg       : 'fail',
                    promiseId : msg.promiseId,
                    data      : e
                });
            });
        }

        console.error('MarkdownIt module:', 'Method doesn\'t exist', msg.msg);
    };

    // Post a message that the worker is ready
    self.postMessage({msg: 'ready'});
});
