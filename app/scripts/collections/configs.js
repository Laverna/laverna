/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/*global define*/
define([
    'underscore',
    'q',
    'backbone',
    'models/config',
], function(_, Q, Backbone, Config) {
    'use strict';

    var Configs = Backbone.Collection.extend({
        model : Config,

        profileId : 'notes-db',
        storeName : 'configs',

        configNames: {
            'appVersion'         : '0.5.0',
            'firstStart'         : '1',
            'appProfiles'        : JSON.stringify(['notes-db']),
            'appLang'            : '',
            'cloudStorage'       : '0',
            'dropboxKey'         : '',
            'dropboxAccessToken' : '',
            'pagination'         : '10',
            'sortnotes'          : 'created',
            'sortnotebooks'      : 'name',
            'navbarNotebooksMax' : '5',
            'useDefaultConfigs'  : '1',

            // Editor settings
            'editMode'           : 'preview',
            'indentUnit'         : '4',

            // Encryption settings
            'encrypt'            : '0',
            'encryptPass'        : '',
            'encryptSalt'        : '',
            'encryptIter'        : '10000',
            'encryptTag'         : '128',
            'encryptKeySize'     : '256',
            'encryptBackup'      : {},

            // Keybindings
            'navigateTop'        : 'k',
            'navigateBottom'     : 'j',
            'jumpInbox'          : 'g i',
            'jumpNotebook'       : 'g n',
            'jumpFavorite'       : 'g f',
            'jumpRemoved'        : 'g t',
            'jumpOpenTasks'      : 'g o',
            'actionsEdit'        : 'e',
            'actionsOpen'        : 'o',
            'actionsRemove'      : 'shift+3',
            'actionsRotateStar'  : 's',
            'appCreateNote'      : 'c',
            'appSearch'          : '/',
            'appKeyboardHelp'    : '?',
            'textEditor'         : 'default',

            'modules'            : []
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
            this.profileId = id;
            this.model.prototype.profileId = this.profileId;
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
            var self     = this,
                promises = [];

            _.each(this.configNames, function(value, name) {
                // Check whether a model already exists
                if (typeof this.get(name) !== 'undefined') {
                    return;
                }

                promises.push(
                    new Q(new self.model().save({name: name, value: value}))
                );
            }, this);

            return Q.all(promises);
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
                newConfs.push({name: key, value: val});
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
