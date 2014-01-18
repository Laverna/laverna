/* global define */
define([
    'underscore',
    'app',
    'marionette',
    'apps/confirm/show/view'
], function (_, App, Marionette, View) {
    'use strict';

    var Show = App.module('Confirm.Show');

    Show.Controller = Marionette.Controller.extend({

        initialize: function () {
            _.bindAll(this, 'show');
        },

        show: function (options) {
            if (typeof(options) === 'string') {
                options = { content : options };
            }
            this.options = options;

            var view = new View({
                text : options.content
            });

            App.modal.show(view);

            // Events
            view.on('confirm', this.confirmed, this);
            view.on('refuse', this.refused, this);
        },

        confirmed: function () {
            App.trigger('confirm');
            if (this.options.success) {
                this.options.success();
            }
            App.Confirm.trigger('stop');
        },

        refused: function () {
            App.trigger('refuse');
            if (this.options.error) {
                this.options.error();
            }
            App.Confirm.trigger('stop');
        }

    });

    return Show.Controller;
});
