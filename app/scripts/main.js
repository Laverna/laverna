require.config({
    packages: [{
        name     : 'ace',
        location : '../bower_components/ace/lib/ace',
        main     : 'ace'
    }],
    paths: {
        // Dependencies       : and libraries
        text                  : '../bower_components/requirejs-text/text',
        jquery                : '../bower_components/jquery/jquery',
        underscore            : '../bower_components/underscore/underscore',
        // Backbone &         : Marionette
        backbone              : '../bower_components/backbone/backbone',
        marionette            : '../bower_components/marionette/lib/core/amd/backbone.marionette',
        localStorage          : '../bower_components/backbone.localStorage/backbone.localStorage',
        'backbone.wreqr'      : '../bower_components/backbone.wreqr/lib/amd/backbone.wreqr',
        'backbone.babysitter' : '../bower_components/backbone.babysitter/lib/amd/backbone.babysitter',
        'backbone.relational' : '../bower_components/backbone-relational/backbone-relational',
        'backbone.assosiations': '../bower_components/backbone-associations/backbone-associations',
        // Keybindings        :
        'Mousetrap'           : '../bower_components/mousetrap/mousetrap',
        'backbone.mousetrap'  : '../bower_components/backbone.mousetrap/backbone.mousetrap',
        // Pagedown           :
        'pagedown-ace'        : '../bower_components/pagedown-ace/Markdown.Editor',
        'pagedown.converter'  : '../bower_components/pagedown-ace/Markdown.Converter',
        'pagedown-extra'      : '../bower_components/pagedown-extra/Markdown.Extra',
        'pagedown.sanitizer'  : '../bower_components/pagedown-ace/Markdown.Sanitizer',
        checklist             : 'libs/checklist',
        'typeahead'           : '../bower_components/typeahead.js/dist/typeahead.min',
        'tagsinput'           : '../bower_components/bootstrap-tagsinput/dist/bootstrap-tagsinput.min',
        // Other              : libraries
        'bootstrap'           : '../bower_components/bootstrap/dist/js/bootstrap.min',
        'prettify'            : '../bower_components/google-code-prettify/src/prettify',
        'bootstrap-modal'     : 'libs/bootstrap-modal/src/backbone.bootstrap-modal',
        // 'bootstrap-modal'  : '../bower_components/backbone.bootstrap-modal/src/backbone.bootstrap-modal',
        // Collections        : scripts
        'notesCollection'     : 'collections/notes',
        // View               : scripts here
        'sidebar'             : 'views/composite/sidebar',
        'noteForm'            : 'views/item/noteForm',
        'noteSidebar'         : 'views/composite/noteSidebar',
        'noteSidebarItem'     : 'views/item/noteSidebarItem',
        'noteItem'            : 'views/item/noteItem',
        'notebookLayout'      : 'views/layouts/notebook',
        'notebookSidebar'     : 'views/composite/notebookSidebar',
        'notebookSidebarItem' : 'views/item/notebookSidebarItem',
        'notebookForm'        : 'views/item/notebookForm',
        'tagForm'             : 'views/item/tagForm',
        'tagsSidebar'         : 'views/composite/tags',
        'tagSidebarItem'      : 'views/item/tagSidebarItem',
        // Templates          : here
        'modalTempl'          : 'templates/modal.html',
        'noteFormTempl'       : 'templates/notes/form.html',
        'noteAddTempl'        : 'templates/notes/add.html',
        'noteSidebarTempl'    : 'templates/notes/sidebarList.html',
        'noteSidebarItemTempl': 'templates/notes/sidebarListItem.html',
        'noteItemTempl'       : 'templates/notes/item.html',
        'notebookLayoutTempl'    : 'templates/notebooks/layout.html',
        'notebookSidebarTempl'    : 'templates/notebooks/sidebarList.html',
        'notebookSidebarItemTempl': 'templates/notebooks/sidebarListItem.html',
        'notebookFormTempl': 'templates/notebooks/form.html',
        'tagFormTempl'        : 'templates/tags/form.html',
        'tagsSidebarTempl'       : 'templates/tags/sidebarList.html',
        'tagSidebarItemTempl'    : 'templates/tags/sidebarListItem.html',
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
        'backbone.relational': {
            deps: ['backbone']
        },
        'backbone.assosiations': {
            deps: ['backbone']
        },
        bootstrap: {
            deps: ['jquery'],
            exports: '$'
        },
        'Mousetrap': {},
        'backbone.mousetrap': {
            deps: ['Mousetrap']
        },
        ace: {
            exports: 'ace'
        },
        'pagedown-extra': ['pagedown-ace'],
        'pagedown-ace': [
            '../bower_components/pagedown-ace/Markdown.Converter',
            '../bower_components/pagedown-ace/Markdown.Sanitizer'
        ],
        prettify: {
            exports: 'prettify'
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
