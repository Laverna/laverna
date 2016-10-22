/**
 * Copyright (C) 2015 Laverna project Authors.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/*global define*/
define([
    'underscore',
    'jquery',
    'marionette',
    'behaviors/content',
    'text!apps/settings/show/templates/showTemplate.html'
], function(_, $, Marionette, Behavior, Tmpl) {
    'use strict';

    /**
     * Settings layout view
     */
    var View = Marionette.LayoutView.extend({
        template: _.template(Tmpl),

        regions: {
            content: 'form'
        },

        behaviors: {
            ContentBehavior: {
                behaviorClass: Behavior
            }
        },

        events: {
            'click .settings--save'   : 'save',
            'click .settings--cancel' : 'cancel'
        },

        onRender: function() {
            this.$cancel = $('.settings--cancel');
            this.$cancel.on('click', _.bind(this.cancel, this));
        },

        onBeforeDestroy: function() {
            this.$cancel.off('click');
        },

        serializeData: function() {
            return this.options;
        },

        cancel: function(e) {
            e.preventDefault();
            console.warn('cancel');
            this.trigger('cancel');
        },

        save: function(e) {
            var view = this.content.currentView;
            e.preventDefault();

            /*
             * If the password was autofilled by a user's browser, it usually will
             * not trigger `change` event. This will fix it.
             */
            if (view.ui && view.ui.password) {
                this.content.currentView.ui.password.trigger('change');
            }

            this.trigger('save');
        }
    });

    return View;
});
