/* global define, requirejs */
define([
    'underscore',
    'jquery',
    'marionette',
    'app',
    'backbone.radio',
    'enquire',
    'apps/notes/list/listApp',
    'apps/notes/collection'
], function(_, $, Marionette, App, Radio, enquire, SidebarApp) {
    'use strict';

    /**
     * AppNote module.
     *
     * Listens to
     * --------
     * Events on channel `appNote`:
     * 1. `form:show`    - shows a form where a user can add/edit new notes
     * 2. `notes:toggle` - make the sidebar region active
     *
     * Replies on channel `appNote`:
     * 1. `route:args`   - returns current route arguments
     */
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
            if (!AppNote._isInitialized) {
                App.startSubApp('AppNote', API._getArgs.apply(this, arguments[2]));
            }
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

            // Wait until the SidebarApp has started
            if (!SidebarApp._isInitialized) {
                return SidebarApp.on('start', function() {
                    API.filterNotes(args);
                });
            }

            Radio.command('appNote', 'filter', args);
        },

        // Show a note
        showNote: function() {
            var args = this._getArgs.apply(this, arguments);

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

            this.notesArg = {
                id      : id,
                page    : Number(page || 0),
                query   : query,
                filter  : filter,
                profile : profile || App.channel.request('uri:profile'),
            };

            return this.notesArg;
        }
    };

    /**
     * Module's initializer/finalizer
     */
    AppNote.on('before:start', function(options) {
        // Show a navbar
        App.channel.command('navbar:show');

        // Show the sidebar
        SidebarApp.start(options);

        // Events
        Radio.channel('appNote')
            .on('form:show', API.noteForm, API)
            .on('notes:toggle', API._toggleSidebar, API)
            .reply('route:args', function() {return API.notesArg;}, API);

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
        Radio.channel('appNote')
            .off('form:show')
            .off('notes:toggle');

        // Remove handlers
        Radio.channel('appNote').stopReplying('route:args');

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
