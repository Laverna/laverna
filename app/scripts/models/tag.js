/*global define*/
define([
    'underscore',
    'backbone',
    'backbone.assosiations'
], function (_, Backbone) {
    'use strict';

    /**
     * Tags model
     */
    //var Tag = Backbone.Model.extend({
    //AssociatedModel
    var Tag = Backbone.AssociatedModel.extend({
        idAttribute: 'id',

        defaults: {
            'id'    : undefined,
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
