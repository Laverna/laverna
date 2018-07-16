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
    'backbone.radio',
], (_, Q, Radio) => {
    'use strict';

    // A hack to trick Nodejs modules not to register as RequireJS modules
    let def    = _.clone(define.amd);
    define.amd = false;

    const glob     = requireNode(`${window.nodeDir}glob`);
    const fs       = requireNode(`${window.nodeDir}graceful-fs`);
    const chokidar = requireNode(`${window.nodeDir}chokidar`);


    define.amd = _.clone(def);
    def        = undefined;

    const Adapter = {

        /**
         * Since module isn't ready yet, sync to /tmp folder (for now)
         * (/tmp/laverna folder must exist)
         */
        path: '/tmp/laverna/',

        /**
         * Check if directories exist. If they don't, create them.
         */
        checkDirs() {
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
        isDirSync(path) {
            try {
                return fs.statSync(path).isDirectory();
            }
            catch (e) {
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
        _write(name, data) {
            const defer = Q.defer();

            fs.writeFile(this.path + name, data, err => {
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
        _read(name) {
            const defer = Q.defer();

            fs.readFile(name, 'utf8', (err, data) => {
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
        writeFile(module, model) {
            const name     = `${module}/${model.id}`;
            const data     = JSON.stringify(_.omit(model, 'content'));
            const promises = [
                this._write(`${name}.json`, data),
            ];

            // Save content into a separate Markdown file
            if (model.content) {
                promises.push(
                    this._write(`${name}.md`, model.content)
                );
            }

            // Save all files
            return Q.all(promises);
        },

        /**
         * Watch for changes.
         */
        startWatch() {
            const watcher = chokidar.watch(Adapter.path, {
                persistent: true,
            });

            watcher.on('change', file => {
                Adapter._read(file)
                .then(data => {

                    const obj = Adapter.getFileInfo(file);
                    let mddata;
                    // The file has Markdown extension
                    if (obj.ext === 'md') {
                        mddata = {content: data, id: obj.id};
                    }
                    else if (obj.ext === 'json') {
                        mddata = JSON.parse(data);
                    }

                    // Trigger an event
                    Radio.trigger('fs', 'change', {
                        storeName : obj.storeName,
                        mddata,
                    });
                });
            });
        },

        /**
         * Get the content of all files.
         */
        getList(type) {
            const defer = Q.defer();
            const dir   = `${Adapter.path + (type ? `${type}/` : '')}*.*`;

            // First, read get the list of all files in a folder
            glob(dir, {}, (err, files) => {
                Adapter.getFiles(files)
                .then(data => {
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
        getFiles(files) {
            const promises = [];

            _.each(files, file => {
                let filepath;
                // Add the path to a place where the file is located
                if (file.search(Adapter.path) === -1) {
                    filepath = Adapter.path + file;
                }

                // Read the file
                promises.push(Adapter._read(filepath));
            });

            return Q.all(promises)
            .then(data => {
                return _.object(files, data);
            })
            .then(data => {
                return Adapter.filesToObject(data);
            });
        },

        /**
         * Get extension, type, and ID from file name.
         */
        getFileInfo(fileName) {
            const key  = fileName.split('/');

            // Get a model ID
            const modelId  = _.last(key).split('.');

            return {
                ext      : modelId[1],

                // Get store name (notes|notebooks|tags)
                storeName: key[key.length - 2],
                id       : modelId[0],
            };
        },

        /**
         * Convert data to model structure.
         */
        filesToObject(data) {
            const obj = {};

            _.each(data, (value, key) => {
                const objKey = Adapter.getFileInfo(key);

                // Separate models by their store names
                obj[objKey.storeName]     = obj[objKey.storeName] || {};
                obj[objKey.storeName][objKey.id] = obj[objKey.storeName][objKey.id] || {};

                // The file has Markdown extension
                if (objKey.ext === 'md') {
                    obj[objKey.storeName][objKey.id].content = value;
                }
                else if (objKey.ext === 'json') {
                    obj[objKey.storeName][objKey.id] = _.extend(
                        obj[objKey.storeName][objKey.id], JSON.parse(value)
                    );
                }
            });

            return obj;
        },
    };

    return Adapter;

});
