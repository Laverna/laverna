/* global define */
define([
    'underscore',
    'jquery',
    'marionette',
    'app',
    'helpers/uri'
], function (_, $, Marionette, App, URI) {
    'use strict';

    /**
     * Submodule which shows notebooks */
    var AppNotebooks = App.module('AppNotebook', {startWithParent: false}),
        executeAction,
        API;

    AppNotebooks.on('start', function () {
        App.mousetrap.API.restart();
        App.AppNavbar.start();
        $(App.content.el).removeClass('active-row');
        App.log('AppNotebook is started');
    });

    AppNotebooks.on('stop', function () {
        App.log('AppNotebook is stoped');
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
    executeAction = function (action, args) {
        App.startSubApp('AppNotebook');
        action(args);
    };

    /**
     * Controller
     */
    API = {
        /**
         * Methods for notebooks
         */
        // Shows list of notebooks and tags
        listNotebooks: function (profile) {
            require(['apps/notebooks/list/controller'], function (List) {
                executeAction(new List().list, {profile: profile});
            });
            App.content.reset();
        },

        // Create notebook
        addNotebook: function (profile, redirect) {
            require(['apps/notebooks/notebooksForm/controller'], function (Form) {
                executeAction(new Form().addForm, {profile: profile, redirect: redirect});
            });
        },

        // Edit notebook
        editNotebook: function (profile, id) {
            require(['apps/notebooks/notebooksForm/controller'], function (Form) {
                executeAction(new Form().editForm, {id: id, profile: profile});
            });
        },

        // Delete notebook
        removeNotebook: function (profile, id) {
            require(['apps/notebooks/remove/notebook'], function (Controller) {
                executeAction(new Controller().start, {id: id, profile: profile});
            });
        },

        /**
         * Methods for tags
         */
        addTag: function (profile) {
            require(['apps/notebooks/tagsForm/controller'], function (Form) {
                executeAction(new Form().addForm, {profile: profile});
            });
        },

        editTag: function (profile, id) {
            require(['apps/notebooks/tagsForm/controller'], function (Form) {
                executeAction(new Form().editForm, {id: id, profile: profile});
            });
        },

        removeTag: function (profile, id) {
            require(['apps/notebooks/remove/tag'], function (Controller) {
                executeAction(new Controller().start, {id: id, profile: profile});
            });
        }
    };

    // Add notebook
    AppNotebooks.on('showForm', function (redirect) {
        if (_.isUndefined(redirect)) {
            App.navigate(URI.link('/notebooks/add'), true);
        } else {
            API.addNotebook(redirect);
        }
    });

    // Re-render
    App.on('sync:after', function (sync) {
        if (sync.objects.length === 0 || App.currentApp.moduleName !== 'AppNotebook') {
            return;
        }
        else if (sync.collection === 'notebooks' || sync.collection === 'tags') {
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
