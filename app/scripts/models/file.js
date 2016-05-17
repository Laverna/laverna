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
    'backbone'
], function(_, Backbone) {
    'use strict';

    /**
     * Files model
     */
    var File = Backbone.Model.extend({
        idAttribute: 'id',

        profileId : 'notes-db',
        storeName : 'files',

        defaults: {
            type         : 'files',
            id           : undefined,
            name         : '',
            src          : '',
            fileType     : '',
            trash        : 0,
            created      : 0,
            updated      : 0
        },

        validate: function(attrs) {
            var errors = [];

            if (attrs.src === '') {
                errors.push('src');
            }
            if (attrs.fileType === '') {
                errors.push('fileType');
            }

            if (errors.length > 0) {
                return errors;
            }
        },

        setEscape: function(data) {
            if (data.name) {
                data.name = _.cleanXSS(data.name, true);
            }

            this.set(data);
            return this;
        }

    });

    return File;
});
