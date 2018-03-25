/**
 * @module collections/Collection
 */
import Backbone from 'backbone';
// import Radio from 'backbone.radio';
import _ from 'underscore';
import Sync from '../models/Sync';

/**
 * Core collection.
 *
 * @class
 * @extends Backbone.Collection
 * @license MPL-2.0
 */
export default class Collection extends Backbone.Collection {

    /**
     * Override Backbone.sync.
     *
     * @returns {Function}
     */
    get sync() {
        return Sync.use();
    }

    /**
     * Profile ID.
     *
     * @returns {String}
     */
    get profileId() {
        return this._profileId;
    }

    /**
     * Change profile ID
     *
     * @param {String} name
     */
    set profileId(name) {
        this.model.prototype._profileId = name;
        this._profileId = name;
    }

    /**
     * Store name. Get it from a model associated with the collection.
     *
     * @returns {String}
     */
    get storeName() {
        return this.model.prototype.storeName;
    }

    /**
     * Radio channel.
     *
     * @returns {Object}
     */
    get channel() {
        return this.model.prototype.channel;
    }

    /**
     * @param {Array} models
     * @param {Object} options = {}
     * @param {String} (options.sortField) - field by which notebooks will be sorted
     * @param {String} (options.sortDirection) - (asc|desc)
     * @param {String} (options.profileId) - profile ID
     */
    constructor(models, options = {}) {
        super(models, options);

        this.options   = options;
        this.profileId = options.profileId;
    }

    /**
     * Filter models. If a filter cannot be described with
     * simple code in `this.conditions`, then a new method
     * should be created. The method should follow the naming convention
     * `nameFilter`. For example, taskFilter, tagFilter...
     *
     * @param {Object} options = {}
     * @param {Object} [options.conditions]
     * @param {String} [options.filter]
     * @returns {Object} this
     */
    filterList(options = {}) {
        const cond = this.getCondition(options);

        if (cond) {
            this.reset(this.where(cond));
        }
        else if (this[`${options.filter}Filter`]) {
            const models = this[`${options.filter}Filter`](options.query);
            this.reset(models);
        }

        return this;
    }

    /**
     * Return filter conditions.
     *
     * @param {Object} options
     * @returns {Object}
     */
    getCondition(options) {
        const cond = options.conditions || this.conditions[options.filter];
        this.conditionFilter  = options.filter;
        this.currentCondition = _.isFunction(cond) ? cond(options) : cond;
        return this.currentCondition;
    }

    /**
     * Find a model by ID or create a new one.
     *
     * @param {String} id
     * @param {Object} data={}
     * @returns {Object}
     */
    findOrCreate(id, data = {}) {
        const model = this.get(id) || new this.model(_.extend({id}, data));
        this.add(model);
        return model;
    }

}
