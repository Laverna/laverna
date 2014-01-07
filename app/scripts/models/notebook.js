/*global define*/
define([
    'underscore',
    'backbone',
    'migrations/note',
    'backbone.assosiations',
    'indexedDB'
], function (_, Backbone, NotesDB) {
    'use strict';

    // var Model = Backbone.Model.extend({
    var Model = Backbone.AssociatedModel.extend({
        idAttribute: 'id',

        database: NotesDB,
        storeName: 'notebooks',
        store: 'notebooks',

        defaults: {
            'id'       :  0,
            'parentId' :  0,
            'name'     :  '',
            'notes'    :  [],
            'count'    :  0
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
