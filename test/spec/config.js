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
        'backbone.assosiations': '../bower_components/backbone-associations/backbone-associations',
        // Test               :  scripts
        noteModel             :  '../../test/spec/Models/note',
        notebookModel         :  '../../test/spec/Models/notebook',
        tagModel              :  '../../test/spec/Models/tag',
        notebooksCollection   :  '../../test/spec/Collection/notebooks',
        tagsCollection        :  '../../test/spec/Collection/tags',
        collectionTest        :  '../../test/spec/Collection/notes',
        configModel           :  '../../test/spec/Models/config',
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
        },
        'backbone.assosiations': {
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
    'notebooksCollection',
    'tagsCollection',
    'configModel'
], function () {
    'use strict';
});
