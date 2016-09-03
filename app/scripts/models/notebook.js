/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/*global define*/
define([
    'underscore',
    'backbone'
], function(_, Backbone) {
    'use strict';

    var Model = Backbone.Model.extend({
        idAttribute: 'id',

        profileId : 'notes-db',
        storeName : 'notebooks',

        defaults: {
            'type'         : 'notebooks',
            'id'           : undefined,
            'parentId'     : '0',
            'name'         : '',
            'count'        : 0,
            'trash'        : 0,
            'created'      : 0,
            'updated'      : 0
        },

        encryptKeys: ['name'],

        validate: function(attrs) {
            // It's not neccessary to validate when a model is about to be removed
            if (attrs.trash && Number(attrs.trash) === 2) {
                return;
            }

            var errors = [];
            if (attrs.name === '') {
                errors.push('name');
            }
            if (attrs.parentId === attrs.id) {
                errors.push('parentId');
            }
            if (errors.length > 0) {
                return errors;
            }
        },

        initialize: function() {
            if (typeof this.id === 'number') {
                this.set('id', this.id.toString());
                this.set('parentId', this.get('parentId').toString());
            }
        },

        setEscape: function(data) {
            if (data.name) {
                data.name = _.cleanXSS(data.name, true);
            }

            this.set(data);
            return this;
        },

    });

    return Model;
});
