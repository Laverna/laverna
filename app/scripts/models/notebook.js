/*global define*/
define([
    'underscore',
    'backbone',
    'migrations/note',
    'collections/removed',
    'indexedDB'
], function (_, Backbone, NotesDB, Removed) {
    'use strict';

    var Model = Backbone.Model.extend({
        idAttribute: 'id',

        database: NotesDB,
        storeName: 'notebooks',

        defaults: {
            'id'           : undefined,
            'parentId'     : '',
            'name'         : '',
            'synchronized' : 0,
            'count'        : 0,
            'updated'      : Date.now()
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

        initialize: function () {
            this.on('removed:note', this.removeCount);
            this.on('add:note', this.addCount);
        },

        updateDate: function () {
            this.set('updated', Date.now());
            this.set('synchronized', 0);
        },

        /**
         * Saves model's id for sync purposes, then destroys it
         */
        destroySync: function () {
            return new Removed().newObject(this, arguments);
        },

        addCount: function () {
            if (this.get('id') === 0) {
                return;
            }
            this.save({
                'count': this.get('count') + 1
            });
        },

        removeCount: function () {
            if (this.get('id') === 0) {
                return;
            }
            this.save({
                'count': this.get('count') - 1
            });
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

    return Model;
});
