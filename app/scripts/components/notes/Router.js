/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define, requirejs */
define([
    'underscore',
    'jquery',
    'marionette',
    'app',
    'backbone.radio',
    'enquire',
    'apps/notes/list/listApp'
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
            ''           : 'showIndex',
            'p/:profile' : 'filterNotes',

            // Edit/Add notes
            '(p/:profile/)notes/add'      : 'noteForm',
            '(p/:profile/)notes/edit/:id' : 'noteForm',

            // Filter notes
            '(p/:profile/)notes(/f/:filter)(/q/:query)(/p:page)'            : 'filterNotes',
            '(p/:profile/)notes(/f/:filter)(/q/:query)(/p:page)(/show/:id)' : 'showNote'
        },

        // Start this module
        onRoute: function() {
            if (!AppNote._isInitialized) {
                var args = arguments[0] === 'noteForm' ? {} : arguments[2];
                App.startSubApp('AppNote', API._getArgs.apply(this, args));
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
            AppNote.currentApp = null;
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

            Radio.request('appNote', 'filter', args);
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
            var args = _.extend({}, this.notesArg || {}, {
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
        removeNote: function(id) {
            requirejs(['apps/notes/remove/controller'], function(Controller) {
                API.notesArg.id = null;
                new Controller(_.extend({}, API.notesArg || {}, {id: id}));
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
                profile : profile || Radio.request('uri', 'profile'),
            };

            return this.notesArg;
        }
    };

    /**
     * Module's initializer/finalizer
     */
    AppNote.on('before:start', function(options) {
        // Show the sidebar
        SidebarApp.start(options);

        // Listen to events
        this.listenTo(Radio.channel('appNote'), 'notes:toggle', API._toggleSidebar);
        this.listenTo(Radio.channel('global'), 'form:show', function() {
            Radio.request('uri', 'navigate', '/notes/add', {
                trigger       : true,
                includeProfile: true
            });
        });

        // Respond to requests and requests
        Radio.channel('appNote')
        .reply('remove:note', API.removeNote, API)
        .reply('route:args', function() {return API.notesArg;}, API);
    });

    AppNote.on('before:stop', function() {
        // Stop the sidebar app
        SidebarApp.stop();

        // Stop the current module
        if (AppNote.currentApp) {
            AppNote.currentApp.stop();
            AppNote.currentApp = null;
        }

        // Stop listenning to events
        this.stopListening();

        // Stop responding to requests and requests
        Radio.channel('appNote')
        .stopReplying('remove:note')
        .stopReplying('route:args');
    });

    /**
     * Register the router
     */
    App.on('before:start', function() {
        new AppNote.Router({
            controller: API
        });
    });

    return AppNote;

});
