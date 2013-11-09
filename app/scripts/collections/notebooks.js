/*global define*/
define(['underscore', 'models/notebook', 'backbone', 'localStorage'], function (_, Notebook, Backbone) {
    'use strict';

    var Notebooks = Backbone.Collection.extend({
        model: Notebook,

        localStorage: new Backbone.LocalStorage('vimarkable.notebooks'),
    });

    return Notebooks;
});
