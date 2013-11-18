/*global define*/
define([
    'underscore',
    'backbone',
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
        },

        plusCount: function () {
            if (this.get('id') === 0) {
                return;
            }
            this.set('count', this.get('count') + 1);
            this.save();
        },

        minusCount: function () {
            if (this.get('id') === 0) {
                return;
            }
            this.set('count', this.get('count') - 1);
            this.save();
        }
    });

    return Model;
});
