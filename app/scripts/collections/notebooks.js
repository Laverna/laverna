/*global define*/
define(['underscore', 'models/notebook', 'backbone', 'localStorage'], function (_, Notebook, Backbone) {
    'use strict';

    var Notes = Backbone.Collection.extend({
        model: Notebook,

        localStorage: new Backbone.LocalStorage('vimarkable.notebooks'),
    });

    return Notes;
});
