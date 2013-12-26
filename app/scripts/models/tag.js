/*global define*/
define([
    'underscore',
    'backbone',
    'migrations/tags',
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
            'count' : ''
        },

        validate: function (attrs) {
            var errors = [];
            if (attrs.name === '') {
                errors.push('name');
            }
            if (errors.length > 0) {
                return errors;
            }
        }

    });

    return Tag;
});
