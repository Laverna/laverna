/* global define */
define([
    'underscore',
    'jquery',
    'backbone.radio',
    'marionette'
], function(_, $, Radio, Marionette) {
    'use strict';

    /**
     * This class is used to add and execute asynchronous initializers.
     * It is very convenient when writing modules or writing sub apps.
     * Also it ensures that every module or sub app is ready
     * before the app starts.
     *
     * App initializers will be executed first. Then, module initializers.
     *
     * Adding new initializers:
     * Radio.command('init', 'add', '[app|app:before|module]', function() {});
     *
     * Executing initializers
     * Radio.request('init', 'start', '[app|app:before|module]', args);
     */
    var Initializers = Marionette.Object.extend({

        initialize: function() {
            this._inits = {};

            Radio.channel('init')
            .comply('add', this.addInit, this)
            .reply('start', this.executeInits, this);
        },

        addInit: function(name, initializer) {
            this._inits[name] = this._inits[name] || [];
            this._inits[name].push(initializer);
        },

        /**
         * Executes all the initializers
         */
        executeInits: function(types, args) {
            var self  = this;

            types = types.split(' ');
            args  = Array.prototype.slice.call(arguments, 1);

            return function() {
                var defer = new $.Deferred(),
                    promise;

                // Execute every init one after another
                _.each(types, function(type) {
                    if (!promise) {
                        promise = self._executeInit(type, args);
                        return;
                    }

                    promise.then(self._executeInit(type, args));
                });

                promise.then(function() {
                    defer.resolve();
                });

                return defer.promise();
            };
        },

        /**
         * Executes an initializer
         */
        _executeInit: function(type, args) {
            var defer = new $.Deferred(),
                self  = this,
                after = _.after(self._inits[type].length, function() {
                    defer.resolve();
                });

            // Execute all the functions asynchronously
            _.each(self._inits[type], function(fnc) {
                $.when(fnc(args)).then(after);
            });

            return defer.promise();
        }

    });

    return new Initializers();
});
