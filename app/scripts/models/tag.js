/*global define*/
define([
    'underscore',
    'backbone',
    'migrations/note',
    'backbone.assosiations'
], function (_, Backbone, TagsDB) {
    'use strict';

    /**
     * Tags model
     */
    //var Tag = Backbone.Model.extend({
    var Tag = Backbone.AssociatedModel.extend({
        idAttribute: 'id',

        database : TagsDB,
        storeName: 'tags',

        defaults: {
            'id'    : 0,
            'name'  : '',
            'count' : '',
            'synchronized' : 0
        },

        initialize: function () {
            this.on('update:name', this.doEscape());
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
