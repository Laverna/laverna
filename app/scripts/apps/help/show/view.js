/*global define*/
define([
    'underscore',
    'jquery',
    'backbone',
    'marionette',
    'text!apps/help/show/template.html'
], function ( _, $, Backbone, Marionette, Tmpl) {
    'use strict';

    var View = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        hashChange: false,

        className: 'modal fade',

        events: {
            'click .cancelBtn'  : 'close'
        },

        initialize: function () {
            this.on('hidden.modal', this.redirect);
        },

        serializeData: function() {
            return {
                collection: this.collection,
            };
        },

        /**
         * Redirect
         */
        redirect: function () {
            this.trigger('redirect');
        },

        /**
         * Close
         */
        close: function (e) {
            if (e !== undefined) {
                e.preventDefault();
            }
            this.trigger('close');
        }

    });

    return View;
});
