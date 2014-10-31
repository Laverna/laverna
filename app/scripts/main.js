/* global requirejs */
requirejs.config({

    // Find all nested dependencies
    findNestedDependencies: true,
    waitSeconds: 10,

    packages: [
        // Ace editor
        {
            name     : 'ace',
            location : '../bower_components/ace/lib/ace',
            main     : 'ace'
        },
        // Pagedown-ace editor
        {
            name     : 'pagedown-ace',
            location : '../bower_components/pagedown-ace',
            main     : 'Markdown.Editor'
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
        bootstrap             : '../bower_components/bootstrap/dist/js/bootstrap.min',
        i18next               : '../bower_components/i18next/i18next.amd.withJQuery.min',

        // Backbone
        underscore            : '../bower_components/underscore/underscore',
        backbone              : '../bower_components/backbone/backbone',
        marionette            : '../bower_components/marionette/lib/core/backbone.marionette',
        'backbone.wreqr'      : '../bower_components/backbone.wreqr/lib/backbone.wreqr',
        'backbone.babysitter' : '../bower_components/backbone.babysitter/lib/backbone.babysitter',
        'backbone.mousetrap'  : '../bower_components/backbone.mousetrap/backbone.mousetrap',

        // Mousetrap
        'Mousetrap'           : '../bower_components/mousetrap/mousetrap',
        'mousetrap-pause'     : '../bower_components/mousetrap/plugins/pause/mousetrap-pause',

        // Storage adapters
        localStorage          : '../bower_components/backbone.localStorage/backbone.localStorage',
        indexedDB             : '../bower_components/indexeddb-backbonejs-adapter/backbone-indexeddb',
        IndexedDBShim         : '../bower_components/IndexedDBShim/dist/IndexedDBShim',
        remotestorage         : '../bower_components/remotestorage.js/release/0.10.0-beta3/remotestorage-nocache.amd',
        dropbox               : 'libs/dropbox',

        // Markdown
        'pagedown'            : '../bower_components/pagedown/Markdown.Editor',
        'pagedown-extra'      : '../bower_components/pagedown-extra/Markdown.Extra',
        'to-markdown'         : '../bower_components/to-markdown/src/to-markdown',

        // Others
        mathjax               : '../bower_components/MathJax/MathJax.js?config=TeX-AMS-MML_HTMLorMML',
        prettify              : '../bower_components/google-code-prettify/src/prettify',
        dropzone              : '../bower_components/dropzone/downloads/dropzone.min',
        toBlob                : '../bower_components/blueimp-canvas-to-blob/js/canvas-to-blob',
        blobjs                : '../bower_components/Blob/Blob',
        fileSaver             : '../bower_components/FileSaver/FileSaver',
        enquire               : '../bower_components/enquire/dist/enquire.min',
        hammerjs              : '../bower_components/hammerjs/hammer',
        devicejs              : '../bower_components/device.js/lib/device.min',

        // Aliases
        'modalRegion'         : 'views/modal',
        'brandRegion'         : 'views/brand',
        'checklist'           : 'libs/checklist',
        'tags'                : 'libs/tags',
        'apps'                : 'apps',
        'locales'             : '../locales'
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
        'backbone.mousetrap': {
            deps: ['Mousetrap', 'mousetrap-pause', 'backbone']
        },

        // Mousetrap
        'Mousetrap': { },
        'mousetrap-pause': {
            deps: ['Mousetrap']
        },

        // Storage adapters
        localStorage: {
            deps: ['underscore', 'backbone']
        },
        indexedDB: {
            deps: ['underscore', 'backbone']
        },
        'IndexedDBShim': {
            exports: 'shimIndexedDB'
        },
        dropbox: {
            exports: 'Dropbox'
        },
        remotestorage: {
            exports: 'remoteStorage'
        },

        // Markdown
        ace: {
            exports: 'ace'
        },
        'pagedown': {
            exports: 'Markdown',
            deps: [ 'pagedown-extra' ]
        },
        'pagedown-extra': [ 'pagedown-ace' ],
        'pagedown-ace/Markdown.Editor': {
            exports: 'Markdown',
            deps: [ 'pagedown-ace/Markdown.Converter' ]
        },
        'pagedown-ace/Markdown.Sanitizer': {
            deps: [ 'pagedown-ace/Markdown.Converter' ]
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

        // Others
        sjcl: {
            exports: 'sjcl'
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
