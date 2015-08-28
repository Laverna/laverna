/* global define */
define([
    'underscore',
    'marionette',
    'backbone.radio',
    'text!apps/confirm/show/template.html',
    'backbone.mousetrap'
], function(_, Marionette, Radio, Tmpl) {
    'use strict';

    /**
     * Confirm view.
     */
    var View = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        className: 'modal fade',

        events: {
            'click .modal-footer .btn': 'triggerEvent'
        },

        keyboardEvents: {
            'tab': 'focusNextBtn',
        },

        serializeData: function() {
            return this.options;
        },

        templateHelpers: function() {
            return {
                getTitle: function() {
                    return this.i18n(this.title || 'Are you sure?');
                }
            };
        },

        initialize: function() {
            if (this.options.template) {
                this.template = _.template(this.options.template);
            }

            // Events
            this.on('shown.modal', this.onShown, this);
            this.on('hidden.modal', this.refuseOnHide, this);
        },

        onShown: function() {
            var $btn = this.$('.btn:last');
            $btn.focus();
        },

        triggerEvent: function(e) {
            var $btn = $(e.currentTarget);
            this.trigger('click', $btn.attr('data-event'));
        },

        refuseOnHide: function() {
            this.trigger('click', 'cancel');
        },

        focusNextBtn: function(e) {
            var $btn = this.$('.modal-footer .btn:focus').next();
            $btn = $btn.length ? $btn : this.$('.modal-footer .btn:first');
            $btn.focus();
            e.preventDefault();
        }

    });

    return View;
});
