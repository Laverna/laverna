/*global define*/
define(['underscore', 'models/notebook', 'backbone', 'localStorage'], function (_, Notebook, Backbone) {
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
