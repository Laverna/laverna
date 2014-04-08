/* global define */
define([
    'underscore',
    'backbone',
    'migrations/note'
], function (_, Backbone, FilesDB) {
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
        }
    });

    return File;
});
