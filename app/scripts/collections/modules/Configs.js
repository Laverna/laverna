/**
 * @module collections/modules/Configs
 */
import _ from 'underscore';
import Radio from 'backbone.radio';
import Module from './Module';
import Collection from '../Configs';

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

    constructor() {
        super();

        this.channel.reply({
            findConfig          : this.findConfig,
            findConfigs         : this.findConfigs,
            saveConfig          : this.saveConfig,
            saveConfigs         : this.saveConfigs,
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
     * 1. Create the default configs if necessary
     *
     * @param {Object} options
     * @param {String} options.profileId
     * @returns {Promise}
     */
    async find(options) {
        // Use the cached collection
        if (this.collection && this.collection.length) {
            return this.collection;
        }

        await super.find(options);
        return this.checkOrCreate();
    }

    saveModel(options) {
        // Do nothing if it isn't encryption setting change
        if (options.model.get('name') !== 'encrypt' || options.noBackup) {
            return super.saveModel(options);
        }

        return Promise.all([
            super.saveModel(options),
            this.backupEncrypt(options),
        ]);
    }

    /**
     * Backup encryption setting (to be able to decrypt/encrypt after restart).
     *
     * @param {Object} {data} - new values
     * @returns {Promise}
     */
    backupEncrypt({model}) {
        const changed = model.changedAttributes();
        if (!changed || _.isUndefined(changed.value)) {
            return Promise.resolve();
        }

        const backup = this.collection.get('encryptBackup');
        const value  = {encrypt: Number(changed.value) ? 0 : 1};
        return this.saveModel({model: backup, data: {value}});
    }

    /**
     * If the collection is empty or there are new available configs, create and
     * save them to database.
     *
     * @returns {Promise} resolves with collection
     */
    async checkOrCreate() {
        if (!this.collection.hasNewConfigs()) {
            return this.collection;
        }

        // The collection is empty. Probably the first start
        if (this.collection.length === 0) {
            this.channel.trigger('collection:empty');
        }

        // Create default configs
        await this.collection.createDefault();
        return super.find({profileId: this.collection.profileId});
    }

    /**
     * Return the value of a specific config.
     *
     * @param {Object} options
     * @param {String} options.name - the name of a config
     * @param {String} [options.default] - return this if the config does not exist
     */
    findConfig(options) {
        if (!this.collection) {
            return null;
        }

        const model = this.collection.get(options.name);
        return !model ? options.default : model.get('value');
    }

    /**
     * Return all configs as key=>value object.
     *
     * @returns {Object}
     */
    findConfigs() {
        return this.collection ? this.collection.getConfigs() : null;
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
     * @returns {Promise}
     */
    async saveConfig(options) {
        const {config} = options;

        const model = await this.findModel(_.extend({}, options, {name: config.name}));
        if (!model) {
            return;
        }

        const opt = _.extend({}, options, {model, data: config});
        return this.saveModel(opt);
    }

    /**
     * Save several config objects.
     *
     * @param {Object} options
     * @param {Array} options.configs - an array of config objects
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
     * Generate the device ID.
     *
     * @returns {Promise}
     */
    async createDeviceId() {
        const rand = await Radio.request('models/Encryption', 'random', {number: 6});
        return this.saveConfig({config: {name: 'deviceId', value: rand}});
    }

    /**
     * Add a new peer to the array of peers or update the date when
     * they connected the last time.
     *
     * @param {String} username
     * @param {String} deviceId
     * @returns {Promise}
     */
    async updatePeer({username, deviceId}) {
        if (!username || !deviceId) {
            return;
        }

        const model = await this.findModel({name: 'peers'});
        const value = model.get('value');
        const peer  = _.findWhere(value, {username, deviceId});

        if (peer) {
            peer.lastSeen = Date.now();
        }
        else {
            value.push({username, deviceId, lastSeen: Date.now()});
        }

        return this.saveModel({model, data: {value}});
    }

}
