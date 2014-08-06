/*global define*/
define([
    'underscore',
    'jquery',
    'marionette',
    'text!apps/help/about/template.html'
], function (_, $, Marionette, Tmpl) {
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
        },

        serializeData: function () {
            return {
                appVersion : this.options.appVersion
            };
        }

    });

    return View;
});
