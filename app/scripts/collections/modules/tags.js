/* global define */
define([
    'underscore',
    'q',
    'backbone.radio',
    'collections/modules/module',
    'collections/tags'
], function(_, Q, Radio, ModuleObject, Tags) {
    'use strict';

    /**
     * Tags collection.
     * A convenience object that handles operations to Tags collection.
     *
     * Listens to events:
     * 1. this.collection, event: `reset:all`
     *    destroys the current collection.
     *
     * Replies to requests on channel `tags`:
     * 1. `get:all`  - returns a collection.
     * 2. `get:model` - returns a model with the specified ID.
     * 3. `add`       - add several tags at once.
     * 4. `remove` - removes an existing model.
     * 5. `save`   - adds a new model or updates an existing one.
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

        reply: function() {
            return {
                'remove'    : this.remove,
                'save'      : this.saveModel,
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
            var self  = this;

            // First, make sure that a model won't duplicate itself.
            return new Q(Radio.request('encrypt', 'sha256', data.name))
            .then(function(id) {
                id = id.join('');
                return self._removeOld(id, model)
                .thenResolve(id);
            })
            .then(function(id) {
                model.set('id', id);
                model.set(data);
                model.updateDate();

                return self.save(model, model.toJSON());
            });
        },

        /**
         * Add a bunch of tags
         */
        add: function(tags, options) {
            var self     = this,
                promises = [];

            if (!tags.length) {
                return Q.resolve();
            }

            options = options || {};
            _.each(tags, function(tag) {
                promises.push(self._findSave(tag, options));
            });

            return Q.all(promises);
        },

        /**
         * If there is not a tag with such a name, add a new one.
         */
        _findSave: function(name, options) {
            var self = this;

            return new Q(Radio.request('encrypt', 'sha256', name))
            .then(function(id) {
                return self.getById(
                    _.extend({}, options, {id: id.join('')})
                );
            })
            .then(function(model) {
                return model;
            })
            .catch(function(model) {
                console.error('Can\'t find the model, adding', name, arguments);

                model = new self.Collection.prototype.model();
                return self.saveModel(model, {name: name});
            });
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
    Radio.request('init', 'add', 'app:before', function() {
        new Collection();
    });

    return Collection;

});
