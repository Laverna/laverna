/*global define*/
define([
    'underscore',
    'backbone',
    'models/config',
    'localStorage'
], function (_, Backbone, Config) {
    'use strict';

    var Configs = Backbone.Collection.extend({

        localStorage: new Backbone.LocalStorage('vimarkable.configs'),

        model : Config
    });

    return Configs;

});
