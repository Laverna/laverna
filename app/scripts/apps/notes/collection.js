/* global define */
define([
    'underscore',
    'jquery',
    'app',
    'backbone.radio',
    'marionette',
    'collections/notes'
], function(_, $, App, Radio, Marionette, Notes) {
    'use strict';

    /**
     * Collection module.
     * It is used to fetch, add, save notes.
     *
     * Listens to
     * ----------
     * Complies on channel `notes`:
     * 1. `save` - saves a model
     *
     * Replies on channel `notes`:
     * 1. `getById` - returns a model with the provided id.
     * 2. `filter`  - returns a collection filtered by provided filters.
     *
     * Triggers events
     * --------
     * 1. channel: `notes`, event: `save:after`
     *    after a note was updated.
     */
    var Module = App.module('AppNote.Collection', {startWithParent: true}),
        Collection;

    Collection = Marionette.Object.extend({

        initialize: function() {
            _.bindAll(this, 'filter', '_getNotes');
            this.vent = Radio.channel('notes');
            this.storage = Radio.request('global', 'storage');

            // Complies
            this.vent.comply({
                'save'          : this.save
            }, this);

            // Replies
            this.vent.reply({
                'getById' : this.getById,
                'filter'  : this.filter
            }, this);

            // Events
            this.on('collection:destroy', this.onCollectionDestroy, this);
        },

        onDestroy: function() {
            this.collection.trigger('destroy');
            this.vent.stopReplying('getById filter');
            this.vent.stopComplying('save');
        },

        /**
         * Filters the collection.
         */
        filter: function(options) {
            var defer = $.Deferred(),
                self  = this;

            this._getNotes(options)
            .then(function() {

                defer.resolve(self.collection);
            });

            return defer.promise();
        },

        /**
         * Returns a note.
         */
        getById: function(id) {
            var defer = $.Deferred();

            // If id was not provided, just instantiate a new model
            if (!id) {
                return defer.resolve(new Notes.prototype.model());
            }

            // In case if the collection isn't empty, get the note from there.
            if (this.collection.length &&
                _.findWhere(this.collection.fullCollection, {id: id})) {

                return defer.resolve(
                    _.findWhere(this.collection.fullCollection, {id: id})
                );
            }

            // Otherwise, fetch it
            var model = new Notes.prototype.model({id: id});

            $.when(model.fetch())
            .then(function() {
                defer.resolve(model);
            });

            return defer.promise();
        },

        /**
         * Saves changes to a note.
         */
        save: function(model, data) {
            var self = this;
            model.setEscape(data).encrypt();

            model.save(model.toJSON(), {
                success: function(note) {
                    if (self.collection) {
                        self.collection.add(note);
                    }
                    Radio.trigger('notes', 'save:after', note.get('id'));
                }
            });
        },

        /**
         * Fetches data.
         */
        _getNotes: function(options) {
            // Destroy old collection
            this.trigger('collection:destroy');

            // Instantiate a new collection
            this.collection = new Notes();

            // Sort the collection again
            _.bindAll(this.collection, 'sortItOut');
            this.listenTo(this.collection, 'change:isFavorite', this.collection.sortItOut);
            this.listenTo(this.collection, 'reset', this.collection.sortItOut);

            // Sort the full collection again when a new model was added
            // this.collection.on('add', this.collection.sortFullCollection);

            // Fetch data
            return $.when(this.collection.fetch({
                conditions    : this.collection.conditions[options.filter],
                sort          : false,
                page          : options.page,
                options       : options,
                beforeSuccess : (
                    this.storage !== 'indexeddb' || options.filter === 'search' ?
                        this._filterOnFetch : null
                )
            }));
        },

        _filterOnFetch: function(collection, options) {
            collection.filterList(options.filter, options.query);
        },

        /**
         * When some collection was destroyed, do some garbage collection.
         */
        onCollectionDestroy: function() {
            if (!this.collection) {
                return;
            }
            this.stopListening(this.collection);
            this.collection.reset();
            delete this.collection.fullCollection;

            delete this.collection;
        }

    });

    Module.on('before:start', function() {
        var contr = new Collection();
        Collection.controller = contr;
    });

    Module.on('before:stop', function() {
        Collection.controller.destroy();
        delete Collection.controller;
    });

    return Module;
});
