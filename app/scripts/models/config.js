/*global define*/
define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    'use strict';

    var Config = Backbone.Model.extend({

        idAttribute: 'id',

        defaults: {
            'id'    : undefined,
            'name'  : '',
            'value' : ''
        },

        validate: function (attrs) {
            var errors = [];

            if (attrs.name === '') {
                errors.push('name');
            }
            if (attrs.value === '') {
                errors.push('value');
            }

            if (errors.length > 0) {
                return errors;
            }
        },

        initialize: function () {
        }

    });

    return Config;

});
