/* global define */
define([
    'underscore',
    'jquery',
    'backbone.radio',
    'collections/modules/module',
    'collections/notes'
], function(_, $, Radio, ModuleObject, Notes) {
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
     * 1. `get:model`         - returns a model with the provided id.
     * 2. `filter`            - returns a collection filtered by provided filters.
     * 3. `get:model:full`    - returns a model and its notebook
     * 4. `change:notebookId` - changes notebookId of notes attached to a provided
     *                          notebook. Returns a promise.
     *
     * Triggers events
     * --------
     * 1. channel: `notes`, event: `save:after`
     *    after a note was updated.
     * 2. channel: `notes`, event: `model:destroy`
     *    after a note has been removed or its status was changed.
     */
    var Collection = ModuleObject.extend({
        Collection: Notes,

        comply: function() {
            return {
                'save'    : this.saveModel,
                'remove'  : this.remove,
                'restore' : this.restore
            };
        },

        reply: function() {
            return {
                'save:all'          : this.saveAll,
                'get:model'         : this.getById,
                'get:model:full'    : this.getModelFull,
                'get:all'           : this.filter,
                'filter'            : this.filter,
                'change:notebookId' : this.onNotebookRemove
            };
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
                self  = this,
                cond;

            // Destroy old collection
            this.trigger('collection:destroy');

            // Get filter parameters
            cond = Notes.prototype.conditions[options.filter || 'active'];
            cond = (typeof cond === 'function' ? cond(options) : cond);

            this.getAll(_.extend({}, options, {
                conditions    : cond,
                sort          : false,
                beforeSuccess : (
                    this.storage !== 'indexeddb' || !cond ? this._filterOnFetch : null
                )
            }))
            .then(function() {
                defer.resolve(self.collection);
            });

            return defer.promise();
        },

        /**
         * Return a note with its notebook
         */
        getModelFull: function(options) {
            var defer = $.Deferred();

            this.getById(options)
            .then(function(note) {
                Radio.request('notebooks', 'get:model', _.extend({}, options, {
                    id: note.get('notebookId')
                }))
                .then(function(notebook) {
                    defer.resolve(note, notebook);
                });
            });

            return defer.promise();
        },

        /**
         * Saves changes to a note.
         */
        saveModel: function(model, data) {
            var self = this;
            model.setEscape(data);

            /**
             * Before saving the model, add tags.
             */
            $.when(Radio.request('tags', 'add', data.tags || []))
            .then(function() {
                return self.save(model, model.toJSON());
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
                wait = $.when(model.save({trash: 1, updated: Date.now()}));
            }

            wait.then(function() {
                Radio.trigger('notes', 'model:destroy', atIndex);
            });
        },

        /**
         * When a notebook is removed, change notebookId of the notes
         * attached to it.
         */
        onNotebookRemove: function(notebook, remove) {
            var defer = $.Deferred(),
                self  = this,
                data  = {notebookId: 0},
                promise;

            // Place notes in trash
            if (remove) {
                data.trash = 1;
            }

            // Fetch notes that are attached to a specified notebook
            this.filter({filter: 'notebook', query: notebook.get('id')})
            .then(function(notes) {
                if (notes.length === 0) {
                    return defer.resolve();
                }

                // Change notebookId of each note or remove them
                notes.fullCollection.each(function(note) {
                    if (!promise) {
                        promise = $.when(self.save(note, data));
                        return;
                    }
                    promise.then(self.save(note, data));
                });

                promise.then(defer.resolve);
            });

            return defer.promise();
        },

        /**
         * Use Backbone's filters when IndexedDB is not available
         */
        _filterOnFetch: function(collection, options) {
            collection.filterList(options.filter, options);
        }

    });

    // Initialize it automaticaly
    Radio.command('init', 'add', 'app:before', function() {
        new Collection();
    });

    return Collection;
});
