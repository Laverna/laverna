/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
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
     * requests:
     * 1. channel: `uri`, request: `navigate`
     * 2. channel: `global`, request: `region:show`
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

            // Events
            this.listenTo(this, 'change:title', this.changeTitle);
        },

        onDestroy: function() {
            this.stopListening();
            Radio.request('global', 'region:empty', 'sidebarNavbar');
        },

        show: function(configs, notebooks, profiles, title) {
            var args;

            args = _.extend({title: title}, this.options);

            this.view = new View({
                args       : args,
                notebooks  : notebooks,
                collection : configs,
                profiles   : profiles
            });

            // Render the view
            Radio.request('global', 'region:show', 'sidebarNavbar', this.view);

            // Listen to view events
            this.listenTo(this.view, 'search:submit', this.navigateSearch, this);
        },

        /**
         * Changes current title
         */
        changeTitle: function(options) {
            var self = this;

            Radio.request('global', 'get:title', options)
            .then(function(title) {
                self.view.trigger('change:title', {title: title, args: options});
            });
        },

        /**
         * Navigate to the search page.
         */
        navigateSearch: function(text) {
            Radio.request('uri', 'navigate', {
                filter : 'search',
                query  : text
            });
        }

    });

    return Controller;
});
