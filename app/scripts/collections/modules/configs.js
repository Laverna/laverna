/* global define */
define([
    'jquery',
    'q',
    'underscore',
    'backbone.radio',
    'collections/modules/module',
    'collections/configs'
], function($, Q, _, Radio, ModuleObject, Configs) {
    'use strict';

    /**
     * Configs collection.
     *
     * Triggers events on channel `configs`:
     * 1. event: `collection:empty` - if the collection is empty.
     * 2. event: `removed:profile`  - when some profile is removed.
     * 3. event: `changed`          - after configs are changed
     *
     * Replies on channel `configs` to:
     * 1. request: `get:config`     - returns a config.
     * 2. request: `get:object`     - returns configs in key=value format.
     * 3. request: `get:all`        - fetches every model from the storage
     *                            and returns them.
     * 4. request: `get:model`      - returns a model.
     * 5. request: `get:profiles`   - returns list of profiles
     * 6. request: `reset:encrypt`  - resets encryption configs backup.
     *                                Returns promise.
     *
     * Complies on channel `configs` to:
     * 1. command: `save`           - saves changes to a model
     * 2. command: `save:objects`   - save several configs at once
     * 3. command: `create:profile` - create a new profile
     * 3. command: `remove:profile` - remove a profile
     */
    var Collection = ModuleObject.extend({
        Collection: Configs,

        comply: function() {
            return {
                'save'           : this.saveModel,
                'save:objects'   : this.saveObjects,
                'create:profile' : this.createProfile,
                'remove:profile' : this.removeProfile
            };
        },

        reply: function() {
            return {
                'get:config'     : this.getConfig,
                'get:object'     : this.getObject,
                'get:all'        : this.getConfigs,
                'get:model'      : this.getById,
                'get:profiles'   : this.getProfiles,
                'reset:encrypt'  : this.resetEncrypt
            };
        },

        /**
         * Reset encryptBackup
         */
        resetEncrypt: function() {
            var model = this.collection.get('encryptBackup');
            return this.saveModel(model, {value: {}});
        },

        /**
         * Create a new profile
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

        saveModel: function(model, data) {
            if (model.isPassword(data)) {
                data.value = Radio.request('encrypt', 'sha256', data.value);
            }
            return this.save(model, data);
        },

        /**
         * Update several configs at once
         */
        saveObjects: function(objects, useDefault) {
            var promises = [],
                self  = this;

            // Backup current encryption configs
            if (objects.useDefaultConfigs) {
                promises.push(
                    this._backupEncrypt(useDefault.database.id)
                );
            }

            // Backup encryption configs
            this._backupEncryption(objects);

            // return;
            _.forEach(objects, function(object) {
                promises.push(
                    new Q(self._saveObject(object, useDefault))
                );
            }, this);

            return Q.all(promises)
            .then(function() {
                Radio.trigger('configs', 'changed', objects);
            });
        },

        /**
         * Return the value of a specific config
         */
        getConfig: function(name) {
            return this.getObject()[name];
        },

        /**
         * Return configs as key=value
         */
        getObject: function() {
            return this.collection.getConfigs();
        },

        /**
         * Find a model by ID
         */
        getById: function(options) {
            var collection = new Configs();

            options = (typeof options === 'string' ? {name: options} : options);
            collection.changeDB(options.profile || 'notes-db');

            return new Q(collection.fetch({conditions: {name: options.name}}))
            .then(function() {
                if (!collection.length) {
                    collection = collection.getDefault(options.name);
                }
                else {
                    collection = collection.get(options.name);
                }

                collection.changeDB(options.profile || 'notes-db');
                return collection;
            });
        },

        /**
         * Fetch everything.
         */
        getConfigs: function(options) {
            var profile = options.profile || this.defaultDB,
                self    = this;

            if (this.collection) {
                return new Q(this.collection);
            }

            /**
             * Before fetching configs collection, find out whether
             * we should use configs from the default profile.
             */
            return this.getById({name: 'useDefaultConfigs', profile: options.profile})
            .then(function(model) {
                // Use default profile
                if (!model || Number(model.get('value'))) {
                    delete options.profile;
                }
                return self.getAll(options);
            })
            .then(function() {
                return self._checkBackup(profile);
            })
            .then(function() {
                return self._createDefault(options);
            });
        },

        /**
         * Returns profiles which use configs from default profile or
         * if current profile doesn't use configs from default profile,
         * returns only current profile.
         */
        getProfiles: function() {
            var current = this.collection.database.id,
                backup  = this.collection.get('encryptBackup');

            // If it is not the default profile, return only current profile
            if (current !== this.defaultDB || backup.database.id !== this.defaultDB) {
                return new Q([backup.database]);
            }

            _.bindAll(this, '_getDefaultProfiles');

            /*
             * If it is the default profile, return all profiles which
             * use configs from default profile.
             */
            return this.getById({name: 'appProfiles'})
            .then(this._getDefaultProfiles);
        },

        /**
         * Return profiles which use configs from default profile.
         */
        _getDefaultProfiles: function(model) {
            var profiles = model.getValueJSON(),
                self     = this,
                promises = [];

            // Fetch `useDefaultConfigs` model of every profile
            _.each(profiles, function(profile) {
                promises.push(
                    self.getById({
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
                        profile.database.id === self.defaultDB
                    );
                });
                return _.pluck(profiles, 'database');
            });
        },

        _saveObject: function(object, useDefault) {
            var model = this.collection.get(object.name);

            if (!model) {
                return;
            }

            if (object.name === 'useDefaultConfigs') {
                model = useDefault;
            }

            return this.saveModel(model, object);
        },

        /**
         * Check encryption backup
         */
        _checkBackup: function(profile) {
            var backup = this.collection.get('encryptBackup');

            /**
             * If it is the default profile or default backup is not empty,
             * do nothing.
             */
            if (profile === this.defaultDB ||
               (!backup || !_.isEmpty(backup.get('value')))) {
                return;
            }

            // Fetch current profile's encryption backup configs
            return this.getById({
                name    : 'encryptBackup',
                profile : profile
            })
            .then(function(model) {
                // If profile's backup is not empty, change backup model
                if (!_.isEmpty(model.get('value'))) {
                    backup.set(model.toJSON());
                    backup.changeDB(profile);
                }
            });
        },

        /**
         * If collection is empty, create configs with default values.
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
            _.bindAll(this.collection, 'createDefault');

            return new Q(this.collection.migrateFromLocal())
            .then(this.collection.createDefault)
            .then(function() {
                self.collection.trigger('reset:all');
                return self.getAll(options);
            })
            .then(function() {
                return self.collection;
            });
        },

        /**
         * Check whether there are any changes in encryption configs.
         */
        _getEncryption: function(collection) {
            var encrSet = [
                'encrypt'    , 'encryptPass', 'encryptSalt'  ,
                'encryptIter', 'encryptTag' , 'encryptKeySize'
            ];
            return _.filter(collection, function(value, key) {
                return (
                    _.indexOf(encrSet, key) > -1 ||
                    _.indexOf(encrSet, value) > -1
                );
            });
        },

        /**
         * Backup current encryption configs to current profile.
         */
        _backupEncrypt: function(profile) {
            var encrypt = this._getEncryption(this.collection.pluck('name')),
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

            // Encryption configs have not changed
            if (_.isEmpty(changed)) {
                return;
            }

            // Backup configs that are changed
            var configs = this.getObject();
            changed     = _.pick(configs, changed);

            // Password hasn't changed
            if (configs.encryptPass.toString() === objects.encryptPass.value.toString()) {
                delete changed.encryptPass;
            }

            /**
             * Extend old backup from new.
             * That way we ensure that only the oldest configs will be saved.
             */
            objects.encryptBackup = {
                name  : 'encryptBackup',
                value : _.extend({}, changed, configs.encryptBackup)
            };
        }

    });

    /**
     * Initialize it automaticaly because everything depends on configs
     * collection.
     */
    return new Collection();
});
