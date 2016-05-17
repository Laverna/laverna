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

    /**
     * Notes model
     */
    var Model = Backbone.Model.extend({

        idAttribute: 'id',

        profileId : 'notes-db',
        storeName : 'notes',

        defaults: {
            'type'          : 'notes',
            'id'            :  undefined,
            'title'         :  '',
            'content'       :  '',
            'taskAll'       :  0,
            'taskCompleted' :  0,
            'created'       :  0,
            'updated'       :  0,
            'notebookId'    :  '0',
            'tags'          :  [],
            'isFavorite'    :  0,
            'trash'         :  0,
            'files'         :  []
        },

        encryptKeys: [
            'title',
            'content',
            'tags',
            'tasks'
        ],

        validate: function(attrs) {
            // It's not neccessary to validate when a model is about to be removed
            if (attrs.trash && Number(attrs.trash) === 2) {
                return;
            }

            var errors = [];
            if (!_.isUndefined(attrs.title) && !attrs.title.trim().length) {
                errors.push('title');
            }

            if (errors.length > 0) {
                return errors;
            }
        },

        toggleFavorite: function() {
            return {isFavorite: (this.get('isFavorite') === 1) ? 0 : 1};
        },

        /**
         * Purify user inputs
         */
        setEscape: function(data) {

            if (data.title) {
                data.title = _.cleanXSS(data.title, true);
            }
            if (data.content) {
                data.content = _.cleanXSS(data.content, true);
            }

            this.set(data);
            return this;
        }

    });

    return Model;
});
