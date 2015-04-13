/* global define, requirejs */
define([
    'underscore',
    'marionette',
    'backbone.radio',
    'app',
    'apps/notebooks/list/app'
], function(_, Marionette, Radio, App, SidebarApp) {
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
     * Complies to commands on channel `appNotebooks`:
     * 1. command: `notebooks:remove`
     *    removes specified notebook.
     * 2. command: `tags:remove`
     *    removes specified tag.
     * 3. command: `show:form`
     *    it always complies to this command. After receiving the command, it
     *    shows notebook form without starting this module.
     *
     * Triggers commands:
     * 1. channel: `navbar`, command: `start`
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
                App.startSubApp('AppNotebooks');
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
            delete Notebooks.currentApp;
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
            requirejs(['apps/notebooks/form/notebook/app'], function(Module) {
                startModule(Module, {profile: profile, id: id});
            });
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
            Radio.command('uri', 'navigate', '/notebooks/add', {includeProfile: true});
        }
    };

    /**
     * Initializers and finalizers
     */
    Notebooks.on('before:start', function() {
        // Start the sidebar module
        SidebarApp.start();

        // Comply to commands
        Radio.channel('appNotebooks')
        .comply('notebooks:remove', controller._removeNotebook, controller)
        .comply('tags:remove', controller._removeTag, controller);

        // Listen to events
        this.listenTo(Radio.channel('global'), 'form:show', controller._navigateForm);
    });

    Notebooks.on('before:stop', function() {
        // Stop the sidebar module
        SidebarApp.stop();

        // Stop the current module
        if (Notebooks.currentApp) {
            Notebooks.currentApp.stop();
            delete Notebooks.currentApp;
        }

        // Stop responding to commands and requests
        Radio.channel('appNotebooks')
        .stopComplying('notebooks:remove tags:remove');

        // Stop listening to events
        this.stopListening();
    });

    Radio.command('init', 'add', 'app', function() {
        Radio.comply('appNotebooks', 'show:form', controller.notebookForm, controller);
    });

    App.addInitializer(function() {
        new Notebooks.Router({
            controller: controller
        });
    });

    return Notebooks;

});
