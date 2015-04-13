/* global define */
define([
    'underscore',
    'jquery',
    'backbone.radio',
    'marionette',
    'collections/tags'
], function(_, $, Radio, Marionette, Tags) {
    'use strict';

    /**
     * Tags collection.
     * A convenience object that handles operations to Tags collection.
     *
     * Listens to events:
     * 1. this.collection, event: `reset:all`
     *    destroys the current collection.
     *
     * Complies to commands on channel `tags`:
     * 1. `remove` - removes an existing model.
     * 2. `save`   - adds a new model or updates an existing one.
     *
     * Replies to requests on channel `tags`:
     * 1. `get:all`  - returns a collection.
     * 2. `get:model` - returns a model with the specified ID.
     *
     * Triggers events:
     * 1. `add:model` to a collection that is currently under use
     *    when a new model was added or updated.
     * 2. channel: `tags`, event: `save:after`
     *    after a model was added or updated.
     * 3. channel: `tags`, event: `model:destroy`
     *    after a model was destroyed.
     */
    var Collection = Marionette.Object.extend({

        initialize: function() {
            this.vent = Radio.channel('tags');

            // Register complies
            this.vent.comply({
                'remove': this.remove,
                'save'  : this.save
            }, this);

            // Register replies
            this.vent.reply({
                'get:all'   : this.getAll,
                'get:model' : this.getById
            }, this);
        },

        reset: function() {
            this.stopListening(this.collection);
            this.collection.removeEvents();
            this.collection.reset([]);
            delete this.collection;
        },

        /**
         * Search a model by ID
         */
        getById: function(id) {
            var defer = $.Deferred();

            // If id was not provided, just instantiate a new model
            if (!id) {
                return defer.resolve(new Tags.prototype.model());
            }

            // In case if the collection isn't empty, get the note from there.
            if (this.collection && this.collection.get(id)) {
                return defer.resolve(
                    this.collection.get(id)
                );
            }

            // Otherwise, fetch it
            var model = new Tags.prototype.model({id: id});

            $.when(model.fetch())
            .then(function() {
                defer.resolve(model);
            });

            return defer.promise();
        },

        /**
         * Add a new model or update an existing one.
         */
        save: function(model, data) {
            var self  = this,
                defer = $.Deferred();

            model.set(data);
            model.updateDate();

            model.save(model.toJSON(), {
                success: function(tag) {
                    if (self.collection) {
                        self.collection.trigger('add:model', tag);
                    }
                    defer.resolve(tag);
                    Radio.trigger('tags', 'save:after', tag.get('id'));
                }
            });

            return defer.promise();
        },

        /**
         * Remove an existing tag
         */
        remove: function(model) {
            var atIndex = this.collection.indexOf(model),
                defer   = $.Deferred();

            model = (typeof model === 'string' ? this.getById(model) : model);

            $.when(model.destroySync())
            .then(function() {
                Radio.trigger('tags', 'model:destroy', atIndex);
            });

            return defer.promise();
        },

        /**
         * Fetch all the models.
         */
        getAll: function(options) {
            var defer = $.Deferred(),
                self  = this;

            // Do not fetch twice
            if (this.collection) {
                return defer.resolve(
                    options ? this.filter(options) : this.collection
                );
            }

            // Instantiate a collection
            this.collection = new Tags();
            this.collection.registerEvents();

            // Events
            this.listenTo(this.collection, 'reset:all', this.reset);

            $.when(this.collection.fetch(options))
            .then(function() {
                defer.resolve(self.collection);
            });

            return defer.promise();
        },

        filter: function(options) {
            return this.collection.fullCollection.where(options.conditions);
        }

    });

    // Initialize the collection automaticaly
    Radio.command('init', 'add', 'app:before', function() {
        new Collection();
    });

    return Collection;

});
