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
            }
        ]
    };

    return NoteDB;
});
