/*global define*/
define([
    'underscore',
    'marionette',
    'app'
], function (_, Marionette, App) {
    'use strict';

    /**
     * Submodule which shows note content
     */
    var AppNote = App.module('AppNote', { startWithParent: false }),
        executeAction,
        API;

    AppNote.on('start', function () {
        App.mousetrap.API.restart();
        App.log('AppNote is started');
    });

    AppNote.on('stop', function () {
        App.log('AppNote is stoped');
    });

    /**
     * The router
     */
    AppNote.Router = Marionette.AppRouter.extend({
        appRoutes: {
            'notes/add'       : 'addNote',
            'notes/edit/:id'  : 'editNote',
            'notes/f/search(/:query)(/p:page)(/show/:id)'  : 'searchNotes',
            'notes(/f/:filter)(/p:page)'   : 'showNotes',
            'notes(/f/:filter)(/p:page)(/show/:id)'  : 'showNote',
        }
    });

    /**
     * Start application
     */
    executeAction = function (action, args) {
        App.startSubApp('AppNote');
        action(args);
    };

    /**
     * Controller
     */
    API = {
        // Show list of notes
        showNotes: function (filter, page) {
            var args = { filter : filter, page : page };
            if (_.isNull(filter) !== true && typeof(filter) === 'object') {
                args = filter;
            }

            require(['apps/notes/list/controller'], function (List) {
                API.currentArgs = _.omit(args, 'id');
                executeAction(new List().listNotes, args);
            });
        },

        // Search
        searchNotes: function (query, page, id) {
            var args = { query : query, page : page, filter : 'search', id : id };
            require([
                'apps/notes/list/controller',
                'apps/notes/show/showController'
            ], function (List, Show) {
                API.currentArgs = args;
                executeAction(new List().listNotes, args);
                // Show note content
                executeAction(new Show().showNote, args);
                App.trigger('notes:show', args);
            });
        },

        // Show content of note
        showNote: function (filter, page, id) {
            var args = {
                id     : id,
                filter : filter,
                page   : page
            };
            require(['apps/notes/show/showController'], function (Show) {
                App.trigger('notes:show', args);
                executeAction(new Show().showNote, args);
            });
        },

        // Add new note
        addNote: function () {
            require(['apps/notes/form/controller'], function (Form) {
                executeAction(new Form().addForm);
            });
        },

        // Edit an existing note
        editNote: function (id) {
            require(['apps/notes/form/controller'], function (Form) {
                executeAction(new Form().editForm, {id: id});
            });
            App.log('edit note ' + id);
        }
    };

    /**
     * Router events
     */
    App.on('notes:list', function () {
        App.navigate('notes');
        API.showNotes(null, null);
    });

    App.on('notes:show', function (args) {
        var current = (API.currentArgs) ? API.currentArgs.toString() : null;
        if (current !== _.omit(args, 'id').toString()) {
            API.showNotes(args);
        }
    });

    App.on('notes:added', function () {
        API.showNotes(null, null);
    });

    AppNote.on('showForm', function () {
        App.navigate('/notes/add', true);
    });

    /**
     * Register the router
     */
    App.addInitializer(function(){
        new AppNote.Router({
            controller: API
        });
    });

    return AppNote;
});
