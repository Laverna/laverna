/* global define */
define([
    'underscore',
    'q',
    'backbone.radio',
    'collections/modules/module',
    'collections/notes'
], function(_, Q, Radio, ModuleObject, Notes) {
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
                'save'              : this.saveModel,
                'save:all'          : this.saveAll,
                'get:model'         : this.getById,
                'get:model:full'    : this.getModelFull,
                'fetch'             : this.fetch,
                'get:all'           : this.filter,
                'change:notebookId' : this.onNotebookRemove
            };
        },

        onDestroy: function() {
            this.collection.trigger('destroy');
            this.vent.stopReplying('get:model get:model:full filter');
            this.vent.stopComplying('save remove restore');
        },

        fetch: function(options) {
            this.changeDatabase(options);
            var collection = new this.Collection();

            return new Q(collection.fetch(options))
            .then(function() {
                return Radio.request('encrypt', 'decrypt:models', collection.fullCollection);
            })
            .thenResolve(collection);
        },

        /**
         * Filters the collection.
         */
        filter: function(options) {
            var self  = this,
                cond;

            // Destroy old collection
            this.trigger('collection:destroy');

            // Get filter parameters
            cond = Notes.prototype.conditions[options.filter || 'active'];
            cond = (typeof cond === 'function' ? cond(options) : cond);

            return this.getAll(_.extend({}, options, {
                conditions    : cond,
                sort          : false,
                beforeSuccess : (
                    this.storage !== 'indexeddb' || !cond ? this._filterOnFetch : null
                )
            }))
            .thenResolve(self.collection);
        },

        /**
         * Return a note with its notebook
         */
        getModelFull: function(options) {
            return this.getById(options)
            .then(function(note) {
                var profile = options.profile;

                return Q.all([
                    Radio.request('notebooks', 'get:model', {
                        profile : profile,
                        id      : note.get('notebookId')
                    }),
                    Radio.request('files', 'get:files', note.get('files'), {
                        profile: profile
                    })
                ])
                .spread(function(notebook, files) {
                    note.notebook = notebook;
                    note.files    = files;
                    return [note, notebook, files];
                });
            });
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
            return new Q(Radio.request('tags', 'add', data.tags || []))
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
            return new Q(model.save({trash: 0}))
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
                wait = new Q(model.save({trash: 1, updated: Date.now()}));
            }

            return wait.then(function() {
                Radio.trigger('notes', 'model:destroy', atIndex);
            });
        },

        /**
         * When a notebook is removed, change notebookId of the notes
         * attached to it.
         */
        onNotebookRemove: function(notebook, remove) {
            var self     = this,
                data     = {notebookId: 0},
                promises = [];

            // Place notes in trash
            if (remove) {
                data.trash = 1;
            }

            // Fetch notes that are attached to a specified notebook
            return this.filter({filter: 'notebook', query: notebook.get('id')})
            .then(function(notes) {
                if (notes.length === 0) {
                    return Q.resolve();
                }

                // Change notebookId of each note or remove them
                notes.fullCollection.each(function(note) {
                    promises.push(self.save(note, data));
                });

                return Q.all(promises);
            });
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
