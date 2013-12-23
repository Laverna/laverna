/*global define*/
define([
    'indexedDB'
], function () {
    'use strict';

    var NotebooksDB = {
        id : 'notebooks-db',
        description: 'The database for Notebooks',
        migrations : [
            {
                version: 1,
                migrate: function (transaction, next) {
                    transaction.db.createObjectStore('notebooks');
                    next();
                }
            },
            {
                version:2,
                migrate:function (transaction, next) {
                    var store;
                    if ( !transaction.db.objectStoreNames.contains('notebooks')) {
                        store = transaction.db.createObjectStore('notebooks');
                    }
                    store = transaction.objectStore('notebooks');
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
