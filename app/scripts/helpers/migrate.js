/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define, Modernizr */
define([
    'q',
    'underscore',
    'localforage',
    'sjcl'
], function(Q, _, localForage, sjcl) {
    'use strict';

    /**
     * Migrate data from IndexedDB to localForage.
     */
    function Migrate() {
    }

    _.extend(Migrate.prototype, {

        /**
         * Initialize migration proccess.
         *
         * @return promise
         */
        init: function() {
            if (!Modernizr.indexeddb) {
                return new Q();
            }

            var defer = Q.defer(),
                self = this;

            self.start()
            .then(function() {
                setTimeout(function() {
                    return defer.resolve();
                }, 100);
            });

            return defer.promise;
        },

        /**
         * Start migration.
         *
         * @return promise
         */
        start: function() {
            var self = this;

            return this.openDb('notes-db')
            .then(function(db) {
                if (_.isNull(db)) {
                    console.log('no migration is needed');
                    return;
                }

                self.db = db;
                return self.migrate(db);
            })
            .fail(function(e) {
                console.error('Migration:initialize', e);
            });
        },

        /**
         * Open an indexedDB database.
         *
         * @type string name
         * @return promise
         */
        openDb: function(name) {
            var req   = window.indexedDB.open(name),
                defer = Q.defer();

            req.onerror = function(e) {
                console.error('Migration:openDb', e);
                defer.reject(e);
            };

            // If DB is empty, resolve with null
            req.onupgradeneeded = function() {
                if (req.result) {
                    req.result.close();
                }

                defer.resolve(null);
            };

            req.onsuccess = function(e) {
                defer.resolve(e.target.result);
            };

            return defer.promise;
        },

        /**
         * Migrate data from all stores to localForage.
         *
         * @type object db
         * @return promise
         */
        migrate: function(db) {
            var stores   = ['notes', 'notebooks', 'tags', 'files'],
                self     = this,
                promises = [];

            _.each(stores, function(store) {
                promises.push(function() {
                    var tr;
                    try {
                        tr = db.transaction([store]);
                    } catch (e) {
                        return;
                    }

                    return self.getData(tr, store)
                    .then(function(data) {
                        return self.migrateStore(store, data);
                    });
                });
            });

            return _.reduce(promises, Q.when, new Q())
            .then(function() {
                db.close();
                return;
            })
            .fail(function(e) {
                console.error('Migration:migrate', e);
            });
        },

        /**
         * Call it after fetching data. It saves data to localForage.
         *
         * @type string store
         * @type object data
         * @return promise
         */
        migrateStore: function(store, data) {
            var self     = this,
                promises = [],
                db       = localForage.createInstance({
                    name      : 'notes-db',
                    storeName : store
                });

            _.each(data, function(item) {
                promises.push(function() {
                    return self.removeItem(store, db, item.id)
                    .then(function() {
                        return self.saveForageItem(store, db, item);
                    });
                });
            });

            return _.reduce(promises, Q.when, new Q())
            .then(function() {
                return;
            })
            .fail(function(e) {
                console.error('Migration:migrateStore', e);
            });
        },

        /**
         * Save an item to localForage.
         *
         * @type string storeName
         * @type object db
         * @type string id
         * @type object data
         * @return promise
         */
        saveForageItem: function(storeName, db, data) {
            var defer  = Q.defer();

            // Convert data
            if (!_.isUndefined(data.notebookId)) {
                data.notebookId = data.notebookId.toString();
            }
            if (!_.isUndefined(data.parentId)) {
                data.parentId = data.parentId.toString();
            }
            if (storeName === 'files') {
                data.fileType = data.type;
                data.type     = 'files';
            }
            if (storeName === 'tags') {
                data.id = sjcl.hash.sha256.hash(data.name.toString()).join('');
            }

            data = _.extend(
                {
                    type    : storeName,
                    created : Date.now(),
                    updated : Date.now(),
                    trash   : 0
                },
                data,
                {
                    id: data.id.toString()
                }
            );

            db.setItem(data.id, data, function(err, val) {
                if (err) {
                    return defer.reject(err);
                }

                return defer.resolve(val);
            });

            return defer.promise;
        },

        /**
         * Remove an item from IndexedDB.
         *
         * @type string storeName
         * @type number id
         */
        removeItem: function(storeName, db, id) {
            if (storeName === 'tags') {
                return this.putToTrash.apply(this, arguments);
            }

            if (storeName !== 'notebooks' || typeof id === 'string') {
                return new Q();
            }

            var defer = Q.defer(),
                req   = this.db.transaction([storeName], 'readwrite').objectStore(storeName).delete(id);

            req.onsuccess = function() {
                defer.resolve();
            };

            req.onerror = function(e) {
                defer.reject(e);
            };

            return defer.promise;
        },

        putToTrash: function(storeName, db, id) {
            var defer = Q.defer(),
                data  = {id: id, type: 'tags', name: id, trash: 2, created: 0, updated: 0};

            db.setItem(data.id, data, function(err, val) {
                if (err) {
                    return defer.reject(err);
                }

                return defer.resolve(val);
            });

            return defer.promise;
        },

        /**
         * Fetch data from indexedDB.
         *
         * @type object transaction
         * @type string storeName
         * @return promise
         */
        getData: function(transaction, storeName) {
            var defer = Q.defer(),
                req   = transaction.objectStore(storeName).openCursor(),
                data  = {};

            req.onerror = function(e) {
                console.error('Migration:getData', e);
                defer.reject(e);
            };

            req.onsuccess = function(e) {
                var cursor = e.target.result;

                if (cursor) {
                    data[cursor.key] = cursor.value;
                    cursor.continue();
                }
                else {
                    return defer.resolve(data);
                }
            };

            return defer.promise;
        },

    });

    return Migrate;

});
