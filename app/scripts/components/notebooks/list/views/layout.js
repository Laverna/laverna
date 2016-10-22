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
    'behaviors/sidebar',
    'text!apps/notebooks/list/templates/layout.html',
    'mousetrap'
], function(_, Marionette, Radio, Behavior, Tmpl, Mousetrap) {
    'use strict';

    /**
     * Notebooks layout view.
     * It shows lists of tags and notebooks.
     *
     * Listens to events:
     * 1. channel: `appNotebooks`, event: `change:region`
     *    switches to another region.
     *
     * Triggers events:
     * 1. `navigate:next` to currently active region
     * 2. `navigate:previous` to currently active region
     *
     * requests:
     * 1. channel: `uri`, request: `navigate`
     */
    var View = Marionette.LayoutView.extend({
        template: _.template(Tmpl),

        regions: {
            notebooks :  '#notebooks',
            tags      :  '#tags'
        },

        behaviors: {
            SidebarBehavior: {
                behaviorClass: Behavior
            }
        },

        // Default active region is `notebooks`
        activeRegion: 'notebooks',

        initialize: function() {
            _.bindAll(this, 'triggerNext', 'triggerPrevious', 'openActive', 'openEdit', 'triggerRemove', 'focusRegion');

            // Make tags active region if there aren't any notebooks
            if (!this.options.notebooks.length) {
                this.activeRegion = 'tags';
            }

            this.listenTo(Radio.channel('notebooks'), 'model:navigate', this.focusRegion);
            this.listenTo(Radio.channel('tags'), 'model:navigate', this.focusRegion);

            // Register keyboard events
            Mousetrap.bind(this.options.configs.navigateBottom, this.triggerNext);
            Mousetrap.bind(this.options.configs.navigateTop, this.triggerPrevious);
            Mousetrap.bind(this.options.configs.actionsOpen, this.openActive);
            Mousetrap.bind(this.options.configs.actionsEdit, this.openEdit);
            Mousetrap.bind(this.options.configs.actionsRemove, this.triggerRemove);

            // Listen to events
            this.listenTo(Radio.channel('appNotebooks'), 'change:region', this.changeRegion);
        },

        onBeforeDestroy: function() {
            Mousetrap.unbind([
                this.options.configs.navigateBottom,
                this.options.configs.navigateTop,
                this.options.configs.actionsOpen,
                this.options.configs.actionsEdit,
                this.options.configs.actionsRemove
            ]);
            this.stopListening();
        },

        triggerNext: function() {
            this[this.activeRegion].currentView.trigger('navigate:next');
        },

        triggerPrevious: function() {
            this[this.activeRegion].currentView.trigger('navigate:previous');
        },

        triggerRemove: function() {
            var $a = this.$('.list-group-item.active').parent().find('.remove-link:first');
            $a.trigger('click');
            return false;
        },

        openActive: function() {
            var $a = this.$('.list-group-item.active');
            Radio.request('uri', 'navigate', $a.attr('href'));
        },

        openEdit: function() {
            var $a = this.$('.list-group-item.active').parent().find('.edit-link:first');
            Radio.request('uri', 'navigate', $a.attr('href'));
        },

        /**
         * Make sure a model's region is active.
         * For example, if a user navigated to a tag, tags region should be
         * active.
         */
        focusRegion: _.debounce(function(model) {
            this.activeRegion = model.storeName;
        }, 100),

        /**
         * Switch from one region to another. For example, from `tags` to
         * `notebooks`.
         */
        changeRegion: function(regionName, direction) {
            // Don't change active region
            if (!this.options[regionName].length) {
                return;
            }

            this.activeRegion = regionName;

            /*
             * Reset active model variable and
             * call either triggerNext or triggerPrevious method
             */
            this[this.activeRegion].currentView.options.activeModel = null;
            this['trigger' + direction]();
        }
    });

    return View;

});
