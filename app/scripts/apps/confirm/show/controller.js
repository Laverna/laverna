/* global define */
define([
    'underscore',
    'app',
    'marionette',
    'apps/confirm/show/view'
], function(_, App, Marionette, View) {
    'use strict';

    var Show = App.module('Confirm.Show');

    Show.Controller = Marionette.Controller.extend({

        initialize: function() {
            _.bindAll(this, 'show');
        },

        onDestroy: function() {
            this.view.trigger('destroy');
        },

        show: function(options) {
            if (typeof options === 'string') {
                options = { content : options };
            }
            this.options = options;

            this.view = new View({
                text : options.content
            });

            App.modal.show(this.view);

            // Events
            this.view.on('confirm', this.confirmed, this);
            this.view.on('refuse', this.refused, this);
        },

        confirmed: function() {
            if (this.options.success) {
                this.options.success();
            }
            App.Confirm.trigger('confirm');
            App.Confirm.stop();
        },

        refused: function() {
            if (this.options.error) {
                this.options.error();
            }
            App.Confirm.trigger('refuse');
            App.Confirm.stop();
        }
    });

    return Show.Controller;
});
