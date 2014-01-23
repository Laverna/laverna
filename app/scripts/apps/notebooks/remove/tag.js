/* global define */
define([
    'underscore',
    'app',
    'marionette',
    'models/tag',
    'collections/tags'
], function (_, App, Marionette, Model, Tags) {
    'use strict';

    var Tag = App.module('AppNotebooks.RemoveTag');

    Tag.Controller = Marionette.Controller.extend({
        initialize: function () {
            _.bindAll(this, 'start', 'remove');
        },

        start: function (args) {
            this.model = new Model({id: args.id});

            $.when(this.model.fetch()).done(this.remove);
        },

        remove: function () {
            this.model.destroy();
            new Tags().syncDistroy(this.model);
            this.redirect();
        },

        redirect: function () {
            App.navigate('#/notebooks');
        }
    });

    return Tag.Controller;
});
