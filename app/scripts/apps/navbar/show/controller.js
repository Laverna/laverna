/* global define */
define([
    'jquery',
    'underscore',
    'app',
    'marionette',
    'collections/notebooks',
    'apps/navbar/show/view',
    'helpers/sync/sync-collections'
], function ( $, _, App, Marionette, Notebooks, NavbarView, getSync ) {
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

            this.listenTo(App, 'sync:before', function () {
                this.view.trigger('sync:before');
            }, this);

            this.listenTo(App, 'sync:after', function () {
                this.view.trigger('sync:after');
            }, this);
        },

        /**
         * Fetch data and prepare arguments
         */
        show: function (args) {
            this.args = _.extend({}, args, {
                currentApp: (App.currentApp ? App.currentApp.moduleName : null)
            });

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

        /**
         * Show fetched data
         */
        showNavbar: function () {
            var title,
                notebook;

            if (this.args.filter === 'notebook') {
                notebook = this.notebooks.get(this.args.query);
            }

            title = this.getTitle(notebook);
            this.args.title = title;

            this.view = new NavbarView({
                settings: App.settings,
                args: this.args,
                notebooks: (this.notebooks.length) ? this.notebooks.first(5) : null,
                inNotebooks: (this.currentApp.moduleName === 'AppNotebook')
            });

            // Show navbar and set document's title
            App.sidebarNavbar.show(this.view);
            App.setTitle(null, title);

            // View events
            this.view.on('syncWithCloud', this.startSyncing, this);
            this.view.on('navigate', function (uri) {
                App.vent.trigger('navigate', uri, true);
            });
        },

        /**
         * Start syncing only if application has started
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
        },

        /**
         * Document's title
         */
        getTitle: function (notebook) {
            if (notebook) {
                return notebook.decrypt().name;
            }

            var title = (this.args.filter ? this.args.filter : 'All notes');
            title = $.t(title.substr(0,1).toUpperCase() + title.substr(1));

            if (this.args.query && this.args.filter !== 'search') {
                title += ': ' + this.args.query;
            }
            return title;
        }

    });

    return Navbar.Controller;
});
