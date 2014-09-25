/* global define */
define([
    'underscore',
    'marionette',
    'text!apps/notebooks/tagsForm/templates/form.html'
], function (_, Marionette, Templ) {
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

        modelEvents: {
            'invalid': 'showErrors'
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

            this.model.trigger('save', {
                name: this.ui.name.val()
            });
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
        showErrors: function(model, errors) {
            _.forEach(errors, function (err) {
                this.ui[err].parent().addClass('has-error');

                if (this.ui[err].attr('type') === 'text') {
                    this.ui[err].attr('placeholder', $.t('tag.' + err));
                }
            }, this);
        },

        templateHelpers: function () {
            return {
                i18n: $.t
            };
        }
    });

    return View;
});
