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
    'backbone',
    'collections/pageable',
    'backbone.radio',
    'models/tag'
], function(_, Backbone, PageableCollection, Radio, Tag) {
    'use strict';

    /**
     * Tags collection
     */
    var Tags = PageableCollection.extend({
        model: Tag,

        profileId : 'notes-db',
        storeName : 'tags',

        state: {
            pageSize     : 20,
            firstPage    : 0,
            currentPage  : 0,
            totalRecords : 0,
            comparator   : {'updated': 'desc'}
        },

        conditions: {
            active: {trash: 0}
        },

        _onAddItem: function(model) {
            PageableCollection.prototype._onAddItem.apply(this, arguments);
            Radio.trigger('tags', 'model:navigate', model);
        },

        sortFullCollection: function() {
            if (!this.fullCollection) {
                return;
            }

            // Sort the full collection again
            this.fullCollection.sortItOut();

            // Update pagination state
            this._updateTotalPages();

            var models = this.fullCollection.models.slice(
                0, this.state.pageSize * (this.state.currentPage + 1)
            );

            // Reset the collection so the view could re-render itself
            this.reset(models);
            return true;
        },

        /**
         * Sets state.currentPage to the given number.
         * Then, it overwrites models of the current collection.
         */
        getPage: function(number) {
            // Calculate page number
            var pageStart = this.getOffset(number),
                models;

            // Save where we currently are
            this.state.currentPage = number;

            // Slice an array of models
            models = this.fullCollection.models.slice(pageStart, pageStart + this.state.pageSize);

            if (number === 0) {
                this.reset(models);
            }
            else {
                this.add(models);
            }

            return this.models;
        },

        /**
         * This collection is never going to have a previous page
         * because it uses inifinite pagination.
         */
        hasPreviousPage: function() {
            return false;
        }

    });

    return Tags;
});
