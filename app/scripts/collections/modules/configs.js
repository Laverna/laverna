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
    'marionette',
    'backbone.radio',
    'sjcl',
    'collections/modules/module',
    'collections/configs'
], function(_, Q, Marionette, Radio, sjcl, ModuleObject, Configs) {
    'use strict';

    /**
     * Collection module for Configs.
     *
     * Apart from the replies and events in collections/modules/module.js,
     * it also has additional replies and events.
     *
     * Triggers events on channel `configs`:
     * 1. event: `collection:empty` - if the collection is empty.
     * 2. event: `removed:profile`  - when some profile is removed.
     * 3. event: `changed`          - after configs are changed
     *
     * Replies on channel `configs` to:
     * 1. request: `get:config`     - returns a config.
     * 2. request: `get:object`     - returns configs in key=value format.
     * 3. request: `get:profiles`   - returns list of profiles
     * 4. request: `reset:encrypt`  - resets encryption configs backup.
     * 5. request: `save:objects`   - save several configs at once
     * 6. request: `create:profile` - create a new profile
     * 7. request: `remove:profile` - remove a profile
     * 8. request: `save:object`
     */
    var Collection = ModuleObject.extend({
        Collection: Configs,

        reply: function() {
            return {
                'save:object'    : this.saveObject,
                'save:objects'   : this.saveObjects,
                'create:profile' : this.createProfile,
                'remove:profile' : this.removeProfile,
                'get:config'     : this.getConfig,
                'get:object'     : this.getObject,
                'get:profiles'   : this.getProfiles,
                'reset:encrypt'  : this.resetEncrypt
            };
        },

        encryptionKeys: [
            'encrypt'    , 'encryptPass', 'encryptSalt'  ,
            'encryptIter', 'encryptTag' , 'encryptKeySize'
        ],

        /**
         * Reset encryptBackup
         */
        resetEncrypt: function() {
            var model = this.collection.get('encryptBackup');
            return this.saveModel(model, {value: {}});
        },

        /**
         * Create a new profile
         *
         * @type object Backbone.model - appProfiles model
         */
        createProfile: function(model, name) {
            return model.createProfile(name);
        },

        /**
         * Remove a profile
         */
        removeProfile: function(model, name) {
            return new Q(model.removeProfile(name, model))
            .then(function() {
                Radio.trigger('configs', 'removed:profile', name);
            });
        },

        /**
         * Save a config.
         * @type object Backbone model
         * @type object new value
         */
        saveModel: function(model, data) {
            var saveFunc = _.bind(ModuleObject.prototype.saveModel, this);

            if (!model.isPassword(data)) {
                return saveFunc(model, data);
            }

            // Always save passwords as sha256
            return new Q(Radio.request('encrypt', 'sha256', data.value))
            .then(function(result) {
                data.value = result;
                return saveFunc(model, data);
            });
        },

        /**
         * Update several configs at once
         * @type array array of configs
         * @type object Backbone model
         */
        saveObjects: function(objects, useDefault) {
            var promises = [],
                self  = this;

            // Backup current encryption configs
            if (objects.useDefaultConfigs) {
                promises.push(
                    this._backupEncrypt(useDefault.profileId)
                );
            }

            // Convert configs to a key = value object.
            objects = (_.isArray(objects) ? _.indexBy(objects, 'name') : objects);

            // Backup encryption configs
            this._backupEncryption(objects);

            // return;
            _.forEach(objects, function(object) {
                promises.push(
                    new Q(self.saveObject(object, useDefault, {profile: useDefault.profileId}))
                );
            }, this);

            return Q.all(promises)
            .then(function() {
                Radio.trigger('configs', 'changed', objects);
            });
        },

        /**
         * Saves an object to the database.
         * @type object
         * @type object Backbone model
         */
        saveObject: function(object, useDefault, options) {
            var self = this;

            return this.getModel(_.extend({}, options || {}, {name: object.name}))
            .then(function(model) {
                if (!model) {
                    return;
                }

                if (object.name === 'useDefaultConfigs') {
                    model = useDefault;
                }

                return self.saveModel(model, object);
            });
        },

        /**
         * Return the value of a specific config
         */
        getConfig: function(name, defaultValue) {
            var config = this.getObject()[name];
            return !_.isUndefined(config) ? config : defaultValue;
        },

        /**
         * Return configs as key=value
         */
        getObject: function() {
            return this.collection.getConfigs();
        },

        /**
         * Find a model by ID.
         * @type object options
         */
        getModel: function(options) {
            var getFunc = _.bind(ModuleObject.prototype.getModel, this),
                self    = this;

            options     = (typeof options === 'string' ? {name: options} : options);

            return getFunc(options)
            .then(function(model) {
                if (model) {
                    return model;
                }

                // If a model doesn't exist, return default values
                var collection  = new (self.changeDatabase(options))();
                return collection.getDefault(options.name);
            });
        },

        /**
         * Return all configs.
         * @type object options
         */
        getAll: function(options) {
            if (this.collection && this.collection.length) {
                return new Q(this.collection);
            }

            var self = this,
                profile = options.profile || this.defaultDB,
                getFunc = _.bind(ModuleObject.prototype.getAll, this);

            /**
             * Before fetching configs collection, find out whether
             * we should use configs from the default profile.
             */
            return this.useDefaultConfigs(options.profile)
            .then(function(profile) {
                options.profile = profile;
                return getFunc(options);
            })
            .then(function() {
                return self._checkBackup(profile);
            })
            .then(function() {
                return self._createDefault(options);
            })
            .fail(function(e) {
                console.error('Error:', e);
            });
        },

        /**
         * Return null if configs from the default profile should be used.
         *
         * @type string profile
         */
        useDefaultConfigs: function(profile) {
            return this.getModel({name: 'useDefaultConfigs', profile: profile})
            .then(function(model) {
                return (!model || Number(model.get('value')) ? null : profile);
            });
        },

        /**
         * Returns profiles which use configs from default profile or
         * if current profile doesn't use configs from default profile,
         * returns only current profile.
         */
        getProfiles: function() {
            var current = this.collection.profileId,
                backup  = this.collection.get('encryptBackup');

            // If it is not the default profile, return only current profile
            if (current !== this.defaultDB || backup.profileId !== this.defaultDB) {
                return new Q([backup.profileId]);
            }

            /*
             * If it is the default profile, return all profiles which
             * use configs from default profile.
             */
            return this.getModel({name: 'appProfiles'})
            .then(_.bind(this._getDefaultProfiles, this));
        },

        /**
         * Return profiles which use configs from default profile.
         * @type object Backbone model
         */
        _getDefaultProfiles: function(model) {
            var profiles = model.getValueJSON(),
                self     = this,
                promises = [];

            // Fetch `useDefaultConfigs` model of every profile
            _.each(profiles, function(profile) {
                promises.push(
                    self.getModel({
                        name    : 'useDefaultConfigs',
                        profile : profile
                    })
                );
            });

            return Q.all(promises)
            .then(function(profiles) {
                profiles = _.filter(profiles, function(profile) {
                    return (
                        Number(profile.get('value')) === 1 ||
                        profile.profileId === self.defaultDB
                    );
                });

                return _.pluck(profiles, 'profileId');
            });
        },

        /**
         * Check encryption backup
         */
        _checkBackup: function(profile) {
            var self = this;

            return this.getModel({name: 'encryptBackup'})
            .then(function(backup) {
                /**
                 * If it is the default profile or default backup is not empty,
                 * do nothing.
                 */
                if (profile === self.defaultDB ||
                   (!backup || !_.isEmpty(backup.get('value')))) {
                    return;
                }

                // Fetch current profile's encryption backup configs
                return self.getModel({
                    name    : 'encryptBackup',
                    profile : profile
                })
                .then(function(model) {
                    // If profile's backup is not empty, change backup model
                    if (!_.isEmpty(model.get('value'))) {
                        backup.set(model.toJSON());
                        backup.changeDB(profile);
                    }
                    return model;
                });
            });
        },

        /**
         * If collection is empty, create configs with default values.
         * @type object options
         */
        _createDefault: function(options) {
            if (!this.collection.hasNewConfigs()) {
                return new Q(this.collection);
            }

            var self = this;

            // Trigger an event if the collection is empty
            if (this.collection.length === 0) {
                this.vent.trigger('collection:empty');
            }

            // If the collection is empty, create default set of configs.
            return new Q(this.collection.migrateFromLocal())
            .then(_.bind(this.collection.createDefault, this.collection))
            .then(function() {
                var func = _.bind(ModuleObject.prototype.getAll, self);
                self.collection.trigger('reset:all');
                return func(options);
            })
            .thenResolve(self.collection);
        },

        /**
         * Check whether there are any changes in encryption configs.
         */
        _getEncryption: function(collection) {

            // Don't create a backup if encryption is not used in both new and old configs
            if ((!collection.encrypt || !Number(collection.encrypt.value)) &&
                !Number(this.getConfig('encrypt'))) {

                return [];
            }

            // Disable encryption if password is empty in both configs
            if ((!collection.encryptPass || !collection.encryptPass.value.length) &&
                !this.getConfig('encryptPass').length) {

                collection.encrypt = {value : '0', name: 'encrypt'};
                return [];
            }

            return _.filter(collection, function(value) {

                // Compare values
                if (typeof value === 'object') {
                    return (
                        _.indexOf(this.encryptionKeys, value.name) > -1 &&
                        this.getConfig(value.name) !== value.value &&
                        this._checkPassChanged(value)
                    );
                }

                return (_.indexOf(this.encryptionKeys, value) > -1);
            }, this);
        },

        _checkPassChanged: function(object) {
            if (object.name !== 'encryptPass') {
                return true;
            }

            var pass = this.getConfig('encryptPass');
            pass     = pass ? pass.toString() : pass;

            // Password salt was saved
            if (pass === object.value) {
                return false;
            }

            // Additional check to make sure it's not the same password
            var salt = sjcl.hash.sha256.hash(object.value);
            return (salt.toString() !== pass);
        },

        /**
         * Backup current encryption configs to current profile.
         */
        _backupEncrypt: function(profile) {
            var encrypt = _.pluck(this.collection.filter(function(model) {
                    return (_.indexOf(this.encryptionKeys, model.get('name')) > -1);
                }, this), 'id'),
                model   = this.collection.get('encryptBackup');

            model.changeDB(profile);
            return new Q(this.saveModel(model, {
                value: _.pick(this.collection.getConfigs(), encrypt)
            }));
        },

        /**
         * Backup encryption configs if there are any changes in them.
         */
        _backupEncryption: function(objects) {
            var changed = _.pluck(this._getEncryption(objects), 'name');

            /*
             * Don't create encryption backup if:
             * Encryption configs have not changed
             * or
             * there is already a backup.
             */
            if (_.isEmpty(changed) ||
                _.keys(this.getConfig('encryptBackup')).length) {
                return;
            }

            // Backup configs that are changed
            var configs = this.getObject();
            changed     = _.pick(configs, changed);

            // Password hasn't changed
            if (objects.encryptPass &&
                configs.encryptPass.toString() === objects.encryptPass.value.toString()) {
                delete changed.encryptPass;
            }

            if (!_.keys(changed).length) {
                return;
            }

            /**
             * Extend old backup from new.
             * That way we ensure that only the oldest configs will be saved.
             */
            objects.encryptBackup = {
                name  : 'encryptBackup',
                value : _.extend({}, changed, configs.encryptBackup)
            };

            return objects;
        },

    });

    /**
     * Initialize it automaticaly because everything depends on configs
     * collection and it should be available as soon as possible.
     */
    return new Collection();
});
