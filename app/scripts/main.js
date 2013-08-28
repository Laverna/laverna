require.config({
    paths: {
        // Dependencies       : and libraries
        text                  : '../bower_components/requirejs-text/text',
        jquery                : '../bower_components/jquery/jquery',
        underscore            : '../bower_components/underscore/underscore',
        backbone              : '../bower_components/backbone/backbone',
        marionette            : '../bower_components/marionette/lib/core/amd/backbone.marionette',
        localStorage          : '../bower_components/backbone.localStorage/backbone.localStorage',
        'backbone.wreqr'      : '../bower_components/backbone.wreqr/lib/amd/backbone.wreqr',
        'backbone.babysitter' : '../bower_components/backbone.babysitter/lib/amd/backbone.babysitter',
        'bootstrap'           : '../bower_components/bootstrap/dist/js/bootstrap.min',
        'bootstrap-modal'     : '../bower_components/backbone.bootstrap-modal/src/backbone.bootstrap-modal',
        // Application        : scripts here
        'noteEdit'            : 'views/item/noteEdit',
        // Templates          : here
        'modalTempl'          : 'templates/modal.html',
        'noteFormTempl'       : 'templates/notes/form.html'
    },
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        bootstrap: {
            deps: ['jquery'],
            exports: '$'
        },
        'bootstrap-modal': {
            deps: ['bootstrap', 'underscore', 'jquery'],
            exports: 'Backbone.BootstrapModal'
        }
    },
    waitSeconds: 8
});

require(['jquery', 'router', 'app'],
function ($, Router, App) {
    'use strict';

    // App starts here
    new Router();
    App.start();
});
