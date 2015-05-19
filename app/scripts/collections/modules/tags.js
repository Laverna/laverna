/* global define */
define([
    'underscore',
    'q',
    'backbone.radio',
    'collections/modules/module',
    'collections/tags',
    'sjcl'
], function(_, Q, Radio, ModuleObject, Tags, sjcl) {
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
     * 3. `add`       - add several tags at once.
     *
     * Triggers events:
     * 1. `add:model` to a collection that is currently under use
     *    when a new model was added or updated.
     * 2. channel: `tags`, event: `save:after`
     *    after a model was added or updated.
     * 3. channel: `tags`, event: `model:destroy`
     *    after a model was destroyed.
     */
    var Collection = ModuleObject.extend({
        Collection: Tags,

        comply: function() {
            return {
                'remove' : this.remove,
                'save'   : this.saveModel
            };
        },

        reply: function() {
            return {
                'save:all'  : this.saveAll,
                'add'       : this.add,
                'get:all'   : this.getAll,
                'get:model' : this.getById
            };
        },

        filter: function(options) {
            var collection = this.collection.fullCollection || this.collection;
            return collection.where(options.conditions);
        },

        /**
         * Add a new model or update an existing one.
         */
        saveModel: function(model, data) {
            var self  = this,
                id    = sjcl.hash.sha256.hash(data.name).join('');

            // First, make sure that a model won't duplicate itself.
            return this._removeOld(id, model)
            .then(function() {
                model.set('id', id);
                model.set(data);
                model.updateDate();

                return self.save(model, model.toJSON());
            });
        },

        /**
         * Add a bunch of tags
         */
        add: function(tags) {
            var self  = this,
                promises = [],
                model;

            if (!tags.length) {
                return Q.resolve();
            }

            _.each(tags, function(tag) {
                model = new Tags.prototype.model();

                promises.push(self.save(model, {name: tag}));
            });

            return Q.all(promises);
        },

        /**
         * Sometimes a tag might have a new ID.
         * If that happens, tags will be duplicated.
         * With this method we solve that problem.
         */
        _removeOld: function(newId, model) {
            if (!model.id || !this.collection || newId === model.id) {
                return Q.resolve();
            }

            return this.remove(model)
            .thenResolve(model);
        }

    });

    // Initialize the collection automaticaly
    Radio.command('init', 'add', 'app:before', function() {
        new Collection();
    });

    return Collection;

});
