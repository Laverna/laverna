/*global define*/
define([
    'underscore',
    'indexedDB'
], function () {
    'use strict';

    var NoteDB = {
        id : 'notes-db',
        description: 'The database for Notes',
        migrations : [
            {
                version: 1,
                migrate: function (transaction, next) {
                    transaction.db.createObjectStore('notes');
                    next();
                }
            },
            {
                version: 2,
                migrate: function (transaction, next) {
                    var store;
                    if ( !transaction.db.objectStoreNames.contains('notes')) {
                        store = transaction.db.createObjectStore('notes');
                    }
                    store = transaction.objectStore('notes');
                    store.createIndex('isFavorite', 'isFavorite', {
                        unique: false
                    });
                    next();
                }
            },
            {
                version: 3,
                migrate: function (transaction, next) {
                    var store;
                    if ( !transaction.db.objectStoreNames.contains('notes')) {
                        store = transaction.db.createObjectStore('notes');
                    }
                    store = transaction.objectStore('notes');
                    store.createIndex('trashIndex', 'trash', {
                        unique: false
                    });
                    next();
                }
            }
        ]
    };

    return NoteDB;
});
