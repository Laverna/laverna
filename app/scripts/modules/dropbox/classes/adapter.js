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
         */
        save: function(type, model) {
            if (!model.id) {
                return new Q();
            }

            var defer = Q.defer();

            this.client.writeFile(
                this.profile + '/' + type + '/' + model.id + '.json',
                JSON.stringify(model),
                function(err, stat) {
                    if (err) {
                        return defer.reject(err);
                    }

                    console.log('stat', stat);
                    defer.resolve(model);
                }
            );

            return defer.promise;
        },

        /**
         * Get all models from Dropbox.
         *
         * @type string type [notes|notebooks|tags]
         */
        getAll: function(type) {
            var hash = this.getHash(type) || null,
                self = this;

            return this.readdir(type, {hash: hash})
            .spread(function(data, entr) {
                if (!entr || !entr.length) {
                    data = data || [];
                    return data.contents || data;
                }

                var promises = [];

                _.each(entr, function(fileName) {
                    if (fileName.search('.json') !== -1) {
                        promises.push(self.getById(type, fileName));
                    }
                });

                return Q.all(promises);
            });
        },

        /**
         * Get a JSON object by ID from Dropbox.
         *
         * @type string type [notes|notebooks|tags]
         * @type string fileName
         */
        getById: function(type, fileName) {
            var defer = Q.defer();

            // Add a file extension
            if (fileName.search('.json') === -1) {
                fileName += '.json';
            }

            fileName = this.profile + '/' + type + '/' + fileName;

            this.client.readFile(fileName, function(err, data) {
                if (err) {
                    return defer.reject(err);
                }

                defer.resolve(JSON.parse(data));
            });

            return defer.promise;
        },

        /**
         * Get a folder stat from Dropbox.
         *
         * @type string type [notes|notebooks|tags]
         * @type object options
         */
        readdir: function(type, options) {
            var defer = Q.defer(),
                self  = this;
            options   = options || {};

            this.client.readdir(this.profile + '/' + type, options, function(err, entr, fileStat) {
                if (err) {
                    /*
                     * If a folder doesn't exist, probably synchronizing is done
                     * for the first time
                     */
                    if (err.status === 404) {
                        return defer.resolve([]);
                    }
                    else if (err.status === 304) {
                        return defer.resolve([self.getCache(type)]);
                    }

                    console.error('Dropbox error', err);
                    return defer.reject(err);
                }

                var data = fileStat.json();
                defer.resolve([data, entr]);
            });

            return defer.promise;
        },

        /**
         * Update folder hash.
         *
         * @type string type [notes|notebooks|tags]
         */
        updateHash: function(type) {
            return this.readdir(type)
            .spread(function(data) {
                if (!data) {
                    return;
                }
                return localStorage.setItem(
                    'dropbox.hash.' + Adapter.profile + '.' + type,
                    data.hash
                );
            });
        },

        /**
         * Get folder hash.
         *
         * @type string type [notes|notebooks|tags]
         */
        getHash: function(type) {
            return localStorage.getItem(
                'dropbox.hash.' + this.profile + '.' + type
            );
        },

        /**
         * Get an array of objects which exist on Dropbox.
         *
         * @type string type [notes|notebooks|tags]
         */
        getCache: function(type) {
            var data = localStorage.getItem('dropbox.cache.' + this.profile + '/' + type);
            return JSON.parse(data);
        },

        /**
         * Save an array of objects which exist on Dropbox.
         *
         * @type string type [notes|notebooks|tags]
         */
        saveCache: function(type, data) {
            data = _.map(data, function(item) {
                return {id: item.id, updated: item.updated};
            });

            return localStorage.setItem(
                'dropbox.cache.' + this.profile + '/' + type,
                JSON.stringify(data)
            );
        }

    };

    return Adapter;
});
