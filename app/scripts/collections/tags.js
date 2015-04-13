/*global define*/
define([
    'underscore',
    'jquery',
    'backbone',
    'collections/pageable',
    'models/tag',
    'migrations/note',
    'indexedDB'
], function(_, $, Backbone, PageableCollection, Tag, TagsDB) {
    'use strict';

    /**
     * Tags collection
     */
    var Tags = PageableCollection.extend({
        model: Tag,

        database : TagsDB,
        storeName: 'tags',

        state: {
            pageSize     : 20,
            firstPage    : 0,
            currentPage  : 0,
            totalRecords : 0,
            comparator   : {'updated': 'desc'}
        },

        initialize: function() {
        },

        sortFullCollection: function() {
            if (!this.fullCollection) {
                return;
            }

            // Sort the full collection again
            this.fullCollection.sortItOut();

            // Update pagination state
            this._updateTotalPages();

            var models = this.fullCollection.models.slice(
                0, this.state.pageSize * (this.state.currentPage + 1)
            );

            // Reset the collection so the view could re-render itself
            this.reset(models);
        },

        /**
         * Sets state.currentPage to the given number.
         * Then, it overrites models of the current collection.
         */
        getPage: function(number) {
            // Calculate page number
            var pageStart = this.getOffset(number),
                models;

            // Save where we currently are
            this.state.currentPage = number;

            // Slice an array of models
            models = this.fullCollection.models.slice(pageStart, pageStart + this.state.pageSize);

            if (number === 0) {
                this.reset(models);
            }
            else {
                this.add(models);
            }

            return this.models;
        },

        /**
         * This collection is never going to have a previous page
         * because it uses inifinite pagination.
         */
        hasPreviousPage: function() {
            return false;
        },

        /**
         * Do not add if already exists
         */
        saveAdd: function(tags) {
            var done = $.Deferred(),
                model;

            if (tags.length === 0) {
                done.resolve(true);
            }

            _.each(tags, function(tag, iter) {
                tag = tag.trim();
                model = this.findWhere({name : tag});
                if (tag !== '' && model === undefined) {
                    model = new this.model({ name : tag });
                    model.save();
                }

                if (iter === (tags.length - 1)) {
                    done.resolve(true);
                }
            }, this);

            return done;
        },

        /**
         * Find a tag by name and return id's
         */
        getTagsId: function(tagNames) {
            var tags = [],
                self = this,
                tag;

            _.each(tagNames, function(name) {
                tag = self.where({name: name});

                if (tag.length !== 0) {
                    tags.push(tag[0].get('id'));
                }
            });

            return tags;
        },

        /**
         * Return only tag names
         */
        getNames: function(tags) {
            var names = [];

            if (tags === undefined) {
                tags = this.toArray();
            }

            _.each(tags, function(tag) {
                if (tag !== undefined) {
                    names.push(tag.get('name'));
                }
            });

            return names;
        },

        checkExist: function(tagNames) {
            var names = [];

            _.each(tagNames, function(name) {
                if (this.get({name : name})) {
                    names.push(name);
                }
            });

            return names;
        }

    });

    return Tags;
});
