/* global define */
define([
    'underscore',
    'jquery',
    'marionette',
    'app'
], function(_, $, Marionette, App) {
    'use strict';

    /**
     * Submodule which shows notebooks
     */
    var AppNotebooks,
        executeAction,
        API;

    AppNotebooks = Marionette.Module.extend({
        startWithParent: false,

        onStart: function() {
            App.log('AppNotebook has started');

            // Start Navbar module
            App.AppNavbar.start();

            // Make sidebar region visible
            $(App.content.el).removeClass('active-row');

            // Show a form
            App.vent.on('form:show', function() {
                App.vent.trigger('navigate:link', '/notebooks/add');
            });

            // Re render notebook's list after synchronizing
            App.vent.on('sync:after', API.listNotebooks, API);
        },

        onStop: function() {
            App.vent.off('form:show');
            App.vent.off('sync:after');

            // Destroy the last controller
            API.controller.destroy();
            delete API.controller;

            App.log('AppNotebook has stoped');
        }
    });

    AppNotebooks = App.module('AppNotebook', AppNotebooks);

    /**
     * The Router
     */
    AppNotebooks.Router = Marionette.AppRouter.extend({
        appRoutes: {
            // Notebooks
            '(p/:profile/)notebooks'     : 'listNotebooks',
            '(p/:profile/)notebooks/add' : 'addNotebook',
            '(p/:profile/)notebooks/edit/:id' : 'editNotebook',
            '(p/:profile/)notebooks/remove/:id' : 'removeNotebook',

            // Tags
            '(p/:profile/)tags/add'      : 'addTag',
            '(p/:profile/)tags/edit/:id' : 'editTag',
            '(p/:profile/)tags/remove/:id': 'removeTag'
        },

        // Start the module
        onRoute: function() {
            App.startSubApp('AppNotebook');
        }
    });

    /**
     * Start application
     */
    executeAction = function(Controller, action, args) {
        // Trigger 'destroy' event to a previous controller
        if (API.controller) {
            API.controller.trigger('destroy:it');
        }

        API.controller = new Controller();
        API.controller[action](args);
    };

    /**
     * Controller
     */
    API = {
        // Shows list of notebooks and tags
        listNotebooks: function(profile) {
            require(['apps/notebooks/list/controller'], function(List) {
                executeAction(List, 'list', {profile: profile});
            });

            // Clear content region
            App.content.reset();
        },

        // Create notebook
        addNotebook: function(profile) {
            require(['apps/notebooks/notebooksForm/controller'], function(Form) {
                executeAction(Form, 'addForm', { profile: profile });
            });
        },

        showAddForm: function(profile, redirect) {
            require(['apps/notebooks/notebooksForm/controller'], function(Form) {
                new Form().addForm({ profile: profile, redirect: redirect });
            });
        },

        // Edit notebook
        editNotebook: function(profile, id, redirect) {
            require(['apps/notebooks/notebooksForm/controller'], function(Form) {
                executeAction(Form, 'editForm', {
                    id: id,
                    profile: profile,
                    redirect: redirect
                });
            });
        },

        // Delete notebook
        removeNotebook: function(profile, id) {
            require(['apps/notebooks/remove/notebook'], function(Controller) {
                executeAction(Controller, 'start', {
                    id: id,
                    profile: profile
                });
            });
        },

        // Add a new tag
        addTag: function(profile) {
            require(['apps/notebooks/tagsForm/controller'], function(Form) {
                executeAction(Form, 'addForm', { profile: profile });
            });
        },

        // Edit an existing tag
        editTag: function(profile, id) {
            require(['apps/notebooks/tagsForm/controller'], function(Form) {
                executeAction(Form, 'editForm', {
                    id: id,
                    profile: profile
                });
            });
        },

        // Remove a tag
        removeTag: function(profile, id) {
            require(['apps/notebooks/remove/tag'], function(Controller) {
                executeAction(Controller, 'start', {
                    id: id,
                    profile: profile
                });
            });
        }
    };

    // Show a form without starting an entire AppNotebook sub app
    App.vent.on('notebook:form', API.showAddForm);

    /**
     * Register the router
     */
    App.addInitializer(function() {
        new AppNotebooks.Router({
            controller: API
        });
    });

    return AppNotebooks;
});
