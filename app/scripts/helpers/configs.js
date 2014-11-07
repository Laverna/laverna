/* global define */
define([
    'jquery',
    'backbone',
    'collections/configs',
    'constants',
    'backbone.wreqr'
], function($, Backbone, Configs, constants) {
    'use strict';

    var channel = Backbone.Wreqr.radio.channel('global'),
        Settings;

    Settings = {
        configs: new Configs(),

        /**
         * Fetches configs. If config collection is empty, creates configs.
         * @return promise
         */
        fetch: function() {
            var defer = $.Deferred();

            Settings.configs
            .firstStart()
            .then(function(res) {
                Settings.configs = res.collection;

                // Collection was empty
                if (res.startLength === 0) {
                    channel.vent.trigger('app:install');
                }

                defer.resolve(Settings.configs);
            });

            return defer;
        },

        /**
         * Returns current configs
         * @param boolean getObject return it as backbone model or as key/value?
         * @return object
         */
        getAll: function(getObject) {
            return (getObject) ? Settings.configs : Settings.configs.getConfigs();
        },

        createDatabase: function() {
            var profile = channel.reqres.request('uri:profile') || 'notes-db';
            Settings.configs.createProfile(profile);
        }
    };

    // Returns configs
    channel.reqres.setHandler('configs', Settings.getAll);

    // Constants
    channel.reqres.setHandler('constants', function() { return constants; });

    // Create database profiles
    channel.vent.on('app:module', Settings.createDatabase);

    return Settings;
});
