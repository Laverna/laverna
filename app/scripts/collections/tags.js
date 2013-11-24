/*global define*/
define([
    'underscore',
    'backbone',
    'models/tag',
    'localStorage'
], function (_, Backbone, Tag) {
    'use strict';

    /**
     * Tags collection
     */
    var Tags = Backbone.Collection.extend({
        model: Tag,

        localStorage: new Backbone.LocalStorage('vimarkable.tags'),

        /**
         * Generates the next order number
         */
        nextOrder: function () {
            if ( !this.length) {
                return 1;
            }
            return this.last().get('id') + 1;
        },

        initialize: function () {
        }
    });

    return Tags;
});
