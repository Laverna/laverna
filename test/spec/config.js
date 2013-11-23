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
        'backbone.relational' : '../bower_components/backbone-relational/backbone-relational',
        // Test               :  scripts
        noteModel             :  '../../test/spec/Models/note',
        notebookModel         :  '../../test/spec/Models/notebook',
        tagModel              :  '../../test/spec/Models/tag',
        notebooksCollection   :  '../../test/spec/Collection/notebooks',
        collectionTest        :  '../../test/spec/Collection/notes'
    },
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: ['jquery', 'underscore'],
            exports: 'Backbone'
        },
        'backbone.relational': {
            deps: ['backbone']
        }
    },
    waitSeconds: 15
});

require([
    'noteModel',
    'notebookModel',
    'tagModel',
    'collectionTest',
    'notebooksCollection'
], function () {
    'use strict';
});
