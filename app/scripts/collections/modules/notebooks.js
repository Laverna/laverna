/* global define */
define([
    'underscore',
    'jquery',
    'backbone.radio',
    'collections/modules/module',
    'collections/notebooks'
], function(_, $, Radio, ModuleObject, Notebooks) {
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
    var Collection = ModuleObject.extend({
        Collection: Notebooks,

        comply: function() {
            return {
                'remove' : this.remove,
                'save'   : this.save
            };
        },

        reply: function() {
            return {
                'save:all'  : this.saveAll,
                'get:all'   : this.getNotebooks,
                'get:model' : this.getById
            };
        },

        getNotebooks: function(options) {
            var defer = $.Deferred(),
                self  = this;

            this.getAll(options)
            .then(function() {
                self.collection.models = self.collection.getTree();
                defer.resolve(self.collection);
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
