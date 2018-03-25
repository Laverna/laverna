/**
 * @module collections/Files
 */
import File from '../models/File';
import Collection from './Collection';

/**
 * File collection.
 *
 * @class
 * @extends module:collections/Collection
 * @license MPL-2.0
 */
export default class Files extends Collection {

    /**
     * File model.
     *
     * @returns {Object}
     */
    get model() {
        return File;
    }

}
