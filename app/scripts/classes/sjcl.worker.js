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
    'classes/sjcl',
    'backbone.radio'
], function(_, Q, Sjcl, Radio) {
    'use strict';

    // Use Sjcl without WebWorkers
    if (!Radio.request('global', 'use:webworkers')) {
        return Sjcl;
    }

    function SjclWorker() {
        var self    = this;
        this.worker = new Worker('scripts/workers/sjcl.js');

        // Promise which signifies whether the worker is ready
        this.workerPromise = Q.defer();

        this.worker.onmessage = function(data) {
            var msg = data.data;

            switch (msg.msg) {

                // Webworker is ready
                case 'ready':
                    self.workerPromise.resolve();
                    break;

                // Request was fullfilled
                case 'done':
                    self.promises[msg.promiseId].resolve(msg.data);
                    delete self.promises[msg.promiseId];
                    break;

                // Request failed with errors
                case 'fail':
                    self.promises[msg.promiseId].reject(msg.data);
                    delete self.promises[msg.promiseId];
                    break;

                default:
            }
        };
    }

    _.extend(SjclWorker.prototype, {
        promises: [],

        /**
         * Send a message to the Webworker.
         *
         * @type string msg
         * @type object data
         */
        _emit: function(msg, data) {
            var self = this;

            // Worker is ready
            if (!this.workerPromise.promise.isPending()) {
                return this._send(msg, data);
            }

            return this.workerPromise.promise
            .then(function() {
                return self._send(msg, data);
            });
        },

        _send: function(msg, data) {

            // Generate a unique ID for the worker's promise
            var promiseId = ((1 + Math.random()) * 0x10000);
            this.promises[promiseId] = Q.defer();

            this.worker.postMessage({
                msg       : msg,
                promiseId : promiseId,
                data      : data
            });

            return this.promises[promiseId].promise;
        }
    });

    /**
     * Automatically create "proxy" functions. Copy function names from
     * classes/sjcl.js.
     */
    _.each(_.keys(Sjcl.prototype), function(key) {
        if (_.isFunction(Sjcl.prototype[key])) {
            SjclWorker.prototype[key] = function(data) {
                return this._emit(key, data);
            };
        }
    });

    return SjclWorker;

});
