/**
 * @module collections/modules/Shadows
 */
import Module from './Module';
import Collection from '../Shadows';

/**
 * Shadows collection module.
 *
 * @class
 * @extends module:collections/modules/Module
 * @license MPL-2.0
 */
export default class Shadows extends Module {

    /**
     * Shadow collection.
     *
     * @see module:collections/Shadows
     * @returns {Object}
     */
    get Collection() {
        return Collection;
    }

    constructor() {
        super();

        this.channel.reply({
        }, this);
    }

}
