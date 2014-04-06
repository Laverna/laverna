/* global define */
define([
    'underscore',
    'app',
    'marionette',
    'collections/notebooks',
    'apps/navbar/show/view'
], function ( _, App, Marionette, Notes, NavbarView ) {
    'use strict';

    var Navbar = App.module('AppNavbar.Show');

    /**
     * Navbar show controller
     */
    Navbar.Controller = Marionette.Controller.extend({
        initialize: function () {
            _.bindAll(this, 'show', 'changeTitle');
        },

        show: function (args) {
            this.view = new NavbarView({
                args: args
            });

            App.sidebarNavbar.show(this.view);
            App.Search.start();
            App.SyncStatus.start();
        },

        changeTitle: function (args) {
            this.view.changeArgs(args);
        }
    });

    return Navbar.Controller;
});
