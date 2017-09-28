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
    'q'
], function(_, Q) {
    'use strict';

    var Adapter = {

        init: function(client, profile) {
            this.client  = client;
            this.profile = profile;
        },

        /**
         * Save a model to Dropbox.
         *
         * @type string type [notes|notebooks|tags]
         * @type object model
         * @type array encryptKeys
         */
        save: function(type, model, encryptKeys) {
            if (!model.id) {
                return new Q();
            }

            if (model.encryptedData) {
                model = _.omit(model, encryptKeys);
            }

            var path = '/' + this.profile + '/' + type + '/' + model.id + '.json';

            return this.client.filesUpload({
                path: path,
                autorename: false,
                mode: {'.tag': 'overwrite'},
                contents: JSON.stringify(model),
            });
        },

        /**
         * Get all models from Dropbox.
         *
         * @type string type [notes|notebooks|tags]
         */
        getAll: function(type) {
            var self = this;

            return this.readdir(type)
            .then(function(resp) {
                var promises = [];

                _.each(resp.entries, function(file) {
                    if (file.name.search('.json') !== -1) {
                        promises.push(self.getFile(type, file.path_lower));
                    }
                });

                return Q.all(promises);
            });
        },

        /**
         * Get a JSON object by ID from Dropbox.
         *
         * @type string type [notes|notebooks|tags]
         * @type string path
         */
        getFile: function(type, path) {
            return this.client.filesDownload({path: path})
            .then(function(resp) {
                var defer = Q.defer();
                var reader = new FileReader();

                reader.addEventListener('loadend', function() {
                    defer.resolve(JSON.parse(reader.result));
                });
                reader.readAsText(resp.fileBlob);

                return defer.promise;
            });
        },

        /**
         * Get a folder stat from Dropbox.
         *
         * @type string type [notes|notebooks|tags]
         * @type object options
         */
        readdir: function(type, options) {
            return this.client.filesListFolder({
                path            : '/' + this.profile + '/' + type,
                include_deleted : false,
            })
            .catch(function(err) {
                if (err.status === 409) {
                    return [];
                }

                return Promise.reject(err);
            });
        },

    };

    return Adapter;
});
