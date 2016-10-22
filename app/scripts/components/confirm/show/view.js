/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define */
define([
    'underscore',
    'marionette',
    'backbone.radio',
    'text!apps/confirm/show/template.html',
    'mousetrap'
], function(_, Marionette, Radio, Tmpl, Mousetrap) {
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

            _.bindAll(this, 'focusNextBtn');
            Mousetrap.bind('tab', this.focusNextBtn);

            // Events
            this.on('shown.modal', this.onShown, this);
            this.on('hidden.modal', this.refuseOnHide, this);
        },

        onDestroy: function() {
            Mousetrap.unbind('tab');
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
