/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define, requireNode */
define([
    'underscore',
    'q',
    'backbone.radio'
], function(_, Q, Radio) {
    'use strict';

    // A hack to trick Nodejs modules not to register as RequireJS modules
    var def    = _.clone(define.amd);
    define.amd = false;

    var glob     = requireNode(window.nodeDir + 'glob'),
        fs       = requireNode(window.nodeDir + 'graceful-fs'),
        chokidar = requireNode(window.nodeDir + 'chokidar'),
        Adapter;

    define.amd = _.clone(def);
    def        = undefined;

    Adapter = {

        /**
         * Since module isn't ready yet, sync to /tmp folder (for now)
         * (/tmp/laverna folder must exist)
         */
        path: '/tmp/laverna/',

        /**
         * Check if directories exist. If they don't, create them.
         */
        checkDirs: function() {
            if (!this.isDirSync(this.path)) {
                fs.mkdirSync(this.path);
            }

            _.each(['notes', 'notebooks', 'tags', 'files'], function(dir) {
                if (!this.isDirSync(this.path + dir)) {
                    fs.mkdirSync(this.path + dir);
                }
            }, this);
        },

        /**
         * Check if a dir exists.
         */
        isDirSync: function(path) {
            try {
                return fs.statSync(path).isDirectory();
            } catch (e) {
                if (e.code === 'ENOENT') {
                    return false;
                }
                else {
                    throw e;
                }
            }
        },

        /**
         * Overwrite a file with data.
         */
        _write: function(name, data) {
            var defer = Q.defer();

            fs.writeFile(this.path + name, data, function(err) {
                if (err) {
                    return defer.reject(err);
                }

                defer.resolve();
            });

            return defer.promise;
        },

        /**
         * Read a file.
         *
         * @type string name
         */
        _read: function(name) {
            var defer = Q.defer();

            fs.readFile(name, 'utf8', function(err, data) {
                if (err) {
                    return defer.reject(err);
                }

                defer.resolve(data);
            });

            return defer.promise;
        },

        /**
         * Save model data to the FS.
         */
        writeFile: function(module, model) {
            var name     = module + '/' + model.id,
                data     = JSON.stringify(_.omit(model, 'content')),
                promises = [
                    this._write(name + '.json', data)
                ];

            // Save content into a separate Markdown file
            if (model.content) {
                promises.push(
                    this._write(name + '.md', model.content)
                );
            }

            // Save all files
            return Q.all(promises);
        },

        /**
         * Watch for changes.
         */
        startWatch: function() {
            var watcher = chokidar.watch(Adapter.path, {
                persistent: true
            });

            watcher.on('change', function(file) {
                Adapter._read(file)
                .then(function(data) {

                    var obj = Adapter.getFileInfo(file);

                    // The file has Markdown extension
                    if (obj.ext === 'md') {
                        data = {content: data, id: obj.id};
                    }
                    else if (obj.ext === 'json') {
                        data = JSON.parse(data);
                    }

                    // Trigger an event
                    Radio.trigger('fs', 'change', {
                        storeName : obj.storeName,
                        data      : data
                    });
                });
            });
        },

        /**
         * Get the content of all files.
         */
        getList: function(type) {
            var defer = Q.defer(),
                dir   = Adapter.path + (type ? type + '/' : '') + '*.*';

            // First, read get the list of all files in a folder
            glob(dir, {}, function(err, files) {
                Adapter.getFiles(files)
                .then(function(data) {
                    defer.resolve(type ? data[type] : data);
                });
            });

            return defer.promise;
        },

        /**
         * Read the content of each file in a list
         *
         * @type array files
         */
        getFiles: function(files) {
            var promises = [];

            _.each(files, function(file) {

                // Add the path to a place where the file is located
                if (file.search(Adapter.path) === -1) {
                    file = Adapter.path + file;
                }

                // Read the file
                promises.push(Adapter._read(file));
            });

            return Q.all(promises)
            .then(function(data) {
                return _.object(files, data);
            })
            .then(function(data) {
                return Adapter.filesToObject(data);
            });
        },

        /**
         * Get extension, type, and ID from file name.
         */
        getFileInfo: function(fileName) {
            var key  = fileName.split('/');

            // Get a model ID
            fileName  = _.last(key).split('.');

            return {
                ext      : fileName[1],

                // Get store name (notes|notebooks|tags)
                storeName: key[key.length - 2],
                id       : fileName[0]
            };
        },

        /**
         * Convert data to model structure.
         */
        filesToObject: function(data) {
            var obj = {};

            _.each(data, function(value, key) {
                key = Adapter.getFileInfo(key);

                // Separate models by their store names
                obj[key.storeName]     = obj[key.storeName] || {};
                obj[key.storeName][key.id] = obj[key.storeName][key.id] || {};

                // The file has Markdown extension
                if (key.ext === 'md') {
                    obj[key.storeName][key.id].content = value;
                }
                else if (key.ext === 'json') {
                    obj[key.storeName][key.id] = _.extend(
                        obj[key.storeName][key.id], JSON.parse(value)
                    );
                }
            });

            return obj;
        },
    };

    return Adapter;

});
