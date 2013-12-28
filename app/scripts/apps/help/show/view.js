/*global define*/
/*global Mousetrap*/
define([
    'underscore',
    'jquery',
    'backbone',
    'marionette',
    'text!apps/help/show/template.html',
    'Mousetrap'
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
            Mousetrap.reset();
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
            var history = window.history;
            if (history.length !== 0) {
                history.back();
            } else {
                Backbone.history.navigate('/', true);
            }
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
