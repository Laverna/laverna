/* global define, Modernizr */
define([
    'underscore',
    'jquery',
    'backbone',
    'marionette',
    'IndexedDBShim',
    'localStorage'
], function(_, $, Backbone) {
    'use strict';

    /**
     * Check if browser has web storage support
     */
    var channel = Backbone.Wreqr.radio.channel('global'),
        Storage;

    Storage = Backbone.Marionette.Controller.extend({
        storage: 'indexeddb',

        initialize: function() {
            _.bindAll(this, 'check', 'getName');

            // Response to 'storage' request
            channel.reqres.setHandler('storage', this.getName);
        },

        getName: function() {
            return this.storage;
        },

        /**
         * Tests for web storage support
         * @return promise
         */
        check: function() {
            this.promise = $.Deferred();

            // Test if indexeddb is disabled
            if (Modernizr.indexeddb) {
                this.testIndexedDB();
            }
            // IndexedDB is not available but WebSQL is
            else if (Modernizr.websqldatabase) {
                console.warn('IndexedDB is not available, switched to WebSQL');

                this.storage = 'websql';
                window.shimIndexedDB.__useShim(true);
                this.promise.resolve();
            }
            // Use localstorage if indexeddb is not available
            else if (Modernizr.localstorage) {
                this.useLocalStorage();
            }
            // It doesn't support neither indexeddb nor websql nor localstorage
            else {
                console.error('Browser doesn\'t have web storage support');

                this.storage = null;
                channel.vent.trigger('storage:error');
                this.promise.reject();
            }

            return this.promise;
        },

        /**
         * If Firefox is used in private mode, indexedDB is not available
         */
        testIndexedDB: function() {
            var request = window.indexedDB.open('isPrivateMode'),
                self = this;

            request.onerror = function() {
                self.useLocalStorage();
            };

            request.onsuccess = function() {
                self.promise.resolve();
            };
        },

        /**
         * If Indexeddb is not available, use localstorage
         */
        useLocalStorage: function() {
            console.warn('IndexedDB is not available, switched to localStorage');

            // Rewrite sync method
            Backbone.sync = function(method, model, options) {
                if (model.storeName) {
                    model.localStorage = new Backbone.LocalStorage(
                        'laverna.' + model.storeName
                    );
                    model.store = model.storeName;
                }

                return Backbone.getSyncMethod(model)
                    .apply(this, [method, model, options]);
            };

            this.storage = 'localstorage';
            channel.vent.trigger('storage:local');
            this.promise.resolve();
        }
    });

    return new Storage();
});
