/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global requirejs, requireNode */
requirejs.config({

    // Find all nested dependencies
    findNestedDependencies: true,
    waitSeconds: 10,

    nodeRequire: (typeof requireNode === 'undefined' ? null : requireNode),

    packages: [
        // Codemirror editor
        {
            name     : 'codemirror',
            location : '../bower_components/codemirror',
            main     : 'lib/codemirror'
        },
        // Prismjs
        {
            name     : 'prism',
            location : '../bower_components/prism',
            main     : 'bundle'
        },
        // Xregexp
        {
            name     : 'xregexp',
            location : '../bower_components/xregexp/src',
            main     : 'xregexp'
        }
    ],
    paths: {
        sjcl                  : '../bower_components/sjcl/sjcl',
        text                  : '../bower_components/requirejs-text/text',
        jquery                : '../bower_components/jquery/dist/jquery',
        q                     : '../bower_components/q/q',
        bootstrap             : '../bower_components/bootstrap/dist/js/bootstrap.min',
        i18next               : '../bower_components/i18next/i18next',
        i18nextXHRBackend     : '../bower_components/i18next-xhr-backend/i18nextXHRBackend',

        // Backbone
        underscore            : '../bower_components/underscore/underscore',
        backbone              : '../bower_components/backbone/backbone',
        marionette            : '../bower_components/backbone.marionette/lib/core/backbone.marionette',
        'backbone.radio'      : '../bower_components/backbone.radio/build/backbone.radio.min',
        'backbone.babysitter' : '../bower_components/backbone.babysitter/lib/backbone.babysitter',
        fuse                  : '../bower_components/fuse/src/fuse',

        // Mousetrap
        'mousetrap'           : '../bower_components/mousetrap/mousetrap',
        'mousetrap.pause'     : '../bower_components/mousetrap/plugins/pause/mousetrap-pause',
        'mousetrap.global'    : '../bower_components/mousetrap/plugins/global-bind/mousetrap-global-bind',

        // Storage adapters
        localforage           : '../bower_components/localforage/dist/localforage',
        remotestorage         : '../bower_components/remotestorage.js/release/stable/remotestorage',
        bluebird              : '../bower_components/bluebird/js/browser/bluebird.min',
        tv4                   : '../bower_components/tv4/tv4',
        dropbox               : 'helpers/Dropbox-sdk.min',

        // Markdown
        'markdown-it'         : '../bower_components/markdown-it/dist/markdown-it.min',
        'markdown-it-san'     : '../bower_components/markdown-it-sanitizer/dist/markdown-it-sanitizer.min',
        'markdown-it-hash'    : '../bower_components/markdown-it-hashtag/dist/markdown-it-hashtag.min',
        'markdown-it-math'    : '../bower_components/markdown-it-math/dist/markdown-it-math.min',
        'markdown-it-imsize'  : '../bower_components/markdown-it-imsize/dist/markdown-it-imsize.min',
        'to-markdown'         : '../bower_components/to-markdown/src/to-markdown',

        // Others
        xss                   : '../bower_components/xss/dist/xss',
        mathjax               : '../bower_components/MathJax/MathJax.js?config=TeX-AMS-MML_HTMLorMML',
        prettify              : '../bower_components/google-code-prettify/src/prettify',
        dropzone              : '../bower_components/dropzone/dist/dropzone-amd-module',
        toBlob                : '../bower_components/blueimp-canvas-to-blob/js/canvas-to-blob',
        blobjs                : '../bower_components/Blob/Blob',
        fileSaver             : '../bower_components/FileSaver/FileSaver',
        enquire               : '../bower_components/enquire/dist/enquire.min',
        hammerjs              : '../bower_components/hammerjs/hammer',
        jHammer               : '../bower_components/jquery-hammerjs/jquery.hammer',
        fastclick             : '../bower_components/fastclick/lib/fastclick',
        devicejs              : '../bower_components/device.js/lib/device.min',
        jszip                 : '../bower_components/jszip/dist/jszip',

        // Aliases
        'modalRegion'         : 'views/modal',
        'brandRegion'         : 'views/brand',
        'apps'                : 'apps',
        'locales'             : '../locales'
    },
    map: {
        '*': {
            'backbone.wreqr' : 'backbone.radio'
        }
    },
    shim: {
        // Backbone
        underscore: {
            exports: '_'
        },
        fileSaver: {
            exports: 'saveAs',
        },
        backbone: {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },

        // Storage adapters
        dropbox: {
            exports: 'Dropbox'
        },
        'remotestorage': {
            exports: 'RemoteStorage',
            deps: [
                'tv4',
                'bluebird',
            ]
        },
        tv4: {
            exports: 'tv4'
        },

        // Markdown
        'to-markdown': {
            exports: 'toMarkdown'
        },

        // Xregexp
        'xregexp/xregexp': {
            exports: 'XRegExp'
        },
        'xregexp/addons/unicode/unicode-base': {
            deps: ['xregexp/xregexp'],
            exports: 'XRegExp'
        },
        'xregexp/addons/unicode/unicode-categories': {
            deps: [
                'xregexp/addons/unicode/unicode-base'
            ],
            exports: 'XRegExp'
        },

        // Others
        sjcl: {
            exports: 'sjcl'
        },
        'prism/bundle': {
            exports: 'Prism'
        },
        xss: {
            exports: 'filterXSS'
        },
        bootstrap: {
            deps: ['jquery']
        },
        'mathjax': {
            exports: 'MathJax'
        },
        devicejs: {
            exports: 'device'
        },
        prettify: {
            exports: 'PR'
        }
    }
});

// Starting point
requirejs(['init']);
