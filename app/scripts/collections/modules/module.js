/* global define */
define([
    'underscore',
    'marionette',
    'backbone.radio',
    'collections/notes'
], function(_, Marionette, Radio, Notes) {
    'use strict';

    /**
     * Collection object from which other collection objects extend.
     */
    var Module = Marionette.Object.extend({
        Collection: Notes,

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
            this.collection.removeEvents();
            this.collection.reset([]);
            delete this.collection;
        },

        /**
         * Switch to another database (e.g. profile)
         */
        changeDatabase: function(options) {
            var profile  = options && options.profile ? options.profile : 'notes-db',
                database = _.extend({}, this.Collection.prototype.database, {
                    id: profile
                });

            this.Collection.prototype.database = database;
            this.Collection.prototype.model.prototype.database = database;
        },

        getAll: function(options) {
            var defer = $.Deferred(),
                self  = this;

            // Do not fetch twice
            if (this.collection) {
                return defer.resolve(
                    options ? self.filter(options) : self.collection
                );
            }

            // Switch to another profile
            this.changeDatabase(options);

            // Instantiate a collection
            this.collection = new this.Collection();

            // Register events
            if (this.collection.registerEvents) {
                this.collection.registerEvents();
            }

            // Events
            this.listenTo(this.collection, 'reset:all', this.reset);

            $.when(this.collection.fetch(options))
            .then(function() {
                defer.resolve(self.collection);
            });

            return defer.promise();
        },

        filter: function(options) {
            return this.collection.where(options.conditions);
        },

        /**
         * Find a model by id.
         */
        getById: function(options) {
            var defer = $.Deferred();

            options = (typeof options === 'string' ? {id: options} : options);
            this.changeDatabase(options);

            // If id was not provided, just instantiate a new model
            if (!options || !options.id || options.id === '0') {
                return defer.resolve(new this.Collection.prototype.model());
            }

            // In case if the collection isn't empty, get the model from there.
            if (this.collection && this.collection.get(options.id)) {
                return defer.resolve(
                    this.collection.get(options.id)
                );
            }

            // Otherwise, fetch it
            var model = new this.Collection.prototype.model({id: options.id});

            $.when(model.fetch())
            .then(function() {
                defer.resolve(model);
            });

            return defer.promise();
        },

        /**
         * Save changes to a model.
         */
        save: function(model, data) {
            var defer = $.Deferred(),
                self  = this;

            model.save(data, {
                success: function() {
                    if (self.collection) {
                        self.collection.trigger('add:model', model);
                    }
                    self.vent.trigger('save:after', model.get('id'));
                    defer.resolve(model);
                }
            });

            return defer.promise();
        },

        /**
         * Remove an existing model
         */
        remove: function(model) {
            var atIndex = this.collection.indexOf(model),
                self    = this,
                defer   = $.Deferred();

            model = (typeof model === 'string' ? this.getById(model) : model);

            $.when(model.destroySync())
            .then(function() {
                defer.resolve();
                self.vent.trigger('model:destroy', atIndex, model.id);
            });

            return defer.promise();
        }

    });

    return Module;
});
