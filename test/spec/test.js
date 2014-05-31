require.config({
    baseUrl: '../test/',

    paths: {
        'jquery'        :  '../app/bower_components/jquery/jquery',
        'underscore'    :  '../app/bower_components/underscore/underscore',
        'backbone'      :  '../app/bower_components/backbone/backbone',
        'localStorage'  :  '../app/bower_components/backbone.localStorage/backbone.localStorage',
        'indexedDB'     :  '../app/bower_components/indexeddb-backbonejs-adapter/backbone-indexeddb',
        'remotestorage' :  '../app/bower_components/remotestorage.js/release/0.10.0-beta2/remotestorage.amd',
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
        'dropbox'       :  '../app/scripts/libs/dropbox'
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
        'dropbox': {
            exports: 'Dropbox'
        },
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'indexedDB': {
            deps: ['underscore', 'backbone']
        },
        'chai-jquery': ['jquery', 'chai']
    },

    urlArgs: 'bust=' + (new Date()).getTime(),
    waitSeconds: 15

});

require([
    'chai',
    'chai-jquery',
    'mocha',
    'jquery'
], function (chai, chaiJquery) {
    'use strict';

    // Chai
    chai.should();
    chai.use(chaiJquery);

    /*globals mocha*/
    mocha.setup('bdd');
    mocha.bail(false);

    require([
        'spec/model-test',
        'spec/sync-test'
    ], function () {
        if (window.mochaPhantomJS) {
            window.mochaPhantomJS.run();
        }
        else {
            mocha.run();
        }
    });

});
