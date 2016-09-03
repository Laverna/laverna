/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define, requirejs, Modernizr */
define([
    'underscore',
    'q',
    'backbone',
    'backbone.radio'
], function(_, Q, Backbone, Radio) {
    'use strict';

    /**
     * Used for checking indexedDB support in a browser.
     */
    var Storage = {

        /**
         * If indexeddb isn't available use sync adapter without workers.
         * @return promise
         */
        check: function() {

            // Browser doesn't support indexeddb at all
            if (!Modernizr.indexeddb || !Radio.request('global', 'use:webworkers')) {
                return this.switchDb('backbone.noworker.sync');
            }

            var self = this;

            return this.testDb()
            .then(function() {
                return self.switchDb('backbone.sync');
            })
            .fail(function() {
                return self.switchDb('backbone.noworker.sync');
            });
        },

        /**
         * Test if indexeddb can be used by opening a database.
         * @return promise
         */
        testDb: function() {
            var defer   = Q.defer(),
                request = window.indexedDB.open('isPrivateMode');

            request.onerror = function() {
                defer.reject();
            };

            request.onsuccess = function() {
                defer.resolve();
            };

            return defer.promise;
        },

        /**
         * Override Backbone.sync with our own adapter.
         * @return promise
         */
        switchDb: function(syncFile) {
            var defer = Q.defer();

            requirejs([syncFile], function(Adapter) {

                // Override Backbone's sync adapter
                Backbone.ajaxSync = Backbone.sync;
                Backbone.sync     = Adapter.sync();

                defer.resolve();
            });

            return defer.promise;
        },

    };

    return Storage;
});
