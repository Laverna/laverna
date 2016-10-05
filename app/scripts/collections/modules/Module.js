/**
 * @module collections/modules/Module
 */
import _ from 'underscore';
import Radio from 'backbone.radio';

/**
 * Core collection module. The main purpose of this class is to
 * make it easier to fetch/save models or collections without writing
 * boilerplate code in every controller. It also allows to do these operations
 * with Radio requests.
 *
 * @class
 * @license MPL-2.0
 * @listens channel#findModel - find a model by its ID
 * @listens channel#find - fetch models from the database
 * @listens channel#saveModel - save a model
 * @listens channel#save - save a collection to the database
 * @listens channel#saveModelObject - create a model from
 * a key=>value object and save it
 * @listens channel#saveFromArray - create models from an array
 * of objects and save them
 * @listens channel#remove - remove a model from the database
 */
export default class Module {

    /**
     * Backbone collection.
     *
     * @returns {Object}
     */
    get Collection() {
        return null;
    }

    /**
     * Backbone model.
     *
     * @returns {Object}
     */
    get Model() {
        return this.Collection.prototype.model;
    }

    /**
     * ID attribute used in a collection model.
     *
     * @returns {String}
     */
    get idAttribute() {
        return this.Model.prototype.idAttribute;
    }

    /**
     * Radio channel. collections/${Name}
     *
     * @returns {Object}
     */
    get channel() {
        return this.Collection.prototype.channel;
    }

    constructor() {
        this.channel.reply({
            findModel       : this.findModel,
            find            : this.find,
            saveModel       : this.saveModel,
            save            : this.save,
            saveModelObject : this.saveModelObject,
            saveFromArray   : this.saveFromArray,
            remove          : this.remove,
        }, this);
    }

    /**
     * Find a model by its ID.
     *
     * @param {Object} options = {}
     * @param {String} options.id - id of a model
     * @param {String} (options.profileId) - profile ID
     * @returns {Promise}
     */
    findModel(options = {}) {
        // If id was not provided, return a model with default values
        if (!options[this.idAttribute]) {
            return Promise.resolve(new this.Model(null, {profileId: options.profileId}));
        }

        // The model exists in the collection
        if (this.collection && this.collection.profileId === options.profileId &&
            this.collection.get(options[this.idAttribute])) {
            return Promise.resolve(
                this.collection.get(options[this.idAttribute])
            );
        }

        // Instantiate a new model
        const model = new this.Model({
            [this.idAttribute] : options[this.idAttribute],
        }, {profileId: options.profileId});

        // Fetch and decrypt the model
        return model.fetch()
        .then(() => this.decryptModel(model));
    }

    /**
     * Find all models.
     *
     * @param {Object} options = {}
     * @param {String} (options.conditions) - conditions by which models
     * will be filtered
     * @param {String} (options.profileId) - profile id
     * @returns {Promise}
     */
    find(options = {}) {
        // Stop listening to events
        if (this.collection) {
            this.collection.removeEvents();
        }

        const opt       = options;
        this.collection = new this.Collection(null, {profileId: options.profileId});

        // Filter conditions
        if (opt.filter) {
            const cond = this.collection.conditions[opt.filter];
            opt.conditions = _.isFunction(cond) ? cond(opt) : cond;
        }

        // Save current filter condition
        this.collection.conditionFilter  = opt.filter;
        this.collection.currentCondition = opt.conditions;

        // Fetch and decrypt the model
        return this.collection.fetch(opt)
        .then(() => this.decryptCollection(this.collection));
    }

    /**
     * Save a model.
     *
     * @param {Object} options
     * @param {Object} options.model - Backbone model
     * @param {Object} (options.data) - data that should be updated
     * (uses model.attributes if it's not provided)
     * @fires channel#update:model - after saving a model
     * @returns {Promise} - resolves with a model
     */
    saveModel(options) {
        const {model} = options;
        const data    = options.data || model.attributes;
        const errors  = model.validate(data);

        // Trigger invalid event if there are any validation errors
        if (errors) {
            model.trigger('invalid', {errors});
            return Promise.reject('Validation error');
        }

        model.setEscape(data);

        // Encrypt the model and save
        return this.encryptModel(model)
        .then(() => model.save(model.attributes, {validate: false}))
        .then(() => this.channel.trigger('update:model', {model}));
    }

