/*global define*/
define([
    'underscore',
    'jquery',
    'backbone',
    'models/config',
    'localStorage'
], function (_, $, Backbone, Config) {
    'use strict';

    var Configs = Backbone.Collection.extend({

        localStorage: new Backbone.LocalStorage('vimarkable.configs'),
        store : 'configs',

        model : Config,

        configNames: {
            'appVersion': '0.5.0',
            'appProfiles': JSON.stringify(['notes-db']),
            'appLang': '',
            'cloudStorage': '0',
            'dropboxKey': '',
            'pagination': '10',
            'sortnotebooks': 'name',
            'editMode': 'preview',
            // Ecnryption settings
            'encrypt': '0',
            'encryptPass': '',
            'encryptSalt': '',
            'encryptIter': '1000',
            'encryptTag': '64',
            'encryptKeySize': '128',
            // Keybindings
            'navigateTop': 'k',
            'navigateBottom': 'j',
            'jumpInbox': 'g i',
            'jumpNotebook': 'g n',
            'jumpFavorite': 'g f',
            'jumpRemoved': 'g t',
            'actionsEdit': 'e',
            'actionsOpen': 'o',
            'actionsRemove': 'shift+3',
            'actionsRotateStar': 's',
            'appCreateNote': 'c',
            'appSearch': '/',
            'appKeyboardHelp': '?'
        },

        /**
         * Creates default set of configs
         */
        firstStart: function () {
            var $d = $.Deferred(),
                self = this,
                length;

            function check() {
                length = self.length;
                if (length === self.configNames.length) {
                    $d.resolve(self);
                    return;
                }

                _.forEach(self.configNames, function (item, name) {
                    if (typeof self.get(name) === 'undefined') {
                        self.create(new Config({ name: name, value: item }));
                    }
                });

                $d.resolve({ collection: self, startLength: length });
            }

            $.when(this.fetch()).done(check);
            return $d;
        },

        getConfigs: function () {
            var data = {};

            _.forEach(this.models, function ( model ) {
                data[model.get('name')] = model.get('value');
            });

            data.appProfiles = JSON.parse(data.appProfiles || this.configNames.appProfiles);

            return data;
        },

        resetFromJSON: function (jsonSettings) {
            var newConfs = [];
            _.forEach(jsonSettings, function (val, key) {
                newConfs.push({name: key, val: val});
            });
            this.reset(newConfs);
        },

        createProfile: function (name) {
            var profiles = this.get('appProfiles'),
                value = JSON.parse(profiles.get('value'));

            if ( !name ) {
                return;
            }

            if (_.contains(value, name) === false) {
                value.push(name);
                profiles.save({ value: JSON.stringify(value) });
            }
        },

        removeProfile: function (name) {
            var profiles = this.get('appProfiles'),
                value = JSON.parse(profiles.get('value'));

            if ( !name ) {
                return;
            }

            if (_.contains(value, name) === true) {
                value = _.without(value, name);
                profiles.save({ value: JSON.stringify(value) });
                window.indexedDB.deleteDatabase(name);
            }
        },

        shortcuts: function () {
            var pattern = /(actions|navigate|jump|appCreateNote|appSearch|appKeyboardHelp)/;
            return this.filter(function (m) {
                pattern.lastIndex = 0;
                return pattern.test(m.get('name'));
            });
        },

        /**
         * Filter
         */
        appShortcuts: function () {
            var names = ['appCreateNote', 'appSearch', 'appKeyboardHelp'];
            return this.filter(function (m) {
                return _.contains(names, m.get('name'));
            });
        },

        filterName: function (str) {
            return this.filter(function (m) {
                return m.get('name').search(str) >= 0;
            });
        }

    });

    return Configs;

});
