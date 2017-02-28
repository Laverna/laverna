/**
 * @module collections/Shadows
 */
import DiffCollection from './DiffCollection';
import Shadow from '../models/Shadow';

/**
 * Shadows collection.
 *
 * @class
 * @extends module:collections/DiffCollection
 * @license MPL-2.0
 */
export default class Shadows extends DiffCollection {

    get model() {
        return Shadow;
    }

    findOrCreate(...args) {
        const model = super.findOrCreate(...args);

        // Create a backup if it's a completely new model
        if (!model.id && !model.get('m')) {
            model.createBackup();
        }

        return model;
    }

}
