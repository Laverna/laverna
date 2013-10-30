require.config({
    packages: [{
        name: 'ace',
        location: '../bower_components/ace/lib/ace',
        main: 'ace'
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
        // Keybindings
        'Mousetrap'           : '../bower_components/mousetrap/mousetrap',
        'backbone.mousetrap'  : '../bower_components/backbone.mousetrap/backbone.mousetrap',
        // Pagedown           :
        'pagedown-ace'        : '../bower_components/pagedown-ace/Markdown.Editor',
        'pagedown.converter'  : '../bower_components/pagedown-ace/Markdown.Converter',
        'pagedown.sanitizer'  : '../bower_components/pagedown-ace/Markdown.Sanitizer',
        checklist             : 'libs/checklist',
        'typeahead'           : '../bower_components/typeahead.js/dist/typeahead.min',
        // Other              : libraries
        'bootstrap'           : '../bower_components/bootstrap/dist/js/bootstrap.min',
        'prettify'            : '../bower_components/google-code-prettify/src/prettify',
        'bootstrap-modal'     : 'libs/bootstrap-modal/src/backbone.bootstrap-modal',
        // 'bootstrap-modal'  : '../bower_components/backbone.bootstrap-modal/src/backbone.bootstrap-modal',
        // Application        : scripts here
        'noteForm'            : 'views/item/noteForm',
        'noteSidebar'         : 'views/composite/noteSidebar',
        'noteSidebarItem'     : 'views/item/noteSidebarItem',
        'noteItem'            : 'views/item/noteItem',
        'shortcutView'        : 'views/shortcutView',
        // Templates          : here
        'modalTempl'          : 'templates/modal.html',
        'noteFormTempl'       : 'templates/notes/form.html',
        'noteAddTempl'        : 'templates/notes/add.html',
        'noteSidebarTempl'    : 'templates/notes/sidebarList.html',
        'noteSidebarItemTempl': 'templates/notes/sidebarListItem.html',
        'noteItemTempl'       : 'templates/notes/item.html'
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
        'pagedown-ace': [
            '../bower_components/pagedown-ace/Markdown.Converter',
            '../bower_components/pagedown-ace/Markdown.Sanitizer',
            '../bower_components/pagedown-extra/Markdown.Extra'
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
