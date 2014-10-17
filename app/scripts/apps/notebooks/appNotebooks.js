/* global define */
define([
    'underscore',
    'jquery',
    'marionette',
    'app',
    'helpers/uri'
], function(_, $, Marionette, App, URI) {
    'use strict';

    /**
     * Submodule which shows notebooks
     */
    var AppNotebooks = App.module('AppNotebook', {startWithParent: false}),
        executeAction,
        API;

    AppNotebooks.on('start', function() {
        // Restart global keybindings and start Navbar module
        App.mousetrap.API.restart();
        App.AppNavbar.start();

        // Make sidebar region visible
        $(App.content.el).removeClass('active-row');

        App.log('AppNotebook has started');
    });

    AppNotebooks.on('stop', function() {
        // Destroy the last controller
        API.controller.destroy();
        delete API.controller;

        App.log('AppNotebook has stoped');
    });

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
        }
    });

    /**
     * Start application
     */
    executeAction = function(Controller, action, args) {
        App.startSubApp('AppNotebook');

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
        addNotebook: function(profile, redirect) {
            require(['apps/notebooks/notebooksForm/controller'], function(Form) {
                executeAction(Form, 'addForm', {
                    profile: profile,
                    redirect: redirect
                });
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

    // Add notebook
    AppNotebooks.on('showForm', function(profile, redirect) {
        if (_.isUndefined(redirect)) {
            App.navigate(URI.link('/notebooks/add'), true);
        } else {
            API.addNotebook(profile, redirect);
        }
    });

    // Re-render
    App.on('sync:after', function() {
        if (App.currentApp.moduleName === 'AppNotebook') {
            API.listNotebooks();
        }
    });

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
