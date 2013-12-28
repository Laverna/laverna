/* global define */
define([
    'underscore',
    'app',
    'marionette',
    'apps/help/show/view'
], function (_, App, Marionette, View) {
    'use strict';

    var Show = App.module('AppHelp.Show');

    Show.Controller = Marionette.Controller.extend({
        initialize: function () {
            _.bindAll(this, 'show');
        },

        show: function () {
            var view = new View({ collection: App.settings });
            App.modal.show(view);
            view.on('redirect', this.redirect, this);
        },

        redirect: function () {
            App.navigateBack('/notes', true);
        }

    });

    return Show.Controller;
});
