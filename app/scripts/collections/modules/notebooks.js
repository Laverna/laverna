/* global define */
define([
    'underscore',
    'jquery',
    'backbone.radio',
    'marionette',
    'collections/notebooks'
], function(_, $, Radio, Marionette, Notebooks) {
    'use strict';

    /**
     * Notebooks collection.
     * A convenience object that handles operations to Notebooks collection.
     *
     * Listens to events:
     * 1. this.collection, event: `reset:all`
     *    destroys the current collection.
     *
     * Complies to commands on channel `notebooks`:
     * 1. `remove` - removes an existing model.
     * 2. `save`   - adds a new model or updates an existing one.
     *
     * Replies to requests on channel `notebooks`:
     * 1. `get:all`  - returns a collection.
     * 2. `get:model` - returns a model with the specified ID.
     *
     * Triggers events:
     * 1. `add:model` to a collection that is currently under use
     *    when a new model was added or updated.
     * 2. channel: `notebooks`, event: `save:after`
     *    after a model was added or updated.
     * 3. channel: `notebooks`, event: `model:destroy`
     *    after a model was destroyed.
     */
    var Collection = Marionette.Object.extend({

        initialize: function() {
            this.vent = Radio.channel('notebooks');

            // Comply to commands
            this.vent.comply({
                'remove' : this.remove,
                'save'   : this.save
            }, this);

            // Reply to requests
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
         * Find and return a model with the specified ID
         */
        getById: function(id) {
            var defer = $.Deferred();

            // If id was not provided, just instantiate a new model
            if (!id || id === '0') {
                return defer.resolve(new Notebooks.prototype.model());
            }

            // In case if the collection isn't empty, get the model from there.
            if (this.collection && this.collection.get(id)) {
                return defer.resolve(this.collection.get(id));
            }

            // Otherwise, fetch it
            var model = new Notebooks.prototype.model({id: id});

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
            model.save(model.toJSON(), {
                success: function(notebook) {
                    if (self.collection) {
                        self.collection.trigger('add:model', notebook);
                    }
                    defer.resolve(notebook);
                    Radio.trigger('notebooks', 'save:after', notebook.get('id'));
                }
            });

            return defer.promise();
        },

        /**
         * Remove an existing model.
         */
        remove: function(model, removeNotes) {
            var atIndex = this.collection.indexOf(model),
                defer   = $.Deferred();

            model = (typeof model === 'string' ? this.getById(model) : model);

            /**
             * Move child models to a higher level.
             * Then, remove notes attached to the notebook or change their notebookId.
             * And finally, remove the notebook.
             */
            this.updateChildren(model)
            .then(Radio.request('notes', 'change:notebookId', model, removeNotes))
            .then(function() {
                return model.destroySync();
            })
            .then(function() {
                Radio.trigger('notebooks', 'model:destroy', atIndex, model.id);
                defer.resolve();
            });

            return defer.promise();
        },

        /**
         * Fetch all the models.
         */
        getAll: function(options) {
            var defer = $.Deferred(),
                self  = this;

            // Do no fetch twice
            if (this.collection) {
                return defer.resolve(
                    options ? this.filter(options) : this.collection
                );
            }

            // Instantiate the collection and start listening to events
            this.collection = new Notebooks();
            this.collection.registerEvents();

            // Events
            this.listenTo(this.collection, 'reset:all', this.reset);

            $.when(this.collection.fetch(options))
            .then(function() {
                self.collection.models = self.collection.getTree();
                defer.resolve(self.collection);
            });

            return defer.promise();
        },

        filter: function(options) {
            return this.collection.fullCollection.where(options.conditions);
        },

        /**
         * Returns models with the specified parent ID.
         */
        getChildren: function(parentId) {
            var defer = $.Deferred(),
                collection;

            // Filter an existing collection if it exists
            if (this.collection) {
                collection = this.collection.clone();
                collection.reset(collection.getChildren(parentId));
                return defer.resolve(collection);
            }

            // Fetch everything anew
            collection = new Notebooks();

            $.when(collection.fetch({conditions: {parentId: parentId}}))
            .then(function() {
                defer.resolve(collection);
            });

            return defer.promise();
        },

        /**
         * Move child models to a higher level.
         */
        updateChildren: function(model) {
            return this.getChildren(model.id)
            .then(function(collection) {
                var wait;

                // Change parentId of each children
                collection.each(function(child) {
                    if (!wait) {
                        wait = $.when(child.save({parentId: model.get('parentId')}));
                        return;
                    }
                    wait.then(child.save({parentId : model.get('parentId')}));
                });

                return wait;
            });
        }

    });

    // Initialize it automaticaly
    Radio.command('init', 'add', 'app:before', function() {
        new Collection();
    });

    return Collection;

});
