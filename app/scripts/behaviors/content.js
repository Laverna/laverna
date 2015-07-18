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
            'click #show--sidebar': 'showSidebar',
        },

        initialize: function() {
            var channel = Radio.channel('region');

            this.showContent();
            this.listenActive();

            this.listenTo(channel, 'sidebar:shown', this.listenActive);
            this.listenTo(channel, 'content:hidden', this.showSidebar);
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
                this.$active.off('click.toggle');
            }
        },

        /**
         * Show only the content
         */
        showContent: function() {
            Radio.command('global', 'region:hide', 'sidebar', 'hidden-xs');
            Radio.command('global', 'region:visible', 'content', 'hidden-xs');
        },

        /**
         * Show only the sidebar.
         */
        showSidebar: function() {
            Radio.command('global', 'region:visible', 'sidebar', 'hidden-xs');
            Radio.command('global', 'region:hide', 'content', 'hidden-xs');
        }

    });

    return Content;
});
