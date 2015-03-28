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
     * Complies to Commands:
     * ------------------
     * 1. channel: `navbar`, command: `start`
     *    re-render the view.
     *
     * Triggers:
     * ------------------
     * Requests:
     * 1. channel: `global`, request: `app:current`
     * 2. channel: `uri`, request: `link:profile`
     * Commands:
     * 1. channel: `uri`, command: `navigate`
     * 2. channel: `global`, command: `region:show`
     */
    var Controller = Marionette.Object.extend({

        initialize: function() {
            _.bindAll(this, 'show');

            this.configs = Radio.request('global', 'configs');

            // Listen to events, commands
            Radio.comply('navbar', 'start', this.show, this);
            this.listenTo(Radio.channel('global'), 'filter:change', this.show);

            // Render the view
            this.show();
        },

        onDestroy: function() {
            Radio.stopComplying('navbar', 'start');
            this.stopListening();
            this.view.trigger('destroy');
        },

        show: function(args) {
            var currentApp = Radio.request('global', 'app:current').moduleName;

            args = _.extend({
                title   : this.getTitle(args || {}),
                configs : this.configs
            }, args);

            // Do not render the view if nothing has changed
            if (this.view && args.title === this.view.options.args.title) {
                return;
            }

            args.currentUrl = Radio.request('uri', 'link:profile', (
                currentApp === 'AppNotebook' ? '/notebooks' : '/notes'
            ));

            this.view = new View({
                args      : args,
                notebooks : null
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
        },

        getTitle: function(args) {
            var title = args.filter || 'All notes';
            title = $.t(title.substr(0, 1).toUpperCase() + title.substr(1));

            if (args.query && args.filter !== 'search') {
                title += ': ' + this.args.query;
            }

            return title;
        }

    });

    return Controller;
});
