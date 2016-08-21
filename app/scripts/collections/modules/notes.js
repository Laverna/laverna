/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define */
define([
    'underscore',
    'q',
    'marionette',
    'backbone.radio',
    'collections/modules/module',
    'collections/notes'
], function(_, Q, Marionette, Radio, ModuleObject, Notes) {
    'use strict';

    /**
     * Collection module for Notes.
     *
     * Apart from the replies in collections/modules/module.js,
     * it also has additional replies:
     * 1. `get:model:full`    - returns a note with its notebook.
     * 2. `restore`           - restores a note from trash
     * 3. `change:notebookId` - when a notebook is removed, either move all attached
     *    notes to trash or change notebook ID.
     */
    var Collection = ModuleObject.extend({
        Collection: Notes,

        reply: function() {
            return {
                'get:model:full'  : this.getModelFull,
                'restore'         : this.restore,
                'change:notebookId' : this.onNotebookRemove
            };
        },

        /**
         * Save a note.
         * @type object Backbone model
         * @type object new values
         */
        saveModel: function(model, data, saveTags) {
			if(saveTags === undefined || saveTags === null){
				saveTags = true;
			}
            var saveFunc = _.bind(ModuleObject.prototype.saveModel, this);

			if(saveTags){
            	// Before saving the model, add tags
				return new Q(Radio.request('tags', 'add', data.tags || [], {
					profile: model.profileId
				}))
				.then(function() {
					return saveFunc(model, data);
				});
			}

			// Save model without tags
			return saveFunc(model,data);

        },

        /**
         * Remove a note.
         * @type object Backbone model
         * @type object options
         */
        remove: function(model, options) {
            var self = this;
            model = (typeof model === 'string' ? this.getModel(model, options) : model);

            return new Q(model)
            .then(function(model) {
                // If the model is already in trash, destroy it
                if (Number(model.get('trash')) === 1) {
                    var removeFunc = _.bind(ModuleObject.prototype.remove, self);
                    return removeFunc(model, options);
                }

                // Otherwise, just change 'trash' status
                return self.save(model, {trash: 1, updated: Date.now()})
                .then(function(model) {
                    self.vent.trigger('destroy:model', model);
                    return model;
                });
            });
        },

        /**
         * Restore a model from trash.
         * @type object Backbone model
         * @type object options
         */
        restore: function(model, options) {
            var self = this;
            model = (typeof model === 'string' ? this.getModel(model, options) : model);

            return new Q(model)
            .then(function(model) {
                return self.save(model, {trash: 0, updated: Date.now()})
                .then(function(model) {
                    self.vent.trigger('restore:model', model);
                    return model;
                });
            });
        },

        /**
         * When a notebook is removed, either move all attached
         * notes to trash or change notebook ID.
         * @type object Backbone model
         * @type boolean true if all attached notes should be removed
         */
        onNotebookRemove: function(notebook, remove) {
            var self = this,
                data = {notebookId: 0};

            if (remove) {
                data.trash = 1;
            }

            return this.fetch({
                conditions: {
                    notebookId: notebook.id
                },
                profile : notebook.profileId
            })
            .then(function(notes) {
                if (notes.length === 0) {
                    return;
                }

                var coll     = notes.fullCollection || notes,
                    promises = [];

                coll.each(function(note) {
                    promises.push(self.saveModel(note, data));
                });

                return Q.all(promises);
            });
        },

        /**
         * Get all notes.
         * @type object options
         */
        getAll: function(options) {
            var getAll    = _.bind(ModuleObject.prototype.getAll, this),
                self      = this,
                sortField = Radio.request('configs', 'get:config', 'sortnotes');

            options.filter = options.filter || 'active';

            this.Collection.prototype.sortField = sortField;

            return getAll(options)
            .then(function(collection) {
                self._filterOnFetch(collection, options);
                return collection;
            });
        },

        /**
         * Use Backbone's filters when IndexedDB is not available
         */
        _filterOnFetch: function(collection, options) {
            collection.filterList(options.filter, options);
        },

        /**
         * Return a note with its notebook.
         * @type object options
         */
        getModelFull: function(options) {
            return this.getModel(options)
            .then(function(note) {
                return Q.all([
                    Radio.request('notebooks', 'get:model', {
                        profile : options.profile,
                        id      : note.get('notebookId')
                    }),
                    Radio.request('files', 'get:files', note.get('files'), {
                        profile: options.profile
                    })
                ])
                .spread(function(notebook, files) {
                    note.notebook = notebook;
                    note.files    = files;
                    return [note, notebook];
                });
            });
        },
    });

    // Initialize it automaticaly
    Radio.request('init', 'add', 'app:before', function() {
        new Collection();
    });

    return Collection;
});
