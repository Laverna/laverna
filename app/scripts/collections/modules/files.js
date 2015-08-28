/* global define */
define([
    'q',
    'underscore',
    'backbone.radio',
    'collections/modules/module',
    'collections/files',
    'models/file',
    'toBlob',
    'blobjs'
], function(Q, _, Radio, ModuleObject, Files, File, toBlob) {
    'use strict';

    /**
     * Files collection.
     *
     * Complies to commands on channel `files`:
     * 1. `save`     - saves changes to a model.
     * 2. `save:all` - saves several changes to several models.
     * 3. `remove`   - removes an existing model.
     *
     * Replies to requests on channel `files`:
     * 1. `save:all`  - saves changes to a model, returns a promise.
     * 2. `get:model` - finds a model by ID and returns it.
     * 3. `get:all`   - returns collection with all existing models.
     * 4. `get:files` - fetches all files with specified IDs.
     *
     * Triggers events on channel `files`:
     * 1. `saved:all` - after changes to collection were saved.
     */
    var Collection = ModuleObject.extend({
        Collection: Files,

        comply: function() {
            return {
                'save'     : this.saveModel,
                'save:all' : this.saveAll,
                'remove'   : this.remove
            };
        },

        reply: function() {
            return {
                'save:all'   : this.saveAll,
                'get:model'  : this.getById,
                'get:all'    : this.getAll,
                'get:files'  : this.getFiles
            };
        },

        /**
         * Fetch files with specific ids
         */
        getFiles: function(ids, options) {
            var promises = [];

            this.changeDatabase(options);

            _.each(ids, function(id) {
                promises.push(
                    new Q(new this.Collection.prototype.model({id: id}).fetch())
                );
            }, this);

            return Q.all(promises).then(function() {
                return arguments[0];
            });
        },

        saveModel: function(model, data) {
            data.src = toBlob(data.src);
            model.setEscape(data);

            return this.save(model, model.toJSON());
        },

        saveAll: function(data, options) {
            var promises = [];

            console.warn('options', arguments);
            this.changeDatabase(options);

            _.each(data, function(imgData) {
                promises.push(
                    this.saveModel(new this.Collection.prototype.model(), imgData, options)
                );
            }, this);

            return Q.all(promises)
            .then(_.bind(function(files) {
                Radio.trigger('files', 'saved:all');
                return files;
            }, this));
        }

    });

    // Initialize it automaticaly
    Radio.command('init', 'add', 'app:before', function() {
        new Collection();
    });

    return Collection;
});
