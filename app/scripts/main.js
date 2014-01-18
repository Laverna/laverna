require.config({
    packages: [
        // Ace editor
        {
            name     : 'ace',
            location : '../bower_components/ace/lib/ace',
            main     : 'ace'
        }
    ],
    paths: {
        sjcl                       :  '../bower_components/sjcl/sjcl',
        // Dependencies            :  and libraries
        text                       :  '../bower_components/requirejs-text/text',
        jquery                     :  '../bower_components/jquery/jquery',
        underscore                 :  '../bower_components/underscore/underscore',
        // Backbone &              :  Marionette
        backbone                   :  '../bower_components/backbone/backbone',
        marionette                 :  '../bower_components/marionette/lib/core/amd/backbone.marionette',
        localStorage               :  '../bower_components/backbone.localStorage/backbone.localStorage',
        IndexedDBShim              :  '../bower_components/IndexedDBShim/dist/IndexedDBShim.min',
        indexedDB                  :  '../bower_components/indexeddb-backbonejs-adapter/backbone-indexeddb',
        dropbox                    :  'libs/dropbox',
        'backbone.wreqr'           :  '../bower_components/backbone.wreqr/lib/amd/backbone.wreqr',
        'backbone.babysitter'      :  '../bower_components/backbone.babysitter/lib/amd/backbone.babysitter',
        'backbone.assosiations'    :  '../bower_components/backbone-associations/backbone-associations',
        // Keybindings             :
        'Mousetrap'                :  '../bower_components/mousetrap/mousetrap',
        'mousetrap-pause'          :  '../bower_components/mousetrap/plugins/pause/mousetrap-pause',
        'backbone.mousetrap'       :  '../bower_components/backbone.mousetrap/backbone.mousetrap',
        // Pagedown                :
        'pagedown-ace'             :  '../bower_components/pagedown-ace/Markdown.Editor',
        'pagedown.converter'       :  '../bower_components/pagedown-ace/Markdown.Converter',
        'pagedown-extra'           :  '../bower_components/pagedown-extra/Markdown.Extra',
        'pagedown.sanitizer'       :  '../bower_components/pagedown-ace/Markdown.Sanitizer',
        // Markdown helpers        :
        'checklist'                :  'libs/checklist',
        'tags'                     :  'libs/tags',
        // Other                   :  libraries
        'bootstrap'                :  '../bower_components/bootstrap/dist/js/bootstrap.min',
        'prettify'                 :  '../bower_components/google-code-prettify/src/prettify',
        'bootstrap-modal'          :  'libs/bootstrap-modal/src/backbone.bootstrap-modal',
        // View                    :  scripts here
        'modalRegion'              :  'views/modal',
        'brandRegion'              :  'views/brand',
        'apps'                     :  'apps/'
    },
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        localStorage: {
            deps: ['underscore', 'backbone']
        },
        IndexedDBShim: {},
        indexedDB: {
            deps: [
                // 'IndexedDBShim',
                'underscore',
                'backbone'
            ]
        },
        dropbox: {
            exports: 'Dropbox'
        },
        'backbone.assosiations': {
            deps: ['backbone']
        },
        bootstrap: {
            deps: ['jquery'],
            exports: '$'
        },
        'Mousetrap': { },
        'mousetrap-pause': {
            deps: ['Mousetrap']
        },
        'backbone.mousetrap': {
            deps: ['Mousetrap', 'mousetrap-pause']
        },
        ace: {
            exports: 'ace'
        },
        cjcl: {
            exports: 'cjcl'
        },
        'pagedown-ace': [
            '../bower_components/pagedown-ace/Markdown.Converter'
        ],
        'pagedown.sanitizer': [
        ],
        'pagedown-extra': [
            'pagedown-ace'
        ],
        prettify: {
            exports: 'prettify'
        },
        'bootstrap-modal': {
            deps: ['bootstrap', 'underscore', 'jquery'],
            exports: 'Backbone.BootstrapModal'
        }
    },
    findNestedDependencies: true,
    waitSeconds: 10
});

require([
    'jquery',
    'app',
    'bootstrap',
    'IndexedDBShim'    // IndexedDB support in Safari and in old Chrome
], function ($, App) {
    'use strict';

    App.start();

});
