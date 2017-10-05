/**
 * @module collections/modules/Configs
 */
import _ from 'underscore';
import Radio from 'backbone.radio';
import Module from './Module';
import Collection from '../Configs';
import {configNames} from '../configNames';

/**
 * Configs collection module
 *
 * @class
 * @extends module:collections/modules/Module
 * @license MPL-2.0
 */
export default class Configs extends Module {

    /**
     * Configs collection.
     *
     * @see module:collections/Configs
     * @returns {Object}
     */
    get Collection() {
        return Collection;
    }

    /**
     * Config names used for storing encryption configs.
     *
     * @returns {Array}
     */
    get encryptKeys() {
        return _.keys(configNames.encryption);
    }

    constructor() {
        super();

        this.channel.reply({
            findConfig          : this.findConfig,
            findConfigs         : this.findConfigs,
            saveConfig          : this.saveConfig,
            saveConfigs         : this.saveConfigs,
            findProfileModel    : this.findProfileModel,
            findDefaultProfiles : this.findDefaultProfiles,
            createProfile       : this.createProfile,
            removeProfile       : this.removeProfile,
            changePassphrase    : this.changePassphrase,
            createDeviceId      : this.createDeviceId,
            updatePeer          : this.updatePeer,
        }, this);
    }

    /**
     * Find a config model by its name.
     *
     * @param {Object} options
     * @param {String} options.name
     * @param {String} options.profileId
     * @returns {Promise}
     */
    findModel(options) {
        return super.findModel(options)
        .catch(err => {
            // Return the default values
            if (err === 'not found') {
                const collection = new this.Collection(null, options);
                return collection.getDefault(options.name);
            }

            return Promise.reject(err);
        });
    }

    /**
     * Find all configs. It overrides the default method to:
     * 1. Use the default profile's configs if neccessary
     * 2. Create the default configs if necessary
     *
     * @param {Object} options
     * @param {String} options.profileId
     * @returns {Promise}
     */
    find(options) {
        // Use the cached collection
        if (this.collection && this.collection.length) {
            return Promise.resolve(this.collection);
        }

        return this.getProfileId(options)
        .then(profileId => _.extend({}, options, {profileId}))
        .then(opt => super.find(opt))
        .then(() => this.checkOrCreate());
    }

    /**
     * Find out what profileId this profile uses to store configs.
     *
     * @param {Object} options
     * @param {String} options.profileId
     * @returns {Promise} resolves with profileId
     */
    getProfileId(options) {
        const {profileId} = options;

        return this.findModel({profileId, name: 'useDefaultConfigs'})
        .then(model => {
            return !model || Number(model.get('value')) ? 'default' : profileId;
        });
    }

    /**
     * If the collection is empty or there are new available configs, create and
     * save them to database.
     *
     * @returns {Promise} resolves with collection
     */
    checkOrCreate() {
        if (!this.collection.hasNewConfigs()) {
            return Promise.resolve(this.collection);
        }

        // The collection is empty. Probably the first start
        if (this.collection.length === 0) {
            this.channel.trigger('collection:empty');
        }

        // Create default configs
        return this.collection.createDefault()
        .then(() => super.find({profileId: this.collection.profileId}));
    }

    /**
     * Return the value of a specific config.
     *
     * @param {Object} options
     * @param {String} options.name - the name of a config
     * @param {String} [options.default] - return this if the config does not exist
     */
    findConfig(options) {
        const model = this.collection.get(options.name);
        return !model ? options.default : model.get('value');
    }

    /**
     * Return all configs as key=>value object.
     *
     * @returns {Object}
     */
    findConfigs() {
        return this.collection.getConfigs();
    }

    saveFromArray(options) {
        // Generate a new deviceId for each new device
        const values = _.filter(options.values, val => {
            return val.name !== 'deviceId';
        });

        return super.saveFromArray({values, profileId: options.profileId});
    }

    /**
     * Save config object to the database.
     *
     * @param {Object} options
     * @param {Object} options.config - config object with name and value
     * @param {String} options.profileId
     * @param {Object} (options.useDefault) - useDefault config model
     * @returns {Promise}
     */
    saveConfig(options) {
        const {config} = options;

        if (config.name === 'useDefaultConfigs') {
            return this.saveModel({model: options.useDefault, data: config});
        }

        return this.findModel(_.extend({}, options, {name: config.name}))
        .then(model => {
            if (!model) {
                return;
            }

            return this.saveModel({model, data: config});
        });
    }

