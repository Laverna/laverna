/*global define*/
define([
    'underscore',
    'backbone',
    'models/tag',
    'migrations/tags'
], function (_, Backbone, Tag, TagsDB) {
    'use strict';

    /**
     * Tags collection
     */
    var Tags = Backbone.Collection.extend({
        model: Tag,

        database : TagsDB,
        storeName: 'tags',

        initialize: function () {
        },

        /**
         * Do not add if already exists
         */
        saveAdd: function (tags) {
            var model;
            _.each(tags, function (tag) {
                tag = tag.trim();
                model = new this.model({ name : tag });

                model.fetch({
                    error: function () {
                        model.save();
                    }
                });
            }, this);
        },

        /**
         * Generates the next order number
         */
        nextOrder: function () {
            if ( !this.length) {
                return 1;
            }
            return this.last().get('id') + 1;
        },

        navigate: function (id, direction) {
            var tag,
                i;

            tag = this.get(id);
            i = this.indexOf(tag);

            if (direction === 'prev') {
                i = (i > 0) ? i - 1 : 0;
            } else {
                i = (i === (this.length - 1)) ? i : i + 1;
            }

            return this.at(i);
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
        }

    });

    return Tags;
});
