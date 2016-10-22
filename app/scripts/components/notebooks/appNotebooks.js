/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define, requirejs */
define([
    'q',
    'underscore',
    'marionette',
    'backbone.radio',
    'app',
    'apps/notebooks/list/app'
], function(Q, _, Marionette, Radio, App, SidebarApp) {
    'use strict';

    /**
     * AppNotebooks module. The module shows a list of notebooks and tags
     * in sidebar. It also handles adding, updating, and removing of notebooks
     * and tags.
     *
     * Listens to events:
     * 1. channel: `global`, event: `form:show`
     *    shows notebooks form
     *
     * Replies to requests on channel `appNotebooks`:
     * 1. request: `notebooks:remove`
     *    removes specified notebook.
     * 2. request: `tags:remove`
     *    removes specified tag.
     * 3. request: `show:form`
     *    it always replies to this request. After receiving the request, it
     *    shows notebook form without starting this module.
     *
     * Triggers requests:
     * 1. channel: `navbar`, request: `start`
     */
    var Notebooks = App.module('AppNotebooks', {startWithParent: false}),
        startModule,
        controller;

    /**
     * The router.
     */
    Notebooks.Router = Marionette.AppRouter.extend({
        appRoutes: {
            // Notebooks
            '(p/:profile/)notebooks'            : 'showList',
            '(p/:profile/)notebooks/add'        : 'notebookForm',
            '(p/:profile/)notebooks/edit/:id'   : 'notebookForm',

            // Tags
            '(p/:profile/)tags/add'             : 'tagForm',
            '(p/:profile/)tags/edit/:id'        : 'tagForm',
        },

        // Starts itself
        onRoute: function() {
            if (!Notebooks._isInitialized) {
                App.startSubApp('AppNotebooks', {profile: arguments[2][0]});
            }
        }
    });

    /**
     * Starts submodules
     */
    startModule = function(module, args) {
        if (!module) {
            return;
        }

        // Stop previous module
        if (Notebooks.currentApp) {
            Notebooks.currentApp.stop();
        }

        Notebooks.currentApp = module;
        module.start(args);

        // If module has stopped, remove the variable
        module.on('stop', function() {
            Notebooks.currentApp = null;
        });
    };

    controller = {

        /**
         * Shows a list of notebooks and tags.
         * Sidebar module starts when this module starts.
         * That is why we do not have to do anything here.
         */
        showList: function() {
        },

        // Edit or add notebooks
        notebookForm: function(profile, id) {

            /*
             * Return a promise that gets resolved when the new notebook is
             * successfully created.
             */
            var defer = Q.defer();

            requirejs(['apps/notebooks/form/notebook/app'], function(Module) {
                startModule(Module, {profile: profile, id: id, promise: defer});
            });

            return defer.promise;
        },

        // Edit or add tags
        tagForm: function(profile, id) {
            requirejs(['apps/notebooks/form/tag/app'], function(Module) {
                startModule(Module, {profile: profile, id: id});
            });
        },

        // Remove an existing notebook
        _removeNotebook: function(profile, id) {
            requirejs(['apps/notebooks/remove/controller'], function(Controller) {
                new Controller('notebooks', profile, id);
            });
        },

        // Remove an existing tag
        _removeTag: function(profile, id) {
            requirejs(['apps/notebooks/remove/controller'], function(Controller) {
                new Controller('tags', profile, id);
            });
        },

        _navigateForm: function() {
            Radio.request('uri', 'navigate', '/notebooks/add', {includeProfile: true});
        }
    };

    /**
     * Initializers and finalizers
     */
    Notebooks.on('before:start', function(options) {
        // Start the sidebar module
        SidebarApp.start(options);

        // Reply to requests
        Radio.channel('appNotebooks')
        .reply('notebooks:remove', controller._removeNotebook, controller)
        .reply('tags:remove', controller._removeTag, controller);

        // Listen to events
        this.listenTo(Radio.channel('global'), 'form:show', controller._navigateForm);
    });

    Notebooks.on('before:stop', function() {
        // Stop the sidebar module
        SidebarApp.stop();

        // Stop the current module
        if (Notebooks.currentApp) {
            Notebooks.currentApp.stop();
            Notebooks.currentApp = null;
        }

        // Stop responding to requests and requests
        Radio.channel('appNotebooks')
        .stopReplying('notebooks:remove tags:remove');

        // Stop listening to events
        this.stopListening();
    });

    Radio.request('init', 'add', 'app', function() {
        Radio.reply('appNotebooks', 'show:form', controller.notebookForm, controller);
    });

    App.on('before:start', function() {
        new Notebooks.Router({
            controller: controller
        });
    });

    return Notebooks;

});
