/*global define*/
define([
    'jquery',
    'underscore',
    'backbone',
    'backbone.radio',
    'collections/removed',
    'migrations/note'
], function($, _, Backbone, Radio, Removed, TagsDB) {
    'use strict';

    /**
     * Tags model
     */
    var Tag = Backbone.Model.extend({
        idAttribute: 'id',

        database : TagsDB,
        storeName: 'tags',

        defaults: {
            'type'         : 'tags',
            'id'           : undefined,
            'name'         : '',
            'count'        : '',
            'synchronized' : 0,
            'trash'        : 0,
            'created'      : 0,
            'updated'      : 0
        },

        encryptKeys: ['name'],

        initialize: function() {
            // this.on('update:name', this.doEscape());
        },

        /*validate: function(attrs) {
            var errors = [];
            if (attrs.name === '') {
                errors.push('name');
            }

            if (errors.length > 0) {
                return errors;
            }
        },*/

        /**
         * Saves model's id for sync purposes, then destroys it
         */
        destroySync: function() {
            return new Removed().newObject(this, arguments);
        },

        updateDate: function() {
            this.set('updated', Date.now());
            this.set('synchronized', 0);
        },

        doEscape: function() {
            this.set('name', _.escape(this.get('name')));
        }

    });

    return Tag;
});
