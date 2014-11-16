/*global define*/
define([
    'underscore',
    'jquery',
    'marionette',
    'app',
    'enquire'
], function(_, $,  Marionette, App, enquire) {
    'use strict';

    /**
     * Submodule which shows note content
     */
    var AppNote = App.module('AppNote', { startWithParent: false }),
        executeAction,
        API;

    AppNote.on('start', function() {
        App.log('AppNote has started');

        // Show navbar
        App.AppNavbar.start();
    });

    AppNote.on('stop', function() {
        App.vent.off('form:show');
        App.log('AppNote has stoped');
    });

    /**
     * The router
     */
    AppNote.Router = Marionette.AppRouter.extend({
        appRoutes: {
            '': 'showIndex',
            'p/:profile'                    : 'showNotes',
            '(p/:profile/)notes/add'        : 'addNote',
            '(p/:profile/)notes/edit/:id'   : 'editNote',
            '(p/:profile/)notes/remove/:id' : 'removeNote',
            '(p/:profile/)notes(/f/:filter)(/q/:query)(/p:page)': 'showNotes',
            '(p/:profile/)notes(/f/:filter)(/q/:query)(/p:page)(/show/:id)': 'showNote'
        },

        // Start this module
        onRoute: function() {
            App.startSubApp('AppNote');
        }
    });

    /**
     * Start application
     */
    executeAction = function(action, args) {
        action(args);
    };

    /**
     * Controller
     */
    API = {
        notesArg: null,

        // Builds an object from router arguments
        getArgs: function(profile, filter, query, page, id) {
            if (arguments.length === 1 && typeof arguments[0] === 'object') {
                return arguments[0];
            }

            return {
                id: id,
                page: Number(page),
                query: query,
                filter: filter,
                profile: profile || App.request('uri:profile'),
            };
        },

        // Index page
        showIndex: function() {
            App.vent.trigger('notes:list');
        },

        // Show list of notes
        showNotes: function() {
            var args = this.getArgs.apply(this, arguments);

            require(['apps/notes/list/controller'], function(List) {
                API.notesArg = args;
                executeAction(new List().listNotes, args);
            });
        },

        // Show content of note
        showNote: function() {
            var args = this.getArgs.apply(this, arguments);

            require(['apps/notes/show/showController'], function(Show) {
                App.trigger('notes:show', args);
                executeAction(new Show().showNote, args);
            });
        },

        // Add new note
        addNote: function(profile) {
            require(['apps/notes/form/controller'], function(Form) {
                var args = API.notesArg || {};
                executeAction(new Form().addForm, {
                    profile: profile,
                    notebookId: (args.filter === 'notebook' ? args.query : null)
                });
                API.notesWhileEditing(profile);
            });
        },

        // Edit an existing note
        editNote: function(profile, id) {
            require(['apps/notes/form/controller'], function(Form) {
                executeAction(new Form().editForm, {id : id, profile: profile});
                API.notesWhileEditing(profile);
            });
            App.log('edit note ' + id);
        },

        notesWhileEditing: function(profile) {
            if ( !API.notesArg ) {
                App.trigger('notes:show', {profile: profile});
            }
        },

        // Remove an existing note
        removeNote: function(profile, id) {
            require(['apps/notes/remove/removeController'], function(Controller) {
                executeAction(new Controller().remove, {id : id, profile: profile});
            });
        },

        // Re-render sidebar only if necessary
        checkShowSidebar: function(args) {
            var current = _.omit(API.notesArg || {}, 'id');
            API.notesArg = args;

            if ( !_.isEqual(current,  _.omit(args, 'id')) ) {
                API.showNotes(args);
            }
        }
    };

    /**
     * Router events
     */
    App.vent.on('notes:list', function() {
        App.vent.trigger('navigate:link', '/notes');
    });

    // Show sidebar with notes list only on big screen
    App.on('notes:show', function(args) {
        $(App.content.el).addClass('active-row');
        enquire.register('screen and (min-width:768px)', {
            match: function() {
                API.checkShowSidebar(args);
            },
            unmatch: function() {
                API.notesArg = args;
            }
        });
    });

    // Toggle to sidebar
    App.on('notes:toggle', function(args) {
        $(App.content.el).removeClass('active-row');
        API.checkShowSidebar(args);
    });

    // Re render
    App.on('notes:rerender', function() {
        API.showNotes(API.notesArg || {});
    });

    // Re-render sidebar if new note has been added
    App.on('notes:added', function(model) {
        API.showNotes(_.extend(API.notesArg || {}, {id: model.get('id')}));
    });

    // Show form
    App.vent.on('form:show', function() {
        App.vent.trigger('navigate:link', '/notes/add');
    });

    // Navigate to last note
    AppNote.on('navigate:back', function() {
        var url = App.request('uri:note', API.notesArg, API.notesArg);
        App.vent.trigger('navigate:link', url);
    });

    // Re-render sidebar's and note's content after sync:after event
    App.on('sync:after', function() {

        // Re-render sidebar and note's content
        if ( App.currentApp.moduleName === 'AppNote' &&
           !App.request('uri:route').match(/\/[edit|add]+/) ) {

            var notesArg = _.extend(API.notesArg || {}, {
                profile : App.request('uri:profile')
            });

            API.showNotes(notesArg);
            if (notesArg.id) {
                API.showNote(notesArg);
            }
        }
    });

    /**
     * Register the router
     */
    App.addInitializer(function() {
        new AppNote.Router({
            controller: API
        });
    });

    return AppNote;
});
