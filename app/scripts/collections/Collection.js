/**
 * @module collections/Collection
 */
import Backbone from 'backbone';
import Radio from 'backbone.radio';
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
        return this._profileId || 'notes-db';
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
        const name = _.capitalize(this.storeName);
        return Radio.channel(`collections/${name}`);
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

}
