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

require(['backbone', 'underscore', 'jquery', 'marionette', 'router'],
    function (Backbone, _, $, Marionette, Router) {
    'use strict';
    new Router();
    Backbone.history.start();
//    console.log('Running jQuery %s', $().jquery);
});
