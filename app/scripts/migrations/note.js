/*global define*/
define([
], function () {
    'use strict';

    var NoteDB = {
        id: 'notes-db',
        description: 'The database for the Notes',

        getDB: function (dbName) {
            this.id = dbName ? dbName : 'notes-db';
            return this;
        },

        migrations: [
            {
                version: 1,
                migrate: function (transaction, next) {
                    transaction.db.createObjectStore('notes');
                    transaction.db.createObjectStore('notebooks');
                    transaction.db.createObjectStore('tags');
                    next();
                }
            },
            // Notes store
            // ----------------
            {
                version: 2,
                migrate: function(transaction, next) {
                    var store = transaction.objectStore('notes');
                    store.createIndex('createdIndex', 'created', { unique: false});
                    store.createIndex('favoriteIndex', 'isFavorite', { unique: false});
                    store.createIndex('trashIndex', 'trash', { unique: false});
                    store.createIndex('notebookIndex', 'notebookId', { unique: false});
                    store.createIndex('synchronizedIndex', 'synchronized', { unique: false});
                    next();
                }
            },
            // Notebooks store
            // ----------------
            {
                version: 3,
                migrate: function(transaction, next) {
                    var store = transaction.objectStore('notebooks');
                    store.createIndex('parentIndex', 'parentId', { unique: false});
                    store.createIndex('synchronizedIndex', 'synchronized', { unique: false});
                    next();
                }
            },
            // Tags store
            // ----------------
            {
                version: 4,
                migrate: function(transaction, next) {
                    var store = transaction.objectStore('tags');
                    store.createIndex('nameIndex', 'name', { unique: true});
                    store.createIndex('synchronizedIndex', 'synchronized', { unique: false});
                    next();
                }
            },
            // Files store
            // ----------------
            {
                version: 5,
                migrate: function(transaction, next) {
                    var store = transaction.db.createObjectStore('files');
                    store = transaction.objectStore('files');
                    store.createIndex('synchronizedIndex', 'synchronized', { unique: false});
                    next();
                }
            },
            // Store for removed objects
            // ----------------
            {
                version: 6,
                migrate: function(transaction, next) {
                    var store = transaction.db.createObjectStore('removed');
                    if (store) {
                        next();
                    }
                }
            }
        ]
    };

    return NoteDB;
});
