/* global define */
define([
    'underscore',
    'app',
    'marionette',
    'models/tag'
], function (_, App, Marionette, Model) {
    'use strict';

    var Tag = App.module('AppNotebooks.RemoveTag');

    Tag.Controller = Marionette.Controller.extend({
        initialize: function () {
            _.bindAll(this, 'start', 'remove');
        },

        start: function (args) {
            this.model = new Model({id: parseInt(args.id)});

            $.when(this.model.fetch()).done(this.remove);
        },

        remove: function () {
            this.model.destroy();

            this.redirect();
        },

        redirect: function () {
            App.navigate('#/notebooks');
        }
    });

    return Tag.Controller;
});
