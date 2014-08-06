/*global define*/
define([
    'underscore',
    'jquery',
    'backbone',
    'models/tag',
    'migrations/note',
    'indexedDB'
], function (_, $, Backbone, Tag, TagsDB) {
    'use strict';

    /**
     * Tags collection
     */
    var Tags = Backbone.Collection.extend({
        model: Tag,

        database : TagsDB,
        storeName: 'tags',

        comparator: 'name',

        initialize: function () {
        },

        /**
         * Do not add if already exists
         */
        saveAdd: function (tags) {
            var done = $.Deferred(),
                model;

            if (tags.length === 0) {
                done.resolve(true);
            }

            _.each(tags, function (tag, iter) {
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
         * Find tag by name and return id's
         */
        getTagsId: function (tagNames) {
            var tags = [],
                that = this,
                tag;

            _.each(tagNames, function (name) {
                tag = that.where({name: name});

                if (tag.length !== 0) {
                    tags.push(tag[0].get('id'));
                }
            });

            return tags;
        },

        /**
         * Return only tag names
         */
        getNames: function (tags) {
            var names = [];

            if (tags === undefined) {
                tags = this.toArray();
            }

            _.each(tags, function (tag) {
                if (tag !== undefined) {
                    names.push(tag.get('name'));
                }
            });

            return names;
        },

        checkExist: function (tagNames) {
            var names = [];

            _.each(tagNames, function (name) {
                if (this.get({name : name})) {
                    names.push(name);
                }
            });

            return names;
        }

    });

    return Tags;
});
