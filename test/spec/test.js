require.config({
    baseUrl: '../app/scripts',

    packages: [
        // Xregexp
        {
            name     : 'xregexp',
            location : '../bower_components/xregexp/src',
            main     : 'xregexp'
        },
        // Pagedown-ace editor
        {
            name     : 'pagedown-ace',
            location : '../bower_components/pagedown-ace',
            main     : 'Markdown.Editor'
        },
        {
            name     : 'spec',
            location : '../../test/spec'
        }
    ],

    paths: {
        'sjcl'          :  '../bower_components/sjcl/sjcl',
        'jquery'        :  '../bower_components/jquery/dist/jquery',
        'bootstrap'     :  '../bower_components/bootstrap/dist/js/bootstrap.min',
        'i18next'       :  '../bower_components/i18next/i18next.min',
        'Mousetrap'     :  '../bower_components/mousetrap/mousetrap',
        'mousetrap-pause'  :  '../bower_components/mousetrap/plugins/pause/mousetrap-pause',
        'underscore'    :  '../bower_components/underscore/underscore',
        'text'          :  '../bower_components/requirejs-text/text',
        'backbone'      :  '../bower_components/backbone/backbone',
        'backbone.mousetrap' :  '../bower_components/backbone.mousetrap/backbone.mousetrap',
        'marionette'    :  '../bower_components/marionette/lib/core/backbone.marionette',
        'localStorage'  :  '../bower_components/backbone.localStorage/backbone.localStorage',
        'backbone.wreqr'       :  '../bower_components/backbone.wreqr/lib/backbone.wreqr',
        'backbone.babysitter'  :  '../bower_components/backbone.babysitter/lib/backbone.babysitter',
        'indexedDB'     :  '../bower_components/indexeddb-backbonejs-adapter/backbone-indexeddb',
        'remotestorage' :  '../bower_components/remotestorage.js/release/0.10.0-beta2/remotestorage.amd',
        'toBlob'        :  '../bower_components/blueimp-canvas-to-blob/js/canvas-to-blob',
        'chai-jquery'   :  '../../test/bower_components/chai-jquery/chai-jquery',
        // Pagedown     :
        'pagedown'      :  '../bower_components/pagedown/Markdown.Editor',
        'pagedown-extra':  '../bower_components/pagedown-extra/Markdown.Extra',
        'locales'       :  '../locales'
    },

    shim: {
        'underscore': {
            exports: '_'
        },
        'jquery': {
            exports: '$'
        },
        'bootstrap': {
            deps: ['jquery']
        },
        'i18next': {
            deps: ['jquery'],
            exports: 'i18n'
        },
        'dropbox': {
            exports: 'Dropbox'
        },
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'backbone.mousetrap': {
            deps: ['Mousetrap', 'mousetrap-pause', 'backbone']
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
        // Xregexp
        'xregexp/xregexp': {
            exports: 'XRegExp'
        },
        'xregexp/addons/unicode/unicode-base': {
            deps: ['xregexp/xregexp'],
            exports: 'XRegExp'
        },
        'indexedDB': {
            deps: ['underscore', 'backbone']
        },
        'chai-jquery': ['jquery'],
        'sjcl': {
            exports: 'sjcl'
        }
    },

    urlArgs: 'bust=' + (new Date()).getTime(),
    waitSeconds: 15

});

/* global mocha, chai */
require([
    'underscore',
    'i18next',
    'chai-jquery',
    'helpers/i18next',
    'jquery',
    'bootstrap'
], function (_, i18n, chaiJquery) {
    'use strict';

    // Underscore template
    _.templateSettings = {
        interpolate: /\{\{(.+?)\}\}/g,
        evaluate: /<%([\s\S]+?)%>/g
    };

    var tests = [
        'spec/notebooks',
        'spec/model-test',
        'spec/collection-test',
        'spec/views/notebooks',
        'spec/views/tagList',
        'spec/views/notebookLayout',
        'spec/views/notebooksForm',
        'spec/views/tagForm',
        'spec/views/navbarView',
        'spec/views/confirmView',
        'spec/views/settingsShow',
        'spec/views/helpShow',
        'spec/views/helpAbout',
        'spec/utils'
    ];

    // Chai
    chai.should();
    chai.use(chaiJquery);

    mocha.setup('bdd');
    mocha.bail(false);

    // Test synchronizing only in browsers
    if ( !window.mochaPhantomJS) {
        // tests.push('spec/sync-test');
        tests.push('spec/auth-test');
    }

    require(tests, function () {
        if (window.mochaPhantomJS) {
            window.mochaPhantomJS.run();
        }
        else {
            i18n.init({
                'lng': 'en',
                'resPostPath': '../app/locales'
            }, function () {
                mocha.run();
            });
        }
    });

});
