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
    'backbone',
    'backbone.radio',
    'collections/pageable',
    'models/note',
    'fuse',
], function(_, Backbone, Radio, PageableCollection, Note, Fuse) {
    'use strict';

    var Notes = PageableCollection.extend({
        model: Note,

        profileId : 'notes-db',
        storeName : 'notes',

        state: {
            pageSize     : 10,
            firstPage    : 0,
            currentPage  : 0,
            totalRecords : 0,
            comparator   : {'created' : 'desc', 'isFavorite' : 'desc'}
        },

        conditions: {
            active   : {trash      : 0},
            favorite : {isFavorite : 1, trash : 0},
            trashed  : {trash      : 1},
            notebook : function(args) {
                return {notebookId: args.query, trash: 0};
            }
        },

        initialize: function() {
        },

        comparator: function(model) {
            return -model.get('created');
        },

        filterList: function(filter, options) {
            filter = filter || 'active';
            var cond = this.conditions[filter],
                res;

            if (cond) {
                cond = (typeof cond === 'function' ? cond(options) : cond);
                res = this.where(cond);
            }
            else if (this[filter + 'Filter']) {
                res = this[filter + 'Filter'](options.query);
            }
            else {
                return;
            }

            return this.reset(res);
        },

        /**
         * Show notes with unfinished tasks
         */
        taskFilter: function () {
            return this.filter(function (note) {
                return note.get('taskCompleted') < note.get('taskAll');
            });
        },

        /**
         * Show only tag's notes
         * Returns notes to which a specified tag was attached.
         */
        tagFilter: function(tagName) {
            return this.filter(function(note) {
                if (note.get('tags').length > 0) {
                    return (
                        (_.indexOf(note.get('tags'), tagName) !== -1) &&
                        note.get('trash') === 0
                    );
                }
            });
        },

        /**
         * Filter: only unencrypted, JSON data probably encrypted data
         */
        getUnEncrypted: function() {
            return this.filter(function(note) {
                try {
                    JSON.parse(note.get('title'));
                    return false;
                } catch (e) {
                    return true;
                }
            });
        },

        /**
         * Search
         */
        searchFilter: function(letters) {
            if (letters === '') {
                return this;
            }

            var pattern = new RegExp(letters, 'gim');

            return this.filter(function(model) {
                Radio.request('encrypt', 'decrypt:model', model);
                pattern.lastIndex = 0;
                return pattern.test(model.get('title')) || pattern.test(model.get('content'));
            });
        },

        fuzzySearch: function(text) {
            var fuse = new Fuse(this.fullCollection.models, {
                keys  : ['title'],
                getFn : function(obj, path) {
                    return obj.get(path);
                }
            });
            return fuse.search(text);
        }

    });

    return Notes;
});
