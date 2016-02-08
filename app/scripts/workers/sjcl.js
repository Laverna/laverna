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
        q          : '../bower_components/q/q',
        underscore : '../bower_components/underscore/underscore',
        sjcl       : '../bower_components/sjcl/sjcl'
    },

    shim: {
        sjcl: {
            exports: 'sjcl'
        }
    }
});

requirejs([
    'q',
    'classes/sjcl'
], function(Q, Sjcl) {
    var sjcl = new Sjcl();

    // Listen to the Webworker messages
    self.onmessage = function(data) {
        var msg = data.data;

        if (sjcl[msg.msg]) {
            return new Q(
                sjcl[msg.msg](msg.data)
            )
            .then(function(res) {
                self.postMessage({
                    msg       : 'done',
                    promiseId : msg.promiseId,
                    data      : res
                });
            });
        }

        console.error('sjcl worker:', 'Method doesn\'t exist', msg.msg);
    };

    // Post a message that the worker is ready to listen to events
    self.postMessage({msg: 'ready'});
});
