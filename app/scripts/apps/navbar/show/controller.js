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
            this.args = args;

            // Collection of notebooks
            this.notebooks = new Notebooks([], {
              comparator: App.settings.sortnotebooks
            });
            this.notebooks.database.getDB(args.profile);

            if (this.currentApp.moduleName !== 'AppNotebook') {
                $.when(this.notebooks.fetch({
                    limit: 5
                })).done(this.showNavbar);
            }
            else {
                this.showNavbar(true);
            }
        },

        showNavbar: function () {
            this.view = new NavbarView({
                args: this.args,
                notebooks: (this.notebooks.length) ? this.notebooks : null,
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
