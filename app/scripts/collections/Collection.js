import Backbone from 'backbone';
import Sync from '../models/Sync';

/**
 * Core collection.
 *
 * @class
 * @extends Backbone.Collection
 * @license MPL-2.0
 */
class Collection extends Backbone.Collection {

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

}

export default Collection;
