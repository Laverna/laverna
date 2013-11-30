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
        },

        navigate: function (id, direction) {
            var tag,
                i;

            tag = this.get(id);
            i = this.indexOf(tag);

            if (direction === 'prev') {
                i = (i > 0) ? i - 1 : 0;
            } else {
                i = (i === (this.length - 1)) ? i : i + 1;
            }

            return this.at(i);
        }
    });

    return Tags;
});
