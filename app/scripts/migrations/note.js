/*global define*/
define([
    'underscore',
    'backbone',
    'localStorage',
    'indexedDB'
], function (_, Backbone) {
    'use strict';

    var NoteDB = {
        id:'notes-db',
        description:'The database for the Notes',
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
            }
        ]
    };

    // IndexedDB and WebSQL blocked or user in private browsing mode
    if (window.appNoDB === true && _.isUndefined(window.shimIndexedDB)) {
        // Use LocalStorage instead of IndexedDB
        Backbone.sync = function(method, model, options) {
            if (model.storeName) {
                model.localStorage = new Backbone.LocalStorage('laverna.' + model.storeName);
                model.store = model.storeName;
            }

            return Backbone.getSyncMethod(model).apply(this, [method, model, options]);
        };

        // Make Backbone.IndexedDB ignore this model/collection
        return undefined;
    }

    return NoteDB;
});
