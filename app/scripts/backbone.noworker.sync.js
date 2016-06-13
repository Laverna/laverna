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
    'backbone.sync',
    'helpers/db'
], function(Q, _, Sync, DB) {
    'use strict';

    var Adapter = _.extend({}, Sync, {
        promises: [],

        /**
         * Create a new worker and start listening to its events.
         *
         * @return function
         */
        sync: function() {
            var self = this,
                sync;

            sync = function(method, model, options) {
                return self[method](model, options);
            };

            return sync;
        },

        /**
         * Send a message to the Webworker.
         *
         * @type string msg
         * @type object data
         */
        _emit: function(msg, data) {
            return DB[msg](data);
        }

    });

    return Adapter;
});
