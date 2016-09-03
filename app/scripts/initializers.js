/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define */
define([
    'underscore',
    'q',
    'backbone.radio',
    'marionette'
], function(_, Q, Radio, Marionette) {
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
     * Radio.request('init', 'add', '[app|app:before|module]', function() {});
     *
     * Executing initializers
     * Radio.request('init', 'start', '[app|app:before|module]', args);
     */
    var Initializers = Marionette.Object.extend({

        initialize: function() {
            this._inits = {};

            Radio.channel('init')
            .reply('add', this.addInit, this)
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
                var promises = [];

                // Execute every init one after another
                _.each(types, function(type) {
                    promises.push(function() {
                        return self._executeInit(type, args);
                    });
                });

                return _.reduce(promises, Q.when, new Q());
            };
        },

        /**
         * Executes an initializer
         */
        _executeInit: function(type, args) {
            var self     = this,
                promises = [];

            // Execute all the functions asynchronously
            _.each(self._inits[type], function(fnc) {
                promises.push(function() {
                    return new Q(fnc.apply(null, args));
                });
            });

            return _.reduce(promises, Q.when, new Q());
        }

    });

    return new Initializers();
});
