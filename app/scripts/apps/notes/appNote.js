/* global define, requirejs */
define([
    'underscore',
    'jquery',
    'marionette',
    'app',
    'enquire',
    'apps/notes/list/listApp',
    'apps/notes/collection'
], function(_, $, Marionette, App, enquire, ListApp) {
    'use strict';

    var AppNote = App.module('AppNote', { startWithParent: false }),
        executeAction,
        API;

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
     * Initializes a controller and executes a method
     */
    executeAction = function(Controller, action, args) {
        // Destroy a previous controller
        if (API.controller) {
            API.controller.destroy();
        }

        API.controller = new Controller();
        API.controller[action](args);
    };

    /**
     * Router's controller
     */
    API = {

        // Index page
        showIndex: function() {
            this.showNotes();
        },

        // Shows sidebar.
        showNotes: function() {
            var args = this._getArgs.apply(this, arguments);
            API.notesArg = args;
        },

        // Show a note
        showNote: function() {
            var args = this._getArgs.apply(this, arguments);

            // Show sidebar
            App.execute('notes:show', args);

            requirejs(['apps/notes/show/showController'], function(Show) {
                executeAction(Show, 'showNote', args);
            });
        },

        // Add a new note
        addNote: function(profile) {
            var args = _.extend(this.notesArg || {}, { profile: profile });

            App.channel.trigger('navigate:link', '/notes/add', false);

            // Show sidebar
            App.execute('notes:show', args);

            requirejs(['apps/notes/form/controller'], function(Form) {
                executeAction(Form, 'addForm', args);
            });
        },

        // Edit an existing note
        editNote: function(profile, id) {
            var args = _.extend(this.notesArg || {}, {
                id: id,
                profile: profile
            });

            App.execute('notes:show', args);

            requirejs(['apps/notes/form/controller'], function(Form) {
                executeAction(Form, 'editForm', args);
            });
        },

        // Remove an existing note
        removeNote: function(profile, id) {
            requirejs([
                'apps/notes/remove/removeController'
            ], function(Controller) {
                executeAction(Controller, 'remove', {id : id, profile: profile});
            });
        },

        // If a sidebar controller is not initialized, do it
        _showSidebar: function(args) {
            if (!this.sideController) {
                this.showNotes(args);
            }
        },

        // Make sidebar active
        _toggleSidebar: function(args) {
            this.$content = this.$content || $(App.content.el);
            this.$content.removeClass('active-row');
            this.showNotes.apply(this, args);
        },

        // Builds an object from router arguments
        _getArgs: function(profile, filter, query, page, id) {
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
        }
    };

    /**
     * Module's initializer/finalizer
     */
    AppNote.addInitializer(function() {
        ListApp.start();

        // Events
        App.channel
            .on('form:show', API.addNote, API)
            .on('notes:toggle', API._toggleSidebar, API);

        // Commands
        App.channel.comply('notes:show', API._showSidebar, API);

        console.log('On initialize----');
    });

    AppNote.addFinalizer(function() {
        // Destroy controllers
        if (API.sideController) {
            API.sideController.destroy();
        }

        // Stop listening to events
        App.channel
            .off('form:show')
            .off('notes:toggle');

        // Remove handlers
        App.channel.stopCompying('notes:show');

        console.log('On finalize----');
    });

    /**
     * Register the router
     */
    App.addInitializer(function() {
        new AppNote.Router({
            controller: API
        });
    });
});
