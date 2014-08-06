/* global define */
define([
    'underscore',
    'backbone',
    'migrations/note',
    'collections/removed'
], function (_, Backbone, FilesDB, Removed) {
    'use strict';

    /**
     * Files model
     */
    var File = Backbone.Model.extend({
        idAttribute: 'id',

        database : FilesDB,
        storeName: 'files',

        defaults: {
            id           : undefined,
            src          : '',
            type         : '',
            updated      : Date.now(),
            synchronized : 0
        },

        validate: function (attrs) {
            var errors = [];
            if (attrs.src === '') {
                errors.push('src');
            }
            if (attrs.type === '') {
                errors.push('type');
            }
            if (errors.length > 0) {
                return errors;
            }
        },

        updateDate: function () {
            this.set('updated', Date.now());
            this.set('synchronized', 0);
        },

        /**
         * Saves model's id for sync purposes, then destroys it
         */
        destroySync: function () {
            return new Removed().newObject(this, arguments);
        }

    });

    return File;
});
