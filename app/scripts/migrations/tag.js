/*global define*/
define([
    'indexedDB'
], function () {
    'use strict';

    var NotebooksDB = {
        id : 'tags-db',
        description: 'The database for Tags',
        migrations : [
            {
                version: 1,
                migrate: function (transaction, next) {
                    transaction.db.createObjectStore('tags');
                    next();
                }
            },
            {
                version:2,
                migrate:function (transaction, next) {
                    var store;
                    if ( !transaction.db.objectStoreNames.contains('tags')) {
                        store = transaction.db.createObjectStore('tags');
                    }
                    store = transaction.objectStore('tags');
                    store.createIndex('createIndex', 'created', {
                        unique : false
                    });
                    next();
                }
            }
        ]
    };

    return NotebooksDB;
});
