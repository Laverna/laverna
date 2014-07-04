/* global define */
define([
    'underscore',
    'app',
    'marionette',
    'collections/notebooks',
    'apps/navbar/show/view',
    'helpers/sync/sync-collections'
], function ( _, App, Marionette, Notebooks, NavbarView, getSync ) {
    'use strict';

    var Navbar = App.module('AppNavbar.Show');

    /**
     * Navbar show controller
     */
    Navbar.Controller = Marionette.Controller.extend({

        currentApp: App.currentApp || {},

        initialize: function () {
            _.bindAll(this, 'show', 'showNavbar');

            // Synchronizing
            this.startSyncing();
        },

        /**
         * Fetch data and prepare arguments
         */
        show: function (args) {
            this.args = _.clone(args);

            // Collection of notebooks
            this.notebooks = new Notebooks([], {
                comparator: App.settings.sortnotebooks
            });
            this.notebooks.database.getDB(args.profile);

            if (App.currentApp && App.currentApp.moduleName !== 'AppNotebook') {
                $.when(this.notebooks.fetch()).done(this.showNavbar);
            }
            else {
                this.showNavbar(true);
            }
        },

        showNavbar: function () {
            if (this.args.filter === 'notebook') {
                var notebook = this.notebooks.get(this.args.query);
                this.args.query = (notebook ? notebook.decrypt().name : '');
            }

            this.view = new NavbarView({
                args: this.args,
                notebooks: (this.notebooks.length) ? this.notebooks.first(5) : null,
                inNotebooks: (this.currentApp.moduleName === 'AppNotebook')
            });

            App.sidebarNavbar.show(this.view);
            this.view.on('syncWithCloud', this.startSyncing, this);
        },

        /**
         * Start syncing only if application has been started
         */
        startSyncing: function () {
            var self = this;

            if (App.currentApp && this.view) {
                getSync().init(App.settings.cloudStorage, [
                    'notes', 'notebooks', 'tags', 'files'
                ]);
            }
            else {
                setTimeout(function () {
                    self.startSyncing();
                }, 300);
            }
        }

    });

    return Navbar.Controller;
});
