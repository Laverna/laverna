/*global define*/
/*global test*/
/*global equal*/
define([
    'backbone',
    'models/config',
    'collections/configs',
    'localStorage'
], function (Backbone, Config, Configs, Store) {
    'use strict';

    module('Configs collection', {
        setup: function () {
            this.configs = new Configs();

            this.config = new Config();
            this.configs.add(this.config);

            this.secondconfig = new Config({
                name: 'new config'
            });
            this.configs.add(this.secondconfig);
        },

        teardown: function () {
            window.errors = null;
        }
    });

    test('Has the config model', function () {
        equal(this.configs.model, Config);
    });

    test('Config is added to collection', function () {
        equal(this.configs.length, 2);
    });

    test('Uses localStorage', function () {
        var storage = new Store('vimarkable.configs');
        equal(this.configs.localStorage.name, storage.name);
    });


});
