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
    'q',
    'marionette',
    'backbone.radio',
    'modules/fuzzySearch/views/composite'
], function(_, Q, Marionette, Radio, View) {
    'use strict';

    /**
     * Fuzzy search controller
     *
     * Listens to
     * ------------
     * Events:
     * 1. channel: `global`, event: `search:change`
     *    makes fuzzy search and shows the result.
     *
     * Triggers
     * --------
     * 1. channel: `global`, event: `search:hidden`
     *    when a model in search results was selected.
     * 2. channel: `appNote`, request: `filter`
     *    in order to filter notes in sidebar.
     * 3. channel: `fuzzySearch`, request: `region:show`
     *    in order to render the view and show search results
     */
    var Controller = Marionette.Object.extend({

        initialize: function() {
            _.bindAll(this, 'search', 'onFetch');

            // Fetch data
            this.wait = Radio.request('notes', 'fetch', {
                profile  : Radio.request('uri', 'profile')
            }).then(this.onFetch);

            // Listen to events
            this.listenTo(Radio.channel('global'), 'search:change', _.debounce(this.search, 150));
        },

        onDestroy: function() {
            Radio.request('fuzzySearch', 'region:empty');
        },

        /**
         * Searches and shows the result.
         */
        search: function(text) {
            // Wait until everything is fetched
            if (this.wait) {
                var self = this;
                return this.wait.then(function() {
                    self.search(text);
                });
            }

            var result = this.notes.fuzzySearch(text);
            this.notes.reset(result);

            if (!this.view.isRendered) {
                Radio.request('fuzzySearch', 'region:show', this.view);
            }
        },

        onFetch: function(collection) {
            this.wait = null;
            this.notes = collection;

            // Instantiate notes collection and a view
            this.view = new View({collection: this.notes});

            // Events
            this.listenTo(this.view, 'childview:navigate:search', this.filter, this);
        },

        /**
         * It triggers "filter" event and stops this module.
         */
        filter: function(model) {
            model = model.model;
            Radio.request('appNote', 'filter', {
                filter : 'search',
                query  : model.get('title')
            });
            Radio.trigger('global', 'search:hidden');
        }

    });

    return Controller;
});
