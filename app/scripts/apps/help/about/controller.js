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

        show: function () {
            var view = new View({
                appVersion : App.constants.VERSION
            });
            App.modal.show(view);

            view.on('redirect', this.redirect, this);
        },

        redirect: function () {
            App.navigateBack(URI.link('/notes'), true);
        }
    });

    return About.Controller;
});
