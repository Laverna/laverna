/*global define*/
define(['underscore', 'backbone'], function (_, Backbone) {
    'use strict';

    var Model = Backbone.Model.extend({
        idAttribute: 'id',

        defaults: {
            'id'       :  undefined,
            'parentId' :  0,
            'name'     :  '',
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
        }
    });

    return Model;
});
