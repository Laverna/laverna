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
            'id'           :  undefined,
            'name'         :  '',
            'count'        :  '',
            'synchronized' :  0,
            'created'      : Date.now(),
            'updated'      : Date.now()
        },

        initialize: function() {
            // this.on('update:name', this.doEscape());
        },

        /**
         * Override `save` method so that we can check for uniqueness
         * of tag's name.
         */
        save: function() {
            var self = this,
                args = arguments;

            // If the model is not unique, do nothing
            return this.isUnique()
            .then(function(result) {
                if (result) {
                    return Backbone.Model.prototype.save.apply(self, args);
                }
            });
        },

        validate: function(attrs) {
            var errors = [];
            if (attrs.name === '') {
                errors.push('name');
            }

            if (errors.length > 0) {
                return errors;
            }
        },

        /**
         * Check for uniqueness of the model
         */
        isUnique: function() {
            var defer = $.Deferred(),
                self  = this;

            // Search for tags with the same name as the current model's
            Radio.request('tags', 'get:all', {
                conditions: {name: this.get('name')}
            })
            .then(function(collection) {
                // Ensure to omit this model from the collection
                collection = _.filter(collection, function(m) {
                    return m.get('id') !== self.get('id');
                });

                if (collection.length) {
                    self.trigger('invalid', self, ['name']);
                }
                defer.resolve(collection.length === 0);
            });

            return defer.promise();
        },

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
