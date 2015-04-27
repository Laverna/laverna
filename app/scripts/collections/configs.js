/*global define*/
define([
    'underscore',
    'jquery',
    'backbone',
    'models/config',
    'migrations/note',
    'indexedDB'
], function(_, $, Backbone, Config, DB) {
    'use strict';

    var Configs = Backbone.Collection.extend({
        model : Config,

        database  : DB,
        storeName : 'configs',

        configNames: {
            'appVersion'        : '0.5.0',
            'appProfiles'       : JSON.stringify(['notes-db']),
            'appLang'           : '',
            'cloudStorage'      : '0',
            'dropboxKey'        : '',
            'pagination'        : '10',
            'sortnotebooks'     : 'name',
            'editMode'          : 'preview',
            'useDefaultConfigs' : '1',

            // Encryption settings
            'encrypt'           : '0',
            'encryptPass'       : '',
            'encryptSalt'       : '',
            'encryptIter'       : '1000',
            'encryptTag'        : '64',
            'encryptKeySize'    : '128',

            // Keybindings
            'navigateTop'       : 'k',
            'navigateBottom'    : 'j',
            'jumpInbox'         : 'g i',
            'jumpNotebook'      : 'g n',
            'jumpFavorite'      : 'g f',
            'jumpRemoved'       : 'g t',
            'actionsEdit'       : 'e',
            'actionsOpen'       : 'o',
            'actionsRemove'     : 'shift+3',
            'actionsRotateStar' : 's',
            'appCreateNote'     : 'c',
            'appSearch'         : '/',
            'appKeyboardHelp'   : '?'
        },

        /**
         * Check for new configs.
         */
        hasNewConfigs: function() {
            return (
                _.keys(this.configNames).length !== this.length
            );
        },

        /**
         * Switch to another profile
         */
        changeDB: function(id) {
            this.database = _.extend({}, this.database, {id: id});
            this.model.prototype.database = this.database;
        },

        /**
         * Migrate configs from localStorage.
         */
        migrateFromLocal: function() {
            var val;
            _.each(this.configNames, function(value, name) {
                val = localStorage.getItem('vimarkable.configs-' + name);
                if (val) {
                    this.configNames[name] = JSON.parse(val).value;
                }
            }, this);
        },

        /**
         * Create default configs.
         */
        createDefault: function() {
            var defer = $.Deferred(),
                self  = this,
                promise;

            _.each(this.configNames, function(value, name) {
                // Check whether a model already exists
                if (typeof this.get(name) !== 'undefined') {
                    return;
                }

                if (!promise) {
                    promise = $.when(this.create({name: name, value: value}));
                    return;
                }
                promise.then(this.create({name: name, value: value}));
            }, this);

            promise.then(function() {
                defer.resolve(self);
            });

            return defer.promise();
        },

        /**
         * Transform the collection to key = value structure.
         */
        getConfigs: function() {
            var data = {};

            _.forEach(this.models, function(model) {
                data[model.get('name')] = model.get('value');
            });

            data.appProfiles = JSON.parse(data.appProfiles || this.configNames.appProfiles);

            return data;
        },

        /**
         * Return a model with a default value
         */
        getDefault: function(name) {
            var config = this.configNames[name];
            return new this.model({name: name, value: config});
        },

        resetFromJSON: function(jsonSettings) {
            var newConfs = [];
            _.forEach(jsonSettings, function(val, key) {
                newConfs.push({name: key, val: val});
            });
            this.reset(newConfs);
        },

        shortcuts: function() {
            var pattern = /(actions|navigate|jump|appCreateNote|appSearch|appKeyboardHelp)/;
            return this.filter(function(m) {
                pattern.lastIndex = 0;
                return pattern.test(m.get('name'));
            });
        },

        /**
         * Filter
         */
        appShortcuts: function() {
            var names = ['appCreateNote', 'appSearch', 'appKeyboardHelp'];
            return this.filter(function(m) {
                return _.contains(names, m.get('name'));
            });
        },

        filterName: function(str) {
            return this.filter(function(m) {
                return m.get('name').search(str) >= 0;
            });
        }

    });

    return Configs;

});
