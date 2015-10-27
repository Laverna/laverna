/* global define */
define([
    'underscore',
    'backbone',
    'backbone.radio'
], function(_, Backbone, Radio) {
    'use strict';

    /**
     * Pagination support for Backbone collections.
     * Some code was borrowed from the plugin Backbone.paginator.
     *
     * Triggers:
     * ---------
     * Events to channel `notes`:
     * 1. `model:navigate` - when the next or previous model was requested
     *     or a model was removed.
     *
     * Events to itself (e.g. collection):
     * 1. `page:next` - when the next model was requested but a user
     *     has reached the last model on the page.
     * 2. `page:previous` - when the previous model was requested but a user
     *     has reached the first model on the page.
     */
    var PageableCollection = Backbone.Collection.extend({

        // Default pagination settings
        state: {
            pageSize     : 4,
            firstPage    : 0,
            currentPage  : 0,
            totalRecords : 0,
            comparator   : {'isFavorite' : 'desc', 'created' : 'desc'}
        },

        /**
         * Overrite `fetch` method.
         */
        fetch: function(options) {
            options = options || {};
            options.options = options.options || {};

            if (!_.isUndefined(options.pageSize)) {
                this.state.pageSize = Number(options.pageSize);
            }

            // Do not use pagination
            if (this.state.pageSize === 0) {
                return Backbone.Collection.prototype.fetch.call(this, options);
            }

            var success = options.success,
                self    = this;

            options.success = function(resp) {
                /*
                 * Execute `beforeSuccess` callback.
                 * The callback might be used to filter collection, for example.
                 */
                if (options.beforeSuccess) {
                    options.beforeSuccess(self, options);
                }

                // Keep full collection in memory
                self.fullCollection = self.clone();

                // Sort the collection
                self.fullCollection.sortItOut();

                // Pagination
                self._updateTotalPages();
                self.getPage(options.page || self.state.firstPage);

                if (success) {
                    success(self, resp);
                }
            };

            return Backbone.Collection.prototype.fetch.call(this, options);
        },

        /**
         * Handles events.
         * It needs to be called after a collection was instantiated.
         */
        registerEvents: function() {
            this.vent = Radio.channel(this.storeName);

            // Sort the collection again when favorite status is changed
            this.listenTo(this, 'change:isFavorite', this.sortItOut);
            this.listenTo(this, 'reset', this.sortItOut);

            // Listen to events
            this.listenTo(this.vent, 'update:model' , this._onAddItem);
            this.listenTo(this.vent, 'destroy:model', this._navigateOnRemove);
            this.listenTo(this.vent, 'restore:model', this._onRestore);
        },

        /**
         * It makes some "garbage collection"
         * by destroying full collection and event listeners.
         * If a collection is no longer in use, this method should be called.
         */
        removeEvents: function() {
            // Destroy a full collection
            if (this.fullCollection) {
                this.fullCollection.reset();
                delete this.fullCollection;
            }

            // Remove all the event listeners
            this.stopListening();
            this.stopListening(this.vent);
        },

        getNextPage: function() {
            var models = this.getPage(this.state.currentPage + 1);
            this.reset(models);
        },

        getPreviousPage: function() {
            var models = this.getPage(this.state.currentPage - 1);
            this.reset(models);
        },

        /**
         * Sets state.currentPage to the given number.
         * Then, it overrites models of the current collection.
         */
        getPage: function(number) {
            // Calculate page number
            var pageStart = this.getOffset(number);

            // Save where we currently are
            this.state.currentPage = number;

            // Slice an array of models
            this.models = this.fullCollection.models.slice(pageStart, pageStart + this.state.pageSize);

            return this.models;
        },

        getOffset: function(number) {
            return (
                (this.state.firstPage === 0 ? number : number - 1) *
                this.state.pageSize
            );
        },

        hasPreviousPage: function() {
            return this.state.currentPage !== this.state.firstPage;
        },

        hasNextPage: function() {
            return this.state.currentPage !== this.state.totalPages - 1;
        },

        /**
         * It is used to sort models in full collection.
         */
        sortFullCollection: function() {
            if (!this.fullCollection) {
                return;
            }

            // Sort the full collection again
            this.fullCollection.sortItOut();

            // Update pagination state
            this._updateTotalPages();
            this.getPage(this.state.currentPage);

            // Reset the collection so the view could re-render itself
            this.reset(this.models);
        },

        /**
         * Useful when sorting models in a collection by multiple keys.
         */
        sortItOut: function() {
            var comparator = this.comparator,
                self = this;

            _.each(this.state.comparator, function(value, key) {
                self.comparator = function(model) {
                    return (value === 'desc' ? (-model.get(key)) : model.get(key));
                };
                self.sort();
            });

            this.comparator = comparator;
            return this.models;
        },

        getNextItem: function(id) {
            // The collection is empty
            if (this.length === 0) {
                return;
            }

            var model  = this.get(id),
                index  = model ? this.indexOf(model) + 1 : 0;

            // It is the last model on this page
            if (index >= this.models.length) {
                return this.trigger(
                    this.hasNextPage() ? 'page:next' : 'page:end'
                );
            }

            Radio.trigger(this.storeName, 'model:navigate', this.at(index));
        },

        getPreviousItem: function(id) {
            // The collection is empty
            if (this.length === 0) {
                return;
            }

            var model = this.get(id),
                index = model ? this.indexOf(model) - 1 : this.models.length - 1;

            // It is the first model on this page
            if (index < 0) {
                return this.trigger(
                    this.hasPreviousPage() ? 'page:previous' : 'page:start'
                );
            }

            Radio.trigger(this.storeName, 'model:navigate', this.at(index));
        },

        /**
         * When some model was removed, trigger `model:navigate` event
         * passing a model which has the same index as the removed model.
         * @type object Backbone model
         */
        _navigateOnRemove: function(model) {
            var coll  = this.fullCollection || this,
                index = this.indexOf(model);

            coll.remove(model);
            this.sortFullCollection();

            if (!this.at(index)) {
                index--;
            }

            if (!this.at(index)) {
                return this.hasPreviousPage() ? this.trigger('page:previous') : null;
            }

            Radio.trigger(this.storeName, 'model:navigate', this.at(index));
        },

        /**
         * When a model was restored from trash.
         */
        _onRestore: function(model) {
            if (this.conditionFilter !== 'trashed') {
                return this._onAddItem(model);
            }

            if (this.length > 1) {
                return this._navigateOnRemove(model);
            }
        },

        /**
         * Update pagination when a model is added
         */
        _onAddItem: function(model) {
            // If the model already exists, update it
            var coll = this.fullCollection || this,
                colModel = coll.get(model.id);
            if (colModel) {
                return colModel.set(model.toJSON());
            }

            // Or add it to fullCollection and sort the collection again
            coll.add(model, {at: 0});
            this.sortFullCollection();
        },

        /**
         * Update pagination when a model is removed
         */
        _onRemoveItem: function(model) {
            this.fullCollection.remove(model);
            this.sortFullCollection();
        },

        /**
         * Updates the number of available pages
         */
        _updateTotalPages: function() {
            this.state.totalPages = Math.ceil(
                this.fullCollection.length / this.state.pageSize
            );
        }

    });

    return PageableCollection;
});