    /**
     * Save all changes made in a collection.
     *
     * @param {Object} options = {}
     * @param {Object} options.collection - Backbone collection
     * @fires channel#save:collection - after saving a model
     * @returns {Promise}
     */
    save(options = {}) {
        const collection = options.collection || this.collection;
        const promises   = [];
        collection.each(model => promises.push(this.saveModel({model})));

        return Promise.all(promises)
        .then(() => this.channel.trigger('save:collection', {collection}));
    }

    /**
     * Create a model from a key=>value object and save it.
     *
     * @param {Object} options
     * @param {Object} options.data - an object with a model's values
     * @param {String} options.profileId - profile name
     * @returns {Promise}
     */
    saveModelObject(options) {
        const model = new this.Model(options.data, {profileId: options.profileId});

        return this.decryptModel(model)
        .then(() => this.saveModel({model}));
    }

    /**
     * Create models from an array of objects and save them.
     *
     * @param {Object} options
     * @param {Array} options.values - an array with key=>value objects
     * @param {String} options.profileId
     * @returns {Promise}
     */
    saveFromArray(options) {
        const promises = [];

        _.each(options.values, item => {
            const data = _.extend({data: item}, options);
            promises.push(this.saveModelObject(data));
        });

        return Promise.all(promises);
    }

    /**
     * Remove a model from database.
     *
     * @param {Object} options
     * @param {Object} (options.model) - Backbone.model
     * @param {Object} (options.id) - ID of a model
     * @fires channel#destroy:model
     * @returns {Promise}
     */
    remove(options) {
        let {model} = options;

        if (!model) {
            model = new this.Model({id: options.id}, {profileId: options.profileId});
        }

        const data = {trash: 2};
        return this.saveModel({model, data})
        .then(() => this.channel.trigger('destroy:model', {model}));
    }

    /**
     * Check if a model can be encrypted and encryption is enabled.
     *
     * @param {Object} model = this.Model.prototype - Backbone model
     * @returns {Boolean}
     */
    isEncryptEnabled(model = this.Model.prototype) {
        // The model doesn't have label names that should be encrypted
        if (_.isUndefined(model.encryptKeys)) {
            return false;
        }

        const configs = Radio.request('collections/Configs', 'getValues');
        const backup  = {encrypt: configs.encryptBackup.encrypt || 0};

        // Encryption is enabled either in the current configs or backup
        return Number(configs.encrypt) === 1 || Number(backup.encrypt) === 1;
    }

    /**
     * Decrypt a model.
     *
     * @param {Object} model - Backbone model
     * @fires encrypt#decryptModel
     * @returns {Promise} resolves with a decrypted model
     */
    decryptModel(model) {
        if (!this.isEncryptEnabled(model)) {
            return Promise.resolve(model);
        }

        return Radio.request('encrypt', 'decryptModel', {model});
    }

    /**
     * Decrypt a collection.
     *
     * @param {Object} coll = this.collection - Backbone collection
     * @fires encrypt#decryptCollection
     * @returns {Promise} resolves with a decrypted collection
     */
    decryptCollection(coll = this.collection) {
        if (!this.isEncryptEnabled()) {
            return Promise.resolve(coll);
        }

        const collection = coll.fullCollection || coll;
        return Radio.request('encrypt', 'decryptCollection', {collection});
    }

    /**
     * Encrypt a model.
     *
     * @param {Object} model - Backbone model
     * @fires encrypt#encryptModel
     * @returns {Promise} resolves with an encrypted model
     */
    encryptModel(model) {
        if (!this.isEncryptEnabled(model)) {
            return Promise.resolve(model);
        }

        return Radio.request('encrypt', 'encryptModel', {model});
    }

}
