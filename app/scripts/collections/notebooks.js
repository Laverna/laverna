/*global define*/
define([
    'underscore',
    'backbone',
    'models/notebook',
    'localStorage'
], function (_, Backbone, Notebook) {
    'use strict';

    var Notebooks = Backbone.Collection.extend({
        model: Notebook,

        localStorage: new Backbone.LocalStorage('vimarkable.notebooks'),

        /**
         * Generates the next order number
         */
        nextOrder: function () {
            if ( !this.length) {
                return 1;
            }
            return this.last().get('id') + 1;
        }
    });

    return Notebooks;
});
