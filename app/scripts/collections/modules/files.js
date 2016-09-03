/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
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
     * Collection module for Files.
     *
     * Apart from the replies in collections/modules/module.js,
     * it also has additional replies:
     *
     * 1. `get:files` - fetches all files with specified IDs.
     *
     * Triggers events on channel `files`:
     * 1. `saved:all` - after changes to collection are saved.
     */
    var Collection = ModuleObject.extend({
        Collection: Files,

        reply: function() {
            return {
                'get:files'  : this.getFiles,
                'save:all'   : this.saveAll
            };
        },

        /**
         * Fetch files with specific ids
         * @type array ids of files
         * @type object options
         */
        getFiles: function(ids, options) {
            var promises = [];

            _.each(ids, function(id) {
                promises.push(
                    this.getModel(_.extend({id: id}, options))
                );
            }, this);

            return Q.all(promises)
            .then(function() {
                return arguments[0];
            });
        },

        /**
         * Save a file.
         * @type object Backbone model
         * @type object new values
         */
        saveModel: function(model, data) {
            var saveFunc = _.bind(ModuleObject.prototype.saveModel, this);
            data.src = toBlob(data.src);
            model.setEscape(data);

            return saveFunc(model, model.attributes);
        },

        /**
         * Save several files.
         * @type array
         * @type object
         */
        saveAll: function(data, options) {
            var promises = [],
                self     = this,
                files    = [],
                model;

            _.each(data, function(imgData) {
                promises.push(function() {
                    model = new (self.changeDatabase(options)).prototype.model();
                    return self.saveModel(model, imgData)
                    .then(function(file) {
                        files.push(file);
                    });
                });
            });

            return _.reduce(promises, Q.when, new Q())
            .then(function() {
                Radio.trigger('files', 'saved:all');
                return files;
            });
        }

    });

    // Initialize it automaticaly
    Radio.request('init', 'add', 'app:before', function() {
        new Collection();
    });

    return Collection;
});
