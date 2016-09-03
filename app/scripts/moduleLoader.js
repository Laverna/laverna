/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define, requirejs */
define([
    'underscore',
    'q',
    'backbone.radio',
    'text!modules/modules.json'
], function(_, Q, Radio, modules) {
    'use strict';

    /**
     * Module loader.
     */
    var ModuleLoader = {

        init: function() {
            var platform = Radio.request('global', 'platform');

            // List of available modules
            modules = _.filter(JSON.parse(modules), function(m) {
                return _.indexOf(m.platforms, platform) > -1;
            });
            Radio.reply('global', 'modules', modules);

            return this.load();
        },

        /**
         * Load modules.
         */
        load: function() {
            var defer = Q.defer();

            requirejs(this.get(), function() {
                defer.resolve();
            });

            return defer.promise;
        },

        /**
         * Return a list of modules which need to be loaded.
         *
         * @return array
         */
        get: function() {
            var modules2Load = Radio.request('configs', 'get:config', 'modules');

            modules2Load = _.map(modules2Load, function(name) {
                if (!name || !_.findWhere(modules, {id: name})) {
                    return '';
                }

                return 'modules/' + name + '/module';
            });

            switch (Radio.request('configs', 'get:config', 'cloudStorage')) {
                case 'remotestorage':
                    modules2Load.push('modules/remotestorage/module');
                    break;

                case 'dropbox':
                    modules2Load.push('modules/dropbox/module');
                    break;

                default:
                    break;
            }

            return _.compact(modules2Load);
        },
    };

    // Register an initializer
    Radio.request('init', 'add', 'load:modules', function() {
        return ModuleLoader.init();
    });

    return ModuleLoader;

});
