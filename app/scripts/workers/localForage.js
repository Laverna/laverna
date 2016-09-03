/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global requirejs, importScripts, self */
'use strict';
importScripts('../../bower_components/requirejs/require.js');

requirejs.config({
    baseUrl: '../',
    paths: {
        q           : '../bower_components/q/q',
        underscore  : '../bower_components/underscore/underscore',
        localforage : '../bower_components/localforage/dist/localforage',
    }
});

requirejs([
    'helpers/db'
], function(db) {

    // Listen to the webworker messages
    self.onmessage = function(data) {
        var msg = data.data;

        if (db[msg.msg]) {
            return db[msg.msg](msg.data)
            .then(function(result) {
                self.postMessage({
                    msg       : 'done',
                    promiseId : msg.promiseId,
                    data      : result
                });
            })
            .fail(function(e) {
                self.postMessage({
                    msg       : 'fail',
                    promiseId : msg.promiseId,
                    data      : e
                });
            });
        }

        console.error('localForage module:', 'Method doesn\'t exist', msg.msg);
    };

    // Post a message that the worker is ready
    self.postMessage({msg: 'ready'});
});
