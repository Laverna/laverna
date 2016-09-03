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
    'backbone.radio'
], function(_, Marionette, Radio) {
    'use strict';

    /**
     * Content region behaviour
     */
    var Content = Marionette.Behavior.extend({

        events: {
            'swiperight'          : 'showSidebar',
            'click #show--sidebar': 'showSidebar',
        },

        initialize: function() {
            var channel = Radio.channel('region');

            this.showContent();
            this.listenActive();

            this.listenTo(channel, 'sidebar:shown', this.listenActive);
            this.listenTo(channel, 'content:hidden', this.showSidebar);
            this.listenTo(channel, 'content:shown', this.showContent);
        },

        onRender: function() {
            this.view.$el.hammer();
        },

        /**
         * When some active element is clicked, hide the sidebar.
         */
        listenActive: function() {
            if (!this.$active || !this.$active.length) {
                this.$active = $('.list--item.active, .list--settings.active');
                this.$active.on('click.toggle', this.showContent);
            }
        },

        onDestroy: function() {
            if (this.$active) {
                this.showSidebar();
                this.$active.off('click.toggle');
            }
        },

        /**
         * Show only the content
         */
        showContent: function() {
            Radio.request('global', 'region:hide', 'sidebar', 'hidden-xs');
            Radio.request('global', 'region:visible', 'content', 'hidden-xs');
        },

        /**
         * Show only the sidebar.
         */
        showSidebar: function() {
            Radio.request('global', 'region:visible', 'sidebar', 'hidden-xs');
            Radio.request('global', 'region:hide', 'content', 'hidden-xs');
        }

    });

    return Content;
});
