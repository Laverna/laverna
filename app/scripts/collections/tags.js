/*global define*/
define([
    'underscore',
    'backbone',
    'models/tag',
    'migrations/note'
], function (_, Backbone, Tag, TagsDB) {
    'use strict';

    /**
     * Tags collection
     */
    var Tags = Backbone.Collection.extend({
        model: Tag,

        database : TagsDB,
        storeName: 'tags',
        store: 'tags',

        initialize: function () {
        },

        /**
         * Do not add if already exists
         */
        saveAdd: function (tags) {
            var model;

            _.each(tags, function (tag) {
                tag = tag.trim();
                model = this.findWhere({name : tag});
                if (tag !== '' && model === undefined) {
                    model = new this.model({ name : tag });
                    model.save();
                }
            }, this);
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
