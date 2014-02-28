/*global define*/
define([
    'underscore',
    'jquery',
    'marionette',
    'app',
    'enquire',
    'helpers/search',
    'helpers/syncStatus'
], function (_, $,  Marionette, App, enquire) {
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
            'notes/add'        : 'addNote',
            'notes/edit/:id'   : 'editNote',
            'notes/remove/:id' : 'removeNote',
            'notes(/f/:filter)(/q/:query)(/p:page)'   : 'showNotes',
            'notes(/f/:filter)(/q/:query)(/p:page)(/show/:id)'  : 'showNote',
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
        showNotes: function (filter, query, page) {
            var args = { filter : filter, page : page, query : query };
            if (_.isNull(filter) !== true && typeof(filter) === 'object') {
                args = filter;
            }

            require(['apps/notes/list/controller'], function (List) {
                App.notesArg = _.omit(args, 'id');
                executeAction(new List().listNotes, args);
            });
        },

        // Show content of note
        showNote: function (filter, query, page, id) {
            var args = {
                id     : id,
                filter : filter,
                query  : query,
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
        },

        // Remove and existing note
        removeNote: function (id) {
            require(['apps/notes/remove/removeController'], function (Controller) {
                executeAction(new Controller().remove, id);
            });
        },

        // Update note's content again after synchronizing
        showNoteSync: function (args) {
            require(['apps/notes/show/showController'], function (Show) {
                executeAction(new Show().showNote, args);
            });
        },

        // Re-render sidebar only if necessary
        checkShowSidebar: function (args) {
            var current = (App.notesArg) ? App.notesArg.toString() : null;
            if (current !== _.omit(args, 'id').toString()) {
                API.showNotes(args);
            }
        }
    };

    /**
     * Router events
     */
    App.on('notes:list', function () {
        App.navigate('notes');
        API.showNotes(null, null);
    });

    // Show sidebar with notes list only on big screen
    App.on('notes:show', function (args) {
        $(App.content.el).addClass('active-row');
        enquire.register('screen and (min-width:768px)', {
            match: function () {
                API.checkShowSidebar(args);
            }
        });
    });

    // Toggle to sidebar
    App.on('notes:toggle', function (args) {
        $(App.content.el).removeClass('active-row');
        API.checkShowSidebar(args);
    });

    // Re render
    App.on('notes:rerender', function () {
        API.showNotes(API.notesArg);
    });

    // Re-render sidebar if new note has been added
    App.on('notes:added', function (id) {
        API.showNotes(_.extend(App.notesArg, {id: id}));
    });

    // Show form
    AppNote.on('showForm', function () {
        App.navigate('/notes/add', true);
    });

    // Reload note's content after sync event
    AppNote.on('sync:after', function (args) {
        API.showNoteSync(args);
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
