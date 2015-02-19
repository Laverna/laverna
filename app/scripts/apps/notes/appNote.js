/* global define, requirejs */
define([
    'underscore',
    'jquery',
    'marionette',
    'app',
    'enquire',
    'apps/notes/list/listApp',
    'apps/notes/collection'
], function(_, $, Marionette, App, enquire, SidebarApp) {
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
            'p/:profile'                    : 'filterNotes',
            '(p/:profile/)notes/add'        : 'noteForm',
            '(p/:profile/)notes/edit/:id'   : 'noteForm',
            '(p/:profile/)notes/remove/:id' : 'removeNote',
            '(p/:profile/)notes(/f/:filter)(/q/:query)(/p:page)': 'filterNotes',
            '(p/:profile/)notes(/f/:filter)(/q/:query)(/p:page)(/show/:id)': 'showNote'
        },

        // Start this module
        onRoute: function() {
            App.startSubApp('AppNote');
        }
    });

    /**
     * Starts a submodule
     */
    executeAction = function(module, args) {
        if (!module) {
            return;
        }

        // Stop previous module
        if (AppNote.currentApp) {
            AppNote.currentApp.stop();
        }

        AppNote.currentApp = module;
        module.start(args);

        // If module has stopped, remove the variable
        module.on('stop', function() {
            delete AppNote.currentApp;
        });
    };

    /**
     * Router's controller
     */
    API = {

        // Index page
        showIndex: function() {
            this.filterNotes();
        },

        // Filter collection
        filterNotes: function() {
            var args = this._getArgs.apply(this, arguments);
            API.notesArg = args;
            App.channel.trigger('notes:filter', args);
        },

        // Show a note
        showNote: function() {
            var args = this._getArgs.apply(this, arguments);

            // Show sidebar
            App.channel.command('notes:show', args);

            requirejs(['apps/notes/show/app'], function(Module) {
                executeAction(Module, args);
            });
        },

        // Shows a form for editing or adding notes
        noteForm: function(profile, id) {
            var args = _.extend(this.notesArg || {}, {
                id      : id,
                profile : profile
            });

            // Show sidebar
            App.channel.command('notes:show', args);

            // Start 'Form' module
            requirejs(['apps/notes/form/app'], function(Module) {
                args.method = id ? 'edit' : 'add';
                executeAction(Module, args);
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
                this.filterNotes(args);
            }
        },

        // Make sidebar active
        _toggleSidebar: function(args) {
            this.$content = this.$content || $(App.content.el);
            this.$content.removeClass('active-row');
            this.filterNotes.apply(this, args);
        },

        // Builds an object from router arguments
        _getArgs: function(profile, filter, query, page, id) {
            if (arguments.length === 1 && typeof arguments[0] === 'object') {
                return arguments[0];
            }

            return {
                id      : id,
                page    : Number(page),
                query   : query,
                filter  : filter,
                profile : profile || App.channel.request('uri:profile'),
            };
        }
    };

    /**
     * Module's initializer/finalizer
     */
    AppNote.on('before:start', function() {
        // Show a navbar
        App.channel.command('navbar:show');

        // Show the sidebar
        SidebarApp.start();

        // Events
        App.channel
            .on('form:show', API.noteForm, API)
            .on('notes:toggle', API._toggleSidebar, API);

        // Commands
        App.channel.comply('notes:show', API._showSidebar, API);

        console.log('On initialize----');
    });

    AppNote.on('before:stop', function() {
        // Stop the sidebar app
        SidebarApp.stop();

        // Stop the current module
        if (AppNote.currentApp) {
            AppNote.currentApp.stop();
            delete AppNote.currentApp;
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
    App.on('before:start', function() {
        new AppNote.Router({
            controller: API
        });
    });
});
