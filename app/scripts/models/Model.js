import {Model as BModel} from 'backbone';
import Sync from './Sync';

/**
 * Core model.
 *
 * @class
 * @extends BModel Backbone model
 * @license MPL-2.0
 */
class Model extends BModel {

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
        this._profileId = name;
    }

}

export default Model;
