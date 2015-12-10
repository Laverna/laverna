/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define */
define([
    'underscore',
    'backbone',
    'dompurify'
], function(_, Backbone, Purify) {
    'use strict';

    /**
     * Files model
     */
    var File = Backbone.Model.extend({
        idAttribute: 'id',

        profileId : 'notes-db',
        storeName : 'files',

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
