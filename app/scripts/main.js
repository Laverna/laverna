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
        // Ace editor
        {
            name     : 'ace',
            location : '../bower_components/ace/lib/ace',
            main     : 'ace'
        },
        // Codemirror editor
        {
            name     : 'codemirror',
            location : '../bower_components/codemirror',
            main     : 'lib/codemirror'
        },
        // Pagedown editor
        {
            name     : 'pagedown',
            location : '../bower_components/pagedown',
            main     : 'Markdown.Editor'
        },
        // Pagedown-ace editor
        {
            name     : 'pagedown-ace',
            location : '../bower_components/pagedown-ace',
            main     : 'Markdown.Editor'
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
        i18next               : '../bower_components/i18next/i18next.amd.withJQuery.min',

        // Backbone
        underscore            : '../bower_components/underscore/underscore',
        backbone              : '../bower_components/backbone/backbone',
        marionette            : '../bower_components/marionette/lib/core/backbone.marionette',
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
        dropbox               : '../bower_components/dropbox/dropbox',

        // Markdown
        'markdown-it'         : '../bower_components/markdown-it/dist/markdown-it',
        'markdown-it-san'     : '../bower_components/markdown-it-sanitizer/dist/markdown-it-sanitizer',
        'markdown-it-hash'    : '../bower_components/markdown-it-hashtag/dist/markdown-it-hashtag',
        'markdown-it-math'    : '../bower_components/markdown-it-math/dist/markdown-it-math',
        'pagedown-extra'      : '../bower_components/pagedown-extra/Markdown.Extra',
        'to-markdown'         : '../bower_components/to-markdown/src/to-markdown',

        // Others
        dompurify             : '../bower_components/DOMPurify/src/purify',
        mathjax               : '../bower_components/MathJax/MathJax.js?config=MML_HTMLorMML',
        hljs                  : '../bower_components/highlightjs/highlight.pack',
        prettify              : '../bower_components/google-code-prettify/src/prettify',
        dropzone              : '../bower_components/dropzone/dist/dropzone-amd-module',
        toBlob                : '../bower_components/blueimp-canvas-to-blob/js/canvas-to-blob',
        blobjs                : '../bower_components/Blob/Blob',
        fileSaver             : '../bower_components/FileSaver/FileSaver',
        enquire               : '../bower_components/enquire/dist/enquire.min',
        hammerjs              : '../bower_components/hammerjs/hammer',
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
        ace: {
            exports: 'ace'
        },
        'pagedown/Markdown.Editor': {
            exports: 'Markdown.Editor',
            deps: [ 'pagedown-extra' ]
        },
        'pagedown-ace/Markdown.Editor': {
            exports: 'Markdown.Editor',
            deps: [ 'pagedown-extra' ]
        },
        'pagedown-extra': {
            exports: 'Markdown',
            deps: [
                'pagedown/Markdown.Converter',
                'pagedown/Markdown.Sanitizer'
            ]
        },
        'pagedown/Markdown.Converter': {
            exports: 'Markdown'
        },
        'pagedown/Markdown.Sanitizer': {
            deps: [ 'pagedown/Markdown.Converter' ]
        },
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
