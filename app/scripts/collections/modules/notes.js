/* global define */
define([
    'underscore',
    'jquery',
    'backbone.radio',
    'marionette',
    'collections/notes'
], function(_, $, Radio, Marionette, Notes) {
    'use strict';

    /**
     * Notes collection module.
     * It is used to fetch, add, save notes.
     *
     * Listens to
     * ----------
     * Complies on channel `notes`:
     * 1. `save`    - saves a model
     * 2. `remove`  - removes a model
     * 2. `restore` - restores a model from trash
     *
     * Replies on channel `notes`:
     * 1. `get:model`      - returns a model with the provided id.
     * 2. `filter`         - returns a collection filtered by provided filters.
     * 3. `get:model:full` - returns a model and its notebook
     *
     * Triggers events
     * --------
     * 1. channel: `notes`, event: `save:after`
     *    after a note was updated.
     * 2. channel: `notes`, event: `model:destroy`
     *    after a note has been removed or its status was changed.
     */
    var Collection = Marionette.Object.extend({

        initialize: function() {
            _.bindAll(this, 'filter', '_getNotes');
            this.vent = Radio.channel('notes');
            this.storage = Radio.request('global', 'storage');

            // Complies
            this.vent.comply({
                'save'          : this.save,
                'remove'        : this.remove,
                'restore'       : this.restore
            }, this);

            // Replies
            this.vent.reply({
                'get:model'      : this.getById,
                'get:model:full' : this.getModelFull,
                'filter'         : this.filter
            }, this);

            // Events
            this.on('collection:destroy', this.onCollectionDestroy, this);
        },

        onDestroy: function() {
            this.collection.trigger('destroy');
            this.vent.stopReplying('get:model get:model:full filter');
            this.vent.stopComplying('save remove restore');
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
            if (this.collection && this.collection.get(id)) {
                return defer.resolve(
                    this.collection.get(id)
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
         * Return a note with its notebook
         */
        getModelFull: function(id) {
            var defer = $.Deferred();

            this.getById(id)
            .then(function(note) {
                Radio.request('notebooks', 'get:model', note.get('notebookId'))
                .then(function(notebook) {
                    defer.resolve(note, notebook);
                });
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
                        self.collection.trigger('add:model', note);
                    }
                    Radio.trigger('notes', 'save:after', note.get('id'));
                }
            });
        },

        /**
         * Restores a model from trash
         */
        restore: function(model) {
            var atIndex = this.collection.indexOf(model);

            // Save a new `trash` status and emmit an event
            $.when(model.save({trash: 0}))
            .then(function() {
                Radio.trigger('notes', 'model:destroy', atIndex);
            });
        },

        /**
         * Removes a model
         */
        remove: function(model) {
            var atIndex = this.collection.indexOf(model),
                wait;

            model = (typeof model === 'string' ? this.getById(model) : model);

            // If the model is already in trash, destroy it
            if (Number(model.get('trash')) === 1) {
                wait = model.destroySync();
            }
            // Otherwise, just change its status
            else {
                model.updateDate();
                wait = $.when(model.save({trash: 1}));
            }

            wait.then(function() {
                Radio.trigger('notes', 'model:destroy', atIndex);
            });
        },

        /**
         * Fetches data.
         */
        _getNotes: function(options) {
            var cond;

            // Destroy old collection
            this.trigger('collection:destroy');

            // Instantiate a new collection
            this.collection = new Notes();

            // Register events
            this.collection.registerEvents();

            // Get filter parameters
            cond = this.collection.conditions[options.filter || 'active'];
            cond = (typeof cond === 'function' ? cond(options) : cond);

            // Fetch data
            return $.when(this.collection.fetch({
                conditions    : cond,
                sort          : false,
                page          : options.page,
                options       : options,
                beforeSuccess : (
                    this.storage !== 'indexeddb' || !cond ? this._filterOnFetch : null
                )
            }));
        },

        /**
         * Use Backbone's filters when IndexedDB is not available
         */
        _filterOnFetch: function(collection, options) {
            collection.filterList(options.filter, options);
        },

        /**
         * When some collection was destroyed, do some garbage collection.
         */
        onCollectionDestroy: function() {
            if (!this.collection) {
                return;
            }
            this.collection.removeEvents();
            this.collection.reset();
            delete this.collection;
        }

    });

    // Initialize it automaticaly
    Radio.command('init', 'add', 'app:before', function() {
        new Collection();
    });

    return Collection;
});
