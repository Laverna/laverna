/*global define*/
define([
    'backbone',
    'migrations/note'
], function (Backbone, NotesDB) {
    'use strict';

    /**
     * Model stores id of removed objects
     */
    var Removed = Backbone.Model.extend({

        database: NotesDB,
        storeName: 'removed',

        defaults: {
            id: undefined
        }

    });

    return Removed;
});
