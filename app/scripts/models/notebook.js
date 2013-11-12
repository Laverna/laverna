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

        initialize: function () {
        }
    });

    return Model;
});
