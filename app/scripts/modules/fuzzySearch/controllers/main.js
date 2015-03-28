/* global define */
define([
    'underscore',
    'jquery',
    'marionette',
    'backbone.radio',
    'collections/notes',
    'modules/fuzzySearch/views/composite'
], function(_, $, Marionette, Radio, Notes, View) {
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
     * 2. channel: `appNote`, command: `filter`
     *    in order to filter notes in sidebar.
     * 3. channel: `fuzzySearch`, command: `region:show`
     *    in order to render the view and show search results
     */
    var Controller = Marionette.Object.extend({

        initialize: function() {
            _.bindAll(this, 'search');

            // Instantiate notes collection and a view
            this.notes = new Notes();
            this.view  = new View({
                collection: this.notes
            });

            // Fetch data
            this.wait = $.Deferred();
            $.when(this.notes.fetch({})).then(this.wait.resolve);

            // Listen to events
            this.listenTo(Radio.channel('global'), 'search:change', _.debounce(this.search, 150));
            this.listenTo(this.view, 'childview:navigate:search', this.filter, this);
        },

        onDestroy: function() {
            Radio.command('fuzzySearch', 'region:empty');
        },

        /**
         * Searches and shows the result.
         */
        search: function(text) {
            // Wait until everything is fetched
            if (this.wait) {
                var self = this;
                return this.wait.then(function() {
                    delete self.wait;
                    self.search.apply(self, [text]);
                });
            }

            var result = this.notes.fuzzySearch(text);
            this.notes.reset(result);

            if (!this.view.isRendered) {
                Radio.command('fuzzySearch', 'region:show', this.view);
            }
        },

        /**
         * It triggers "filter" event and stops this module.
         */
        filter: function(model) {
            model = model.model;
            Radio.command('appNote', 'filter', {
                filter : 'search',
                query  : model.get('title')
            });
            Radio.trigger('global', 'search:hidden');
        }

    });

    return Controller;
});
