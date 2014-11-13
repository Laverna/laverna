/* global define */
define([
    'underscore',
    'app',
    'marionette',
    'helpers/uri',
    'apps/help/about/view'
], function (_, App, Marionette, URI, View) {
    'use strict';

    var About = App.module('AppHelp.About');

    About.Controller = Marionette.Controller.extend({
        initialize: function () {
            _.bindAll(this, 'show');
        },

        onDestroy: function () {
            this.view.trigger('destroy');
            delete this.view;
        },

        show: function () {
            this.view = new View({
                appVersion : App.constants.VERSION
            });
            App.modal.show(this.view);
            this.view.on('redirect', this.redirect, this);
        },

        redirect: function () {
            App.vent.trigger('navigate:back', '/notes');
        }
    });

    return About.Controller;
});
