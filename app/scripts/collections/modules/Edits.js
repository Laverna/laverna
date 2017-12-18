/**
 * @module collections/modules/Edits
 */
import Module from './Module';
import Collection from '../Edits';
// import _ from 'underscore';
// import deb from 'debug';

// const log = deb('lav:collections/modules/Edits');

/**
 * Edits collection module.
 *
 * @class
 * @extends module:collections/modules/Module
 * @license MPL-2.0
 */
export default class Edits extends Module {

    /**
     * Shadow collection.
     *
     * @see module:collections/Edits
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
