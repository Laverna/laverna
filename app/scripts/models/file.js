/* global define */
define([
    'underscore',
    'backbone',
    'migrations/note',
    'dompurify'
], function(_, Backbone, DB, Purify) {
    'use strict';

    /**
     * Files model
     */
    var File = Backbone.Model.extend({
        idAttribute: 'id',

        database : DB,
        storeName: 'files',

        defaults: {
            id           : undefined,
            name         : '',
            src          : '',
            type         : '',
            updated      : Date.now(),
            synchronized : 0
        },

        validate: function(attrs) {
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

        updateDate: function() {
            this.set('updated', Date.now());
            this.set('synchronized', 0);
        },

        setEscape: function(data) {
            if (data.name) {
                data.name = Purify.sanitize(data.name);
            }

            this.set(data);
            return this;
        }

    });

    return File;
});
