/**
 * Copyright (C) 2015 Laverna project Authors.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/*global define*/
define([
], function () {
    'use strict';

    var NoteDB = {
        id          : 'notes-db',
        description : 'The database for the Notes',

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
                    store.createIndex('nameIndex', 'name', {unique: true});
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
                    store     = transaction.objectStore('files');
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
            },
            // Configs store
            // -------------
            {
                version: 7,
                migrate: function(transaction, next) {
                    var store = transaction.db.createObjectStore('configs');
                    store     = transaction.objectStore('configs');
                    store.createIndex('name', 'name', {unique: true});
                    next();
                }
            },
            // Tags store
            {
                version: 8,
                migrate: function(transaction, next) {
                    var tagStore      = transaction.objectStore('tags'),
                        notebookStore = transaction.objectStore('notebooks');

                    tagStore.deleteIndex('nameIndex');
                    tagStore.createIndex('nameIndex', 'name', {unique: false});
                    tagStore.createIndex('trashIndex', 'trash', {unique: false});

                    notebookStore.createIndex('trashIndex', 'trash', {unique: false});

                    next();
                }
            },
        ]
    };

    return NoteDB;
});
