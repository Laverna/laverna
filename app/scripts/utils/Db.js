import localforage from 'localforage';
import _ from 'underscore';

/**
 * LocalForage Adapter.
 *
 * @class
 * @license MPL-2.0
 */
class Db {

    constructor() {
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
        const {data} = options;
        data.id      = data.id || options.id;
        return this.getDb(options).setItem(options.id, data);
    }

}

export default Db;
