/*global define*/
define([
    'underscore',
    'backbone',
    'models/note',
    'collections/notes',
    'backbone.relational'
], function (_, Backbone) {
    'use strict';

    // var Model = Backbone.Model.extend({
    var Model = Backbone.RelationalModel.extend({
        idAttribute: 'id',

        defaults: {
            'id'       :  undefined,
            'parentId' :  0,
            'name'     :  '',
            'notes'    :  ''
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
        }
    });

    return Model;
});
