/**
 * @module collections/Edits
 */
import DiffCollection from './DiffCollection';
import Edit from '../models/Edit';

/**
 * Edits collection.
 *
 * @class
 * @extends module:collections/DiffCollection
 * @license MPL-2.0
 */
export default class Edits extends DiffCollection {

    /**
     * Edit model.
     *
     * @see module:models/Edit
     * @prop {Object}
     */
    get model() {
        return Edit;
    }

}
