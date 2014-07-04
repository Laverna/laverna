/* global define */
define([
    'underscore',
    'app',
    'marionette',
    'text!apps/notebooks/tagsForm/templates/form.html'
], function (_, App, Marionette, Templ) {
    'use strict';

    var View = Marionette.ItemView.extend({
        template: _.template(Templ),

        className: 'modal fade',

        ui: {
            name : 'input[name="name"]'
        },

        events: {
            'submit .form-horizontal' : 'save',
            'click .ok'               : 'save',
            'click .cancelBtn'        : 'destroy'
        },

        /**
         * Initializing
         */
        initialize: function () {
            this.on('hidden.modal', this.redirect);
            this.on('shown.modal', this.onFormShown);
        },

        /**
         * Focus to input
         */
        onFormShown: function () {
            this.ui.name.focus();
        },

        /**
         * Prepare model
         */
        serializeData: function () {
            return this.options.data;
        },

        /**
         * Prepare data and trigger save event
         */
        save: function (e) {
            if (e.$el === undefined) {
                e.preventDefault();
            } else {
                e.preventClose();
            }

            var data = {
                name: this.ui.name.val()
            };

            this.model.trigger('save', data);
        },

        /**
         * Close
         */
        destroy: function (e) {
            if (e !== undefined) {
                e.preventDefault();
            }
            this.trigger('destroy');
        },

        /**
         * Redirect
         */
        redirect: function () {
            this.trigger('redirect');
        },

        /**
         * Shows validation errors
         */
        showErrors: function(errors) {
            var that = this;
            _.each(errors, function( e) {
                if (e === 'name') {
                    that.$('#notebook-name').addClass('has-error');
                    that.ui.name.attr('placeholder', 'Tag name is required');
                }
            });
        },

        templateHelpers: function () {
            return {
                i18n: $.t
            };
        }
    });

    return View;
});
