/*global define*/
define([
    'underscore',
    'backbone',
    'migrations/note',
    'collections/removed',
    'indexedDB'
], function(_, Backbone, NotesDB, Removed) {
    'use strict';

    var Model = Backbone.Model.extend({
        idAttribute: 'id',

        database: NotesDB,
        storeName: 'notebooks',

        defaults: {
            'type'         : 'notebooks',
            'id'           : undefined,
            'parentId'     : '0',
            'name'         : '',
            'synchronized' : 0,
            'count'        : 0,
            'trash'        : 0,
            'updated'      : 0
        },

        encryptKeys: ['name'],

        validate: function(attrs) {
            var errors = [];
            if (attrs.name === '') {
                errors.push('name');
            }
            if (attrs.parentId === attrs.id) {
                errors.push('parentId');
            }
            if (errors.length > 0) {
                return errors;
            }
        },

        initialize: function() {
            if (typeof this.id === 'number') {
                this.set('id', this.id.toString());
                this.set('parentId', this.get('parentId').toString());
            }
        },

        updateDate: function() {
            this.set('updated', Date.now());
            this.set('synchronized', 0);
        },

        /**
         * Saves model's id for sync purposes, then destroys it
         */
        destroySync: function() {
            return new Removed().newObject(this, arguments);
        },

        addCount: function() {
            if (this.get('id') === 0) {
                return;
            }
            this.save({
                'count': this.get('count') + 1
            });
        },

        removeCount: function() {
            if (this.get('id') === 0) {
                return;
            }
            this.save({
                'count': this.get('count') - 1
            });
        }

    });

    return Model;
});
