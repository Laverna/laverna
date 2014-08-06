require.config({
    baseUrl: '../test/',

    packages: [
        // Xregexp
        {
            name     : 'xregexp',
            location : '../app/bower_components/xregexp/src',
            main     : 'xregexp'
        }
    ],

    paths: {
        'sjcl'          :  '../app/bower_components/sjcl/sjcl',
        'jquery'        :  '../app/bower_components/jquery/jquery',
        'i18next'       :  '../app/bower_components/i18next/i18next.min',
        'underscore'    :  '../app/bower_components/underscore/underscore',
        'text'          :  '../app/bower_components/requirejs-text/text',
        'backbone'      :  '../app/bower_components/backbone/backbone',
        'marionette'    :  '../app/bower_components/marionette/lib/core/backbone.marionette',
        'localStorage'  :  '../app/bower_components/backbone.localStorage/backbone.localStorage',
        'backbone.wreqr'           :  '../app/bower_components/backbone.wreqr/lib/backbone.wreqr',
        'backbone.babysitter'      :  '../app/bower_components/backbone.babysitter/lib/backbone.babysitter',
        'indexedDB'     :  '../app/bower_components/indexeddb-backbonejs-adapter/backbone-indexeddb',
        'remotestorage' :  '../app/bower_components/remotestorage.js/release/0.10.0-beta2/remotestorage.amd',
        'toBlob'        :  '../app/bower_components/blueimp-canvas-to-blob/js/canvas-to-blob',
        'mocha'         :  'bower_components/mocha/mocha',
        'chai'          :  'bower_components/chai/chai',
        'chai-jquery'   :  'bower_components/chai-jquery/chai-jquery',
        // Application
        'migrations'    :  '../app/scripts/migrations',
        'models'        :  '../app/scripts/models',
        'collections'   :  '../app/scripts/collections',
        'helpers'       :  '../app/scripts/helpers',
        'libs'          :  '../app/scripts/libs',
        'constants'     :  '../app/scripts/constants',
        'apps'          :  '../app/scripts/apps',
        'dropbox'       :  '../app/scripts/libs/dropbox',
        'app'           :  '../app/scripts/app',
        'locales'       :  '../app/locales'
    },

    shim: {
        mocha: {
            exports: 'mocha'
        },
        chai: {
            exports: 'chai'
        },
        'underscore': {
            exports: '_'
        },
        'jquery': {
            exports: '$'
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
        'chai-jquery': ['jquery', 'chai'],
        'sjcl': {
            exports: 'sjcl'
        }
    },

    urlArgs: 'bust=' + (new Date()).getTime(),
    waitSeconds: 15

});

require([
    'underscore',
    'i18next',
    'chai',
    'chai-jquery',
    'mocha',
    'jquery'
], function (_, i18n, chai, chaiJquery) {
    'use strict';

    // Underscore template
    _.templateSettings = {
        // interpolate : /\{\{(.+?)\}\}/g
        interpolate: /\{\{(.+?)\}\}/g,
        evaluate: /<%([\s\S]+?)%>/g
    };

    var tests = [
        'spec/model-test',
        'spec/collection-test',
        'spec/views/notebooks',
        'spec/utils'
    ];

    // Chai
    chai.should();
    chai.use(chaiJquery);

    /*globals mocha*/
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
            i18n.init({'lng': 'en'}, function () {
                mocha.run();
            });
        }
    });

});
