/* global define */
define([
    'jquery',
    'q',
    'underscore',
    'backbone.radio',
    'marionette',
    'apps/navbar/show/view'
], function($, Q, _, Radio, Marionette, View) {
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
            var profile = {profile: Radio.request('uri', 'profile')};
            _.bindAll(this, 'show');

            this.options = options;

            // Request notebooks and title
            Q.all([
                Radio.request('configs', 'get:all', profile),
                Radio.request('notebooks', 'get:all', profile),
                Radio.request('configs', 'get:model', {name: 'appProfiles'}),
                Radio.request('global', 'get:title', options)
            ])
            .spread(this.show);
        },

        onDestroy: function() {
            this.stopListening();
            Radio.command('global', 'region:empty', 'sidebarNavbar');
        },

        show: function(configs, notebooks, profiles, title) {
            var currentApp = Radio.request('global', 'app:current').moduleName,
                args;

            // Do not render the view if nothing has changed
            if (this.view && title === this.view.options.args.title) {
                return;
            }

            args = _.extend({title: title}, this.options);
            args.currentUrl = Radio.request('uri', 'link:profile', (
                currentApp === 'AppNotebooks' ? '/notebooks' : '/notes'
            ));

            this.view = new View({
                args       : args,
                notebooks  : notebooks,
                collection : configs,
                profiles   : profiles
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
