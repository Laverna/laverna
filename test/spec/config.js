require.config({
    baseUrl: '../app/scripts/',
    paths: {
        jquery                :  '../bower_components/jquery/jquery',
        text                  :  '../bower_components/requirejs-text/text',
        underscore            :  '../bower_components/underscore/underscore',
        backbone              :  '../bower_components/backbone/backbone',
        marionette            :  '../bower_components/marionette/lib/core/amd/backbone.marionette',
        localStorage          :  '../bower_components/backbone.localStorage/backbone.localStorage',
        'backbone.wreqr'      :  '../bower_components/backbone.wreqr/lib/amd/backbone.wreqr',
        'backbone.babysitter' :  '../bower_components/backbone.babysitter/lib/amd/backbone.babysitter',
        // Test               :  scripts
        noteModel             :  '../../test/spec/Models/note',
        notebookModel         :  '../../test/spec/Models/notebook',
        collectionTest        :  '../../test/spec/Collection/notes'
    },
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: ['jquery', 'underscore'],
            exports: 'Backbone'
        }
    },
    waitSeconds: 15
});

require(['noteModel', 'notebookModel', 'collectionTest'], function () {
    'use strict';
});
