require.config({
    paths: {
        // Dependencies       :  and libraries
        jquery                :  '../bower_components/jquery/jquery',
        underscore            :  '../bower_components/underscore/underscore',
        backbone              :  '../bower_components/backbone/backbone',
        marionette            :  '../bower_components/marionette/lib/core/amd/backbone.marionette',
        localStorage          :  '../bower_components/backbone.localStorage/backbone.localStorage',
        'backbone.wreqr'      :  '../bower_components/backbone.wreqr/lib/amd/backbone.wreqr',
        'backbone.babysitter' :  '../bower_components/backbone.babysitter/lib/amd/backbone.babysitter'
        // Application        :  scripts here
    },
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        }
    }
});

require(['jquery', 'router', 'app'],
function ($, Router, App) {
    'use strict';

    // App starts here
    new Router();
    App.start();
});
