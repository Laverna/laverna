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
            App.modal.show(new View({
                collection: App.settings
            }));
        }
    });

    return Show.Controller;
});
