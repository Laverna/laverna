/* global define */
define([
    'underscore',
    'q',
    'marionette',
    'backbone.radio'
], function(_, Q, Marionette, Radio) {
    'use strict';

    /**
     * Collection object from which other collection objects extend.
     *
     * For default it
     *
     * replies to the following requests:
     * 1. save            - save model changes
     * 2. save:collection - save all collection changes
     * 3. save:all:raw    - saves several objects
     * 4. fetch           - fetches models from the database
     * 5. get:model       - returns a specific model
     * 6. get:all         - returns a collection
     * 7. remove          - removes a model
     *
     * and triggers the following events:
     * 1. model:update    - after a model is updated or created
     * 2. destroy:model   - after a model is removed
     */
    var Module = Marionette.Object.extend({
        /**
         * @type object Backbone collection
         */
        Collection: null,

        /**
         * @type string default profile
         */
        defaultDB: 'notes-db',

        /**
         * Requests to which every collection module
         * replies for default.
         * @return object
         */
        reply: function() {
            return {
                'save'            : this.saveModel,
                'save:collection' : this.saveCollection,
                'save:raw'        : this.saveRaw,
                'save:all:raw'    : this.saveAllRaw,
                'fetch'           : this.fetch,
                'get:model'       : this.getModel,
                'get:all'         : this.getAll,
                'remove'          : this.remove,
            };
        },

        initialize: function() {
            // Default replies
            var defReply = _.bind(Module.prototype.reply, this);

            this.vent = Radio.channel(this.Collection.prototype.storeName);

            // Register replies
            this.vent.reply(_.extend(defReply(), this.reply()), this);

            // Listen to events
            this.listenTo(this.vent, 'destroy:collection', this.onReset, this);
        },

        /**
         * Switch to another database (e.g. profile)
         * @type object
         */
        changeDatabase: function(options) {
            var profile  = options && options.profile ? options.profile : this.defaultDB,
                database = _.extend({}, this.Collection.prototype.database, {
                    id: profile
                }),
                model,
                collection;

            model  = this.Collection.prototype.model.extend({
                database : database
            });

            collection = this.Collection.extend({
                database : database,
                model    : model
            });

            return collection;
        },

        /**
         * Stop listening to current collection's events.
         */
        onReset: function() {
            if (!this.collection) {
                return;
            }

            this.stopListening(this.collection);
            if (this.collection.removeEvents) {
                this.collection.removeEvents();
            }
            this.collection.reset([]);
            this.collection = null;
        },

        /**
         * Save changes to a model.
         * @type object Backbone model
         * @type object new values
         */
        save: function(model, data) {
            var self  = this,
                set   = model.setEscape ? 'setEscape' : 'set';

            // Set new values
            model[set](data);

            return new Q(self.encryptModel(model))
            .then(function(model) {
                return new Q(model.save(model.attributes))
                .thenResolve(model);
            });
        },

        /**
         * @type object Backbone model
         * @type object new values
         */
        saveModel: function(model, data) {
            var self = this;

            return this.save(model, data)
            .then(function(model) {
                self.vent.trigger('sync:model', model);
                return self.decryptModel(model);
            })
            .then(function(model) {
                self.vent.trigger('update:model', model);
                return model;
            });
        },

        /**
         * Save all changes in the collection.
         * @type object Backbone collection
         */
        saveCollection: function(collection) {
            var promises = [],
                self     = this;
            collection   = collection || this.collection;

            collection.each(function(model) {
                promises.push(
                    Q.invoke(model, 'save', model.attributes)
                );
            });

            return Q.all(promises)
            .then(function() {
                self.vent.trigger('saved:collection');
                return collection;
            });
        },

        /**
         * Saves raw object to the database.
         * @type object JSON object
         * @type object options
         */
        saveRaw: function(data, options) {
            var self  = this,
                model = new (this.changeDatabase(options)).prototype.model(data);

            return this.save(model, data)
            .then(this.decryptModel)
            .then(function(model) {
                self.vent.trigger('update:model', model);
                return model;
            });
        },

        /**
         * Saves all changes.
         * @type array
         */
        saveAllRaw: function(arData, options) {
            var promises = [];

            _.each(arData, function(data) {
                promises.push(this.saveRaw(data, options));
            }, this);

            return Q.all(promises);
        },

        /**
         * Remove a model.
         * @type object Backbone model or ID
         * @type object options
         */
        remove: function(model, options) {
            var self = this;
            model = typeof model === 'string' ? model : model.id;
            model = new (this.changeDatabase(options)).prototype.model({id: model});

            model.set({'trash': 2});

            return this.save(model, model.attributes)
            .then(function() {
                self.vent.trigger('destroy:model', self.collection.get(model.id));
            });
        },

        /**
         * Find a model by id.
         * @type object options
         */
        getModel: function(options) {
            var Model  = (this.changeDatabase(options)).prototype.model,
                idAttr = Model.prototype.idAttribute,
                data   = {},
                model;

            data[idAttr] = options[idAttr];
            model        = new Model(data);

            // If id was not provided, return a model with default values
            if (!options[idAttr] || options[idAttr] === '0') {
                model.set(idAttr, undefined);
                return new Q(model);
            }

            // In case if the collection isn't empty, get the model from there.
            if (this.collection &&
                this.collection.database.id === model.database.id &&
                this.collection.get(options[idAttr])) {
                return new Q(this.collection.get(options[idAttr]));
            }

            var self = this;

            return new Q(model.fetch())
            .then(function() {
                return self.decryptModel(model)
                .thenResolve(model);
            })
            .fail(function(e) {
                if (typeof e === 'string' && e.search('not found')) {
                    return null;
                }
                throw new Error(e);
            });
        },

        /**
         * Fetch data and create a new collection.
         * @type object options
         */
        getAll: function(options) {
            var self = this;
            this.vent.trigger('destroy:collection');

            // Add filter conditions
            if (options.filter) {
                var cond = this.Collection.prototype.conditions[options.filter];
                cond = (typeof cond === 'function' ? cond(options) : cond);
                options.conditions = cond;
            }

            this.onReset();

            return this.fetch(options || {})
            .then(function(collection) {
                self.collection = collection;
                self.collection.conditionFilter = options.filter;

                // Register events
                if (self.collection.registerEvents) {
                    self.collection.registerEvents();
                }

                // Events
                self.listenTo(self.collection, 'reset:all', self.onReset);

                return self.collection;
            });
        },

        /**
         * Fetch data.
         * @type object options
         */
        fetch: function(options) {
            var collection = new (this.changeDatabase(options))(),
                self       = this;

            return new Q(collection.fetch(options))
            .then(function() {
                // Return in decrypted format
                if (!options.encrypt) {
                    return self.decryptModels(collection.fullCollection || collection)
                    .thenResolve(collection);
                }
                return collection;
            });
        },

        /**
         * @return boolean
         */
        _isEncryptEnabled: function(model) {
            // Don't use encryption on configs
            if (this.Collection.prototype.storeName === 'configs') {
                return false;
            }

            var configs = Radio.request('configs', 'get:object');
            model       = model || this.Collection.prototype.model.prototype;

            return (
                model.encryptKeys &&
                (Number(configs.encrypt) || Number(configs.encryptBackup.encrypt))
            );
        },

        /**
         * @type object Backbone model
         */
        encryptModel: function(model) {
            if (!this._isEncryptEnabled(model)) {
                return new Q(model);
            }

            return this.decryptModel(model)
            .then(function(model) {
                return Radio.request('encrypt', 'encrypt:model', model);
            });
        },

        /**
         * @type object Backbone model
         */
        decryptModel: function(model) {
            if (!this._isEncryptEnabled(model)) {
                return new Q(model);
            }

            return new Q(
                Radio.request('encrypt', 'decrypt:model', model)
            );
        },

        /**
         * Decrypt every model in the collection
         * @type object Backbone collection
         */
        decryptModels: function(collection) {
            collection = collection || this.collection;
            if (!this._isEncryptEnabled(collection.model.prototype)) {
                return new Q(collection);
            }

            collection = collection.fullCollection || collection;
            return Radio.request('encrypt', 'decrypt:models', collection);
        }
    });

    return Module;
});
