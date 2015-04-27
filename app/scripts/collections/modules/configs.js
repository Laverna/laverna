/* global define */
define([
    'jquery',
    'underscore',
    'backbone.radio',
    'collections/modules/module',
    'collections/configs'
], function($, _, Radio, ModuleObject, Configs) {
    'use strict';

    /**
     * Configs collection.
     *
     * Triggers events on channel `configs`:
     * 1. event: `collection:empty` - if the collection is empty.
     * 2. event: `removed:profile`  - when some profile is removed.
     * 3. event: `changed`          - after configs are changed
     *
     * Replies on channel `configs` to:
     * 1. request: `get:config` - returns a config.
     * 2. request: `get:object` - returns configs in key=value format.
     * 3. request: `get:all`    - fetches every model from the storage
     *                            and returns them.
     * 4. request: `get:model`  - returns a model.
     *
     * Complies on channel `configs` to:
     * 1. command: `save`           - saves changes to a model
     * 2. command: `save:objects`   - save several configs at once
     * 3. command: `create:profile` - create a new profile
     * 3. command: `remove:profile` - remove a profile
     */
    var Collection = ModuleObject.extend({
        Collection: Configs,

        comply: function() {
            return {
                'save'           : this.save,
                'save:objects'   : this.saveObjects,
                'create:profile' : this.createProfile,
                'remove:profile' : this.removeProfile
            };
        },

        reply: function() {
            return {
                'get:config' : this.getConfig,
                'get:object' : this.getObject,
                'get:all'    : this.getConfigs,
                'get:model'  : this.getById
            };
        },

        /**
         * Create a new profile
         */
        createProfile: function(model, name) {
            return model.createProfile(name);
        },

        /**
         * Remove a profile
         */
        removeProfile: function(model, name) {
            return $.when(model.removeProfile(name, model))
            .then(function() {
                Radio.trigger('configs', 'removed:profile', name);
            });
        },

        /**
         * Update several configs at once
         */
        saveObjects: function(objects, useDefault) {
            var defer    = $.Deferred(),
                self     = this,
                promise,
                model;

            _.each(objects, function(object) {
                model = this.collection.get(object.name);

                if (object.name === 'useDefaultConfigs') {
                    model = useDefault;
                }

                if (!promise) {
                    promise = $.when(this.save(model, object));
                    return;
                }

                promise.then(function() {
                    self.save(model, object);
                });
            }, this);

            promise.then(function() {
                Radio.trigger('configs', 'changed');
                defer.resolve();
            });

            return defer.promise();
        },

        /**
         * Return the value of a specific config
         */
        getConfig: function(name) {
            return this.getObject()[name];
        },

        /**
         * Return configs as key=value
         */
        getObject: function() {
            return this.collection.getConfigs();
        },

        /**
         * Find a model by ID
         */
        getById: function(options) {
            var defer      = $.Deferred(),
                collection = new Configs();

            options = (typeof options === 'string' ? {name: options} : options);
            collection.changeDB(options.profile || 'notes-db');

            $.when(collection.fetch({conditions: {name: options.name}}))
            .then(function() {
                if (!collection.length) {
                    collection = collection.getDefault(options.name);
                }
                else {
                    collection = collection.get(options.name);
                }

                collection.changeDB(options.profile || 'notes-db');
                defer.resolve(collection);
            });

            return defer.promise();
        },

        /**
         * Fetch everything.
         */
        getConfigs: function(options) {
            var defer = $.Deferred(),
                self  = this;

            if (this.collection) {
                return defer.resolve(this.collection);
            }

            /**
             * Before fetching configs collection, find out whether
             * we should use configs from the default profile.
             */
            this.getById({name: 'useDefaultConfigs', profile: options.profile})
            .then(function(model) {
                if (!model || Number(model.get('value'))) {
                    delete options.profile;
                }
                return self.getAll(options);
            })
            .then(function() {
                if (!self.collection.hasNewConfigs()) {
                    return defer.resolve(self.collection);
                }

                // Trigger an event if the collection is empty
                if (self.collection.length === 0) {
                    self.vent.trigger('collection:empty');
                }

                // If the collection is empty, create default set of configs.
                _.bindAll(self.collection, 'createDefault');

                $.when(self.collection.migrateFromLocal())
                .then(self.collection.createDefault)
                .then(defer.resolve);
            });

            return defer.promise();
        }

    });

    /**
     * Initialize it automaticaly because everything depends on configs
     * collection.
     */
    return new Collection();
});
