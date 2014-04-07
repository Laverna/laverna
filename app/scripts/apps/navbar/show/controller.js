/* global define */
define([
    'underscore',
    'app',
    'marionette',
    'collections/notebooks',
    'apps/navbar/show/view'
], function ( _, App, Marionette, Notebooks, NavbarView ) {
    'use strict';

    var Navbar = App.module('AppNavbar.Show');

    /**
     * Navbar show controller
     */
    Navbar.Controller = Marionette.Controller.extend({
        initialize: function () {
            _.bindAll(this, 'show', 'showNavbar');

            // Collection of notebooks
            this.notebooks = new Notebooks();

            this.listenTo(this.notebooks, 'sync:after', this.fetch);
        },

        show: function (args) {
            this.args = args;
            if (App.currentApp.moduleName !== 'AppNotebook') {
                $.when(this.notebooks.fetch({
                    limit: 5
                })).done(this.showNavbar);
            } else {
                this.showNavbar(true);
            }
        },

        showNavbar: function (isNotebooks) {
            this.view = new NavbarView({
                args: this.args,
                notebooks: (this.notebooks.length) ? this.notebooks : null,
                inNotebooks: (App.currentApp.moduleName === 'AppNotebook')
            });

            App.sidebarNavbar.show(this.view);
            App.Search.start();
            App.SyncStatus.start();
        }
    });

    return Navbar.Controller;
});
