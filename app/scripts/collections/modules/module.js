/* global define */
define([
    'q',
    'underscore',
    'marionette',
    'backbone.radio',
    'collections/notes'
], function(Q, _, Marionette, Radio, Notes) {
    'use strict';

    /**
     * Collection object from which other collection objects extend.
     */
    var Module = Marionette.Object.extend({

        Collection: Notes,
        defaultDB : 'notes-db',

        comply: function() {
            return {};
        },

        reply: function() {
            return {};
        },

        initialize: function() {
            this.vent    = Radio.channel(this.Collection.prototype.storeName);
            this.storage = Radio.request('global', 'storage');

            this.vent.comply(this.comply(), this);
            this.vent.reply(this.reply(), this);

            // Listen to events
            this.on('collection:destroy', this.reset, this);
        },

        reset: function() {
            if (!this.collection) {
                return;
            }

            this.stopListening(this.collection);
            if (this.collection.removeEvents) {
                this.collection.removeEvents();
            }
            this.collection.reset([]);
            delete this.collection;
        },

        /**
         * Switch to another database (e.g. profile)
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

            this.Collection = collection;
        },

        getAll: function(options) {
            var self  = this;
            options.profile = options.profile || this.defaultDB;

            // Do not fetch twice
            if (this.collection && this.collection.database.id === options.profile) {
                return new Q(
                    options ? self.filter(options) : self.collection
                );
            }

            // Switch to another profile
            this.reset();
            this.changeDatabase(options);

            // Instantiate a collection
            this.collection = new this.Collection();

            // Register events
            if (this.collection.registerEvents) {
                this.collection.registerEvents();
            }

            // Events
            this.listenTo(this.collection, 'reset:all', this.reset);

            return new Q(this.collection.fetch(options))
            .then(function() {
                return new Q(self.decryptModels());
            })
            .thenResolve(self.collection);
        },

        filter: function(options) {
            return this.collection.where(options.conditions);
        },

        /**
         * Find a model by id.
         */
        getById: function(options) {
            var self  = this;

            options = (typeof options === 'string' ? {id: options} : options);
            this.changeDatabase(options);

            // If id was not provided, just instantiate a new model
            if (!options || !options.id || options.id === '0') {
                return new Q(new this.Collection.prototype.model());
            }

            // In case if the collection isn't empty, get the model from there.
            if (this.collection && this.collection.get(options.id)) {
                return new Q(
                    this.collection.get(options.id)
                );
            }

            // Otherwise, fetch it
            var model = new this.Collection.prototype.model({id: options.id});

            return new Q(model.fetch())
            .then(function() {
                return self.decryptModel(model);
            })
            .thenResolve(model);
        },

        /**
         * Save all changes in the collection
         */
        saveAll: function() {
            var promises = [];

            this.collection.each(function(model) {
                promises.push(
                    Q.invoke(model, 'save', model.toJSON())
                );
            });

            return Q.all(promises)
            .then(function() {
                Radio.trigger('collection', 'saved:all');
            });
        },

        /**
         * Save changes to a model.
         */
        save: function(model, data) {
            var defer = Q.defer(),
                self  = this;

            model.set(data);

            // In case if a model is encrypted, try to decrypt it before encrypting
            self.decryptModel(model);
            self.encryptModel(model);

            model.save(model.toJSON(), {
                success: function() {
                    // Decrypt the model again before adding it to collection
                    self.decryptModel(model);

                    if (self.collection) {
                        self.collection.trigger('add:model', model);
                    }
                    self.vent.trigger('save:after', model.get('id'));
                    defer.resolve(model);
                }
            });

            return defer.promise;
        },

        /**
         * Remove an existing model
         */
        remove: function(model) {
            var atIndex = this.collection.indexOf(model),
                self    = this;

            model = (typeof model === 'string' ? this.getById(model) : model);

            return new Q(model.destroySync())
            .then(function() {
                self.vent.trigger('model:destroy', atIndex, model.id);
            });
        },

        _isEncryptEnabled: function(model) {
            var configs = Radio.request('configs', 'get:object');
            model       = model || this.Collection.prototype.model.prototype;

            return (
                model.encryptKeys &&
                (Number(configs.encrypt) || Number(configs.encryptBackup.encrypt))
            );
        },

        /**
         * Decrypt every model in the collection
         */
        decryptModels: function() {
            if (!this._isEncryptEnabled()) {
                return;
            }
            var collection = this.collection.fullCollection || this.collection;
            return Radio.request('encrypt', 'decrypt:models', collection);
        },

        encryptModel: function(model) {
            if (!this._isEncryptEnabled(model)) {
                return;
            }
            return Radio.request('encrypt', 'encrypt:model', model);
        },

        decryptModel: function(model) {
            if (!this._isEncryptEnabled(model)) {
                return;
            }
            return Radio.request('encrypt', 'decrypt:model', model);
        }

    });

    return Module;
});
