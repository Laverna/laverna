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
    'underscore'
], function(Q, _) {
    'use strict';

    var Adapter = {
        promises: {},

        /**
         * Create a new worker and start listening to its events.
         *
         * @return function
         */
        sync: function() {
            _.bindAll(this, 'listenToWorker', 'backboneSync');

            this.worker = new Worker('scripts/workers/localForage.js');

            // Promise which signifies whether the worker is ready
            this.workerPromise = Q.defer();

            // Start listening to WebWorker events
            this.worker.onmessage = this.listenToWorker;

            // A function for Backbone sync
            return this.backboneSync;
        },

        /**
         * Resolve promises after receiving WebWorker messages.
         *
         * @type object data
         */
        listenToWorker: function(data) {
            var msg = data.data;

            switch (msg.msg) {

                // Database webworker is ready
                case 'ready':
                    this.workerPromise.resolve();
                    break;

                // Request was fullfilled
                case 'done':
                    this.promises[msg.promiseId].resolve(msg.data);
                    delete this.promises[msg.promiseId];
                    break;

                // Request failed with errors
                case 'fail':
                    this.promises[msg.promiseId].reject(msg.data);
                    delete this.promises[msg.promiseId];
                    break;

                default:
            }
        },

        /**
         * With this method Backbone.sync will be overriden.
         *
         * @return promise
         */
        backboneSync: function(method, model, options) {

            // First, make sure WebWorker is ready
            return this.workerPromise.promise
            .then(_.bind(function() {

                // Execute the method (read, create, update)
                return this[method](model, options);
            }, this));
        },

        /**
         * Find a model in the database by ID or models in a collection.
         *
         * @type object model
         * @type object options
         */
        read: function(model, options) {

            // If it has an ID, it is a model
            if (model.id) {
                return this.find(model, options);
            }

            return this.findAll(model, options);
        },

        create: function() {
            return this.save.apply(this, arguments);
        },

        update: function() {
            return this.save.apply(this, arguments);
        },

        /**
         * Generate four random hex digits.
         */
        /* jshint ignore:start */
        s4: function() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        },

        /**
         * Generate a pseudo-GUID by concatenating random hexadecimal.
         */
        guid: function() {
            return (this.s4() + this.s4() + "-" + this.s4() + "-" + this.s4() + "-" + this.s4() + "-" + this.s4() + this.s4() + this.s4());
        },
        /* jshint ignore:end */

        /**
         * Save a model.
         *
         * @type object Backbone model
         * @type object options
         */
        save: function(model, options) {

            // Generate an ID if it wasn't provided
            model.id = model.id || this.guid();
            model.set(model.idAttribute, model.id);

            return this._emit('save', {
                id      : model.id,
                data    : model.toJSON(),
                options : {
                    profile     : options.profile || model.profileId,
                    storeName   : model.storeName,
                    encryptKeys : model.encryptKeys
                }
            });
        },

        /**
         * Find a model by ID.
         *
         * @type object Backbone model
         * @type object options
         */
        find: function(model, options) {
            return this._emit('find', {
                id      : model.id,
                options : {
                    profile   : options.profile || model.profileId,
                    storeName : model.storeName
                }
            })
            .then(function(res) {
                model.set(res);
                return model;
            });
        },

        /**
         * Find models in a collection.
         *
         * @type object Backbone collection
         * @type object options
         */
        findAll: function(collection, options) {
            return this._emit('findAll', {
                options: {
                    conditions : options.conditions,
                    storeName  : collection.storeName,
                    profile    : options.profile || collection.profileId
                }
            })
            .then(function(res) {
                if (res && res.length) {
                    collection.add(res);
                }
                return collection;
            });
        },

        /**
         * Send a message to the Webworker.
         *
         * @type string msg
         * @type object data
         */
        _emit: function(msg, data) {

            // Generate a unique ID for the worker's promise
            var promiseId            = this.guid();
            this.promises[promiseId] = Q.defer();

            this.worker.postMessage({
                msg       : msg,
                promiseId : promiseId,
                data      : data
            });

            return this.promises[promiseId].promise;
        }

    };

    return Adapter;
});
