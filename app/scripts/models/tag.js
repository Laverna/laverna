/*global define*/
define([
    'underscore',
    'backbone',
    'collections/removed',
    'migrations/note'
], function (_, Backbone, Removed, TagsDB) {
    'use strict';

    /**
     * Tags model
     */
    var Tag = Backbone.Model.extend({
        idAttribute: 'id',

        database : TagsDB,
        storeName: 'tags',

        defaults: {
            'id'           :  undefined,
            'name'         :  '',
            'count'        :  '',
            'synchronized' :  0,
            'updated'      : Date.now()
        },

        initialize: function () {
            this.on('update:name', this.doEscape());
        },

        /**
         * Saves model's id for sync purposes, then destroys it
         */
        destroySync: function () {
            return new Removed().newObject(this, arguments);
        },

        updateDate: function () {
            this.set('updated', Date.now());
            this.set('synchronized', 0);
        },

        doEscape: function () {
            this.set('name', _.escape(this.get('name')));
        },

        validate: function (attrs) {
            var errors = [];
            if (attrs.name === '') {
                errors.push('name');
            }
            if (errors.length > 0) {
                return errors;
            }
        },

        next: function () {
            if (this.collection) {
                return this.collection.at(this.collection.indexOf(this) + 1);
            }
        },

        prev: function () {
            if (this.collection) {
                return this.collection.at(this.collection.indexOf(this) - 1);
            }
        }

    });

    return Tag;
});