    /**
     * Save several config objects.
     *
     * @param {Object} options
     * @param {Array} options.configs - an array of config objects
     * @param {Object} options.useDefault - model
     * @param {String} options.profileId
     * @returns {Promise}
     */
    saveConfigs(options) {
        const promises = [];
        let {configs}  = options;

        // Convert the array to a key=>value object
        configs = _.isArray(configs) ? _.indexBy(configs, 'name') : configs;

        // Save each config
        _.each(configs, config => {
            promises.push(this.saveConfig(_.extend({config}, options)));
        });

        return Promise.all(promises);
    }

    /**
     * Find all available profiles.
     *
     * @returns {Promise} resolves with appProfiles model
     */
    findProfileModel() {
        return this.findModel({name: 'appProfiles', profileId: 'default'});
    }

    /**
     * Find all profiles that use the default profile's configs.
     *
     * @returns {Promise} resolves with an array of profiles
     */
    findDefaultProfiles() {
        return this.findProfileModel()
        .then(model => this.findProfileUseDefaults(model.get('value')))
        .then(useDefaults => {
            const profiles = _.filter(useDefaults, profile => {
                return (
                    Number(profile.get('value')) === 1 ||
                    profile.profileId === 'default'
                );
            });

            return _.pluck(profiles, 'profileId');
        });
    }

    /**
     * Fetch useDefaultConfigs model from each available profile.
     *
     * @param {Array} profiles - an array of profiles
     * @returns {Promise} resolves with an array of useDefaultConfigs models.
     */
    findProfileUseDefaults(profiles) {
        const promises = [];

        _.each(profiles, profileId => {
            promises.push(this.findModel({profileId, name: 'useDefaultConfigs'}));
        });

        return Promise.all(promises);
    }

    /**
     * Create a new profile.
     *
     * @param {Object} options
     * @param {String} options.name - profile name
     * @returns {Promise}
     */
    createProfile(options) {
        return this.findProfileModel()
        .then(model => {
            const value = model.get('value');

            if (!_.contains(value, options.name)) {
                value.push(options.name);
                return this.saveModel({model, data: {value}});
            }
        });
    }

    /**
     * Remove a profile.
     *
     * @todo clear localforage database
     * @param {Object} options
     * @param {String} options.name - profile name
     * @returns {Promise}
     */
    removeProfile(options) {
        return this.findProfileModel()
        .then(model => {
            let value = model.get('value');

            if (_.contains(value, options.name)) {
                value = _.without(value, options.name);
                return this.saveModel({model, data: {value}});
            }
        });
    }

    /**
     * Change the private key's passphrase.
     *
     * @param {Object} options
     * @param {Object} options.model - "privateKey" model
     * @param {String} options.oldPassphrase
     * @param {String} options.newPassphrase
     * @returns {Promise}
     */
    changePassphrase(options) {
        if (options.oldPassphrase === options.newPassphrase) {
            return Promise.reject('New and old passphrase are the same');
        }
        else if (!options.oldPassphrase.length || !options.newPassphrase.length) {
            return Promise.reject('You did not provide old or new passphrase');
        }

        const {model} = options;
        return Radio.request('models/Encryption', 'changePassphrase', options)
        .then(value => this.saveModel({model, data: {value}}));
    }

    /**
     * Generate the device ID.
     *
     * @returns {Promise}
     */
    createDeviceId() {
        return Radio.request('models/Encryption', 'random', {number: 6})
        .then(rand => {
            return this.saveConfig({config: {name: 'deviceId', value: rand}});
        });
    }

    /**
     * Add a new peer to the array of peers or update the date when
     * they connected the last time.
     *
     * @param {String} username
     * @param {String} deviceId
     * @returns {Promise}
     */
    updatePeer({username, deviceId}) {
        if (!username || !deviceId) {
            return Promise.resolve();
        }

        return this.findModel({name: 'peers'})
        .then(model => {
            const value = model.get('value');
            const peer  = _.findWhere(value, {username, deviceId});

            if (peer) {
                peer.lastSeen = Date.now();
            }
            else {
                value.push({username, deviceId, lastSeen: Date.now()});
            }

            return this.saveModel({model, data: {value}});
        });
    }

}
