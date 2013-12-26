/*global define*/
define([
], function () {
    'use strict';

    var NoteDB = {
        id:'notes-db',
        description:'The database for the Notes',
        migrations: [
            {
                version: 1,
                migrate: function (transaction, next) {
                    transaction.db.createObjectStore('notes');
                    next();
                }
            },
            {
                version:2,
                migrate:function (transaction, next) {
                    var store;
                    if (!transaction.db.objectStoreNames.contains('notes')) {
                        store = transaction.db.createObjectStore('notes');
                    }
                    store = transaction.objectStore('notes');
                    store.createIndex('created', 'created', {
                        unique:false
                    });
                    store.createIndex('isFavorite', 'isFavorite', {
                        unique:false
                    });
                    store.createIndex('trash', 'trash', {
                        unique:false
                    });
                    store.createIndex('notebookId', 'notebookId', {
                        unique:false
                    });
                    next();
                },
            }
        ]
    };

    return NoteDB;
});
