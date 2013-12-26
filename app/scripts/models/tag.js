/*global define*/
define([
    'underscore',
    'backbone',
<<<<<<< HEAD
    'migrations/tag',
=======
    'migrations/tags',
>>>>>>> wwebfor
    'backbone.assosiations'
], function (_, Backbone, TagsDB) {
    'use strict';

    /**
     * Tags model
     */
    //var Tag = Backbone.Model.extend({
    var Tag = Backbone.AssociatedModel.extend({
        idAttribute: 'id',

<<<<<<< HEAD
        database: TagsDB,
=======
        database : TagsDB,
>>>>>>> wwebfor
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
