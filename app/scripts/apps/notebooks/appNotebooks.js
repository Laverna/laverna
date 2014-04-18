/* global define */
define([
    'marionette',
    'app',
    'jquery'
], function (Marionette, App, $) {
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
            'notebooks'     : 'listNotebooks',
            'notebooks/add' : 'addNotebook',
            'notebooks/edit/:id' : 'editNotebook',
            'notebooks/remove/:id' : 'removeNotebook',

            // Tags
            'tags/add'      : 'addTag',
            'tags/edit/:id' : 'editTag',
            'tags/remove/:id': 'removeTag'
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
        listNotebooks: function () {
            require(['apps/notebooks/list/controller'], function (List) {
                executeAction(new List().list);
            });
            App.content.reset();
        },

        // Create notebook
        addNotebook: function (redirect) {
            require(['apps/notebooks/notebooksForm/controller'], function (Form) {
                executeAction(new Form().addForm, {redirect: redirect});
            });
        },

        // Edit notebook
        editNotebook: function (id) {
            require(['apps/notebooks/notebooksForm/controller'], function (Form) {
                executeAction(new Form().editForm, {id: id});
            });
        },

        // Delete notebook
        removeNotebook: function (id) {
            require(['apps/notebooks/remove/notebook'], function (Controller) {
                executeAction(new Controller().start, {id: id});
            });
        },

        /**
         * Methods for tags
         */
        addTag: function () {
            require(['apps/notebooks/tagsForm/controller'], function (Form) {
                executeAction(new Form().addForm);
            });
        },

        editTag: function (id) {
            require(['apps/notebooks/tagsForm/controller'], function (Form) {
                executeAction(new Form().editForm, {id: id});
            });
        },

        removeTag: function (id) {
            require(['apps/notebooks/remove/tag'], function (Controller) {
                executeAction(new Controller().start, {id: id});
            });
        }
    };

    // Add notebook
    AppNotebooks.on('showForm', function (redirect) {
        if (_.isUndefined(redirect)) {
            App.navigate('/notebooks/add', true);
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
