/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/*global define*/
define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {
    'use strict';

    /**
     * Tags model
     */
    var Tag = Backbone.Model.extend({
        idAttribute: 'id',

        profileId : 'notes-db',
        storeName : 'tags',

        defaults: {
            'type'         : 'tags',
            'id'           : undefined,
            'name'         : '',
            'count'        : '',
            'trash'        : 0,
            'created'      : 0,
            'updated'      : 0
        },

        encryptKeys: ['name'],

        setEscape: function(data) {
            if (data.name) {
                data.name = _.cleanXSS(data.name, true);
            }

            this.set(data);
            return this;
        },

        /**
         * Validates a tag.
         * @type array
         */
        validate: function(attrs) {
            // It's not neccessary to validate when a model is about to be removed
            if (attrs.trash && Number(attrs.trash) === 2) {
                return;
            }

            var errors = [];
            if (!_.isUndefined(attrs.name) && !attrs.name.trim().length) {
                errors.push('name');
            }

            if (errors.length > 0) {
                return errors;
            }
        },

    });

    return Tag;
});
