import localforage from 'localforage';
import _ from 'underscore';
import uuid from 'uuid';

import WorkerModule from '../workers/Module';

/**
 * LocalForage Adapter.
 *
 * @class
 * @license MPL-2.0
 * @extends WorkerModule
 */
class Db extends WorkerModule {

    get fileName() {
        return 'models/Db';
    }

    constructor() {
        super();

        // Store database instances in this property
        this.dbs = {};
    }

    /**
     * Return a localforage instance. Create one if it doesn't exist.
     *
     * @param {Object} options
     * @param {String} options.profile - database name
     * @param {String} options.storeName - storage name {notes|tags|notebooks}
     * @returns {Object} localforage instance
     */
    getDb(options) {
        const {profile, storeName} = options;
        const id = `${profile}/${storeName}`;

        this.dbs[id] = this.dbs[id] || localforage.createInstance({
            storeName,
            name: profile,
        });

        return this.dbs[id];
    }

    /**
     * Find an item by id.
     *
     * @param {Object} options
     * @param {String} options.profile - used for setting database name
     * @param {String} options.storeName - notes, tags, notebooks, etc
     * @param {String} options.id - ID of an item.
     * @returns {Promise}
     */
    findItem(options) {
        return this.getDb(options).getItem(options.id);
    }

    /**
     * Find several items.
     *
     * @param {Object} options
     * @param {String} options.profile - used for setting database name
     * @param {String} options.storeName - notes, tags, notebooks, etc
     * @param {Object} [options.conditions] - conditions which should be met.
     * It will filter items by those conditions.
     * @returns {Promise}
     */
    find(options) {
        const {conditions} = options;
        const models       = [];

        return this.getDb(options).iterate(value => {
            if (value && (!conditions || _.isMatch(value, conditions))) {
                models.push(value);
            }
        })
        .then(() => models);
    }

    /**
     * Save an item.
     *
     * @param {Object} options
     * @param {String} options.profile - used for setting database name
     * @param {String} options.storeName - notes, tags, notebooks, etc
     * @param {String} options.id - id of an item
     * @param {Object} options.data - data that should be saved
     * @returns {Promise}
     */
    save(options) {
        const {data}      = options;
        const idAttribute = options.idAttribute || 'id';

        // Generate a new ID if it wasn't provided
        data[idAttribute] = (data[idAttribute] || options.id) || uuid.v1();

        return this.getDb(options).setItem(data[idAttribute], data)
        .then(() => data);
    }

}

export default Db;
