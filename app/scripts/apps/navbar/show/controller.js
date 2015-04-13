/* global define */
define([
    'jquery',
    'underscore',
    'backbone.radio',
    'marionette',
    'apps/navbar/show/view'
], function($, _, Radio, Marionette, View) {
    'use strict';

    /**
     * Navbar controller.
     *
     * Listens to events:
     * ------------------
     * 1. channel: `global`, event: `filter:change`
     *    re-renders the view on this event.
     * 3. this.view, event: `search:submit`
     *    navigates to search page
     *
     * Triggers:
     * ------------------
     * Requests:
     * 1. channel: `global`, request: `app:current`
     * 2. channel: `uri`, request: `link:profile`
     * 3. channel: `global`, request: `get:title`
     *
     * Commands:
     * 1. channel: `uri`, command: `navigate`
     * 2. channel: `global`, command: `region:show`
     */
    var Controller = Marionette.Object.extend({

        initialize: function(options) {
            _.bindAll(this, 'show');

            this.configs = Radio.request('global', 'configs');
            this.options = options;

            // Request notebooks and title
            $.when(
                Radio.request('notebooks', 'get:all'),
                Radio.request('global', 'get:title', options)
            )
            .then(this.show);
        },

        onDestroy: function() {
            this.stopListening();
            this.view.trigger('destroy');
        },

        show: function(notebooks, title) {
            var currentApp = Radio.request('global', 'app:current').moduleName,
                args;

            // Do not render the view if nothing has changed
            if (this.view && title === this.view.options.args.title) {
                return;
            }

            args = _.extend({
                title   : title,
                configs : this.configs
            }, this.options);

            args.currentUrl = Radio.request('uri', 'link:profile', (
                currentApp === 'AppNotebooks' ? '/notebooks' : '/notes'
            ));

            this.view = new View({
                args      : args,
                notebooks : notebooks
            });

            // Render the view
            Radio.command('global', 'region:show', 'sidebarNavbar', this.view);

            // Listen to view events
            this.listenTo(this.view, 'search:submit', this.navigateSearch, this);
        },

        /**
         * Navigate to the search page.
         */
        navigateSearch: function(text) {
            Radio.command('uri', 'navigate', {
                filter : 'search',
                query  : text
            });
        }

    });

    return Controller;
});
