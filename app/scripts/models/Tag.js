/**
 * @module models/Tag
 */
import Model from './Model';

/**
 * Tag model.
 *
 * @class
 * @extends module:models/Model
 * @license MPL-2.0
 */
export default class Tag extends Model {

    get storeName() {
        return 'tags';
    }

    /**
     * Default values.
     *
     * @property {String} type - type of data stored in this model
     * @property {(String|Undefined)} id - undefined for default
     * @property {String} encryptedData
     * @property {String} name - the name of a tag
     * @property {Number} count - the number of notes attached to a tag
     * @property {Number} trash
     * @property {Date.now()} created
     * @property {Date.now()} updated
     * @returns {Object}
     */
    get defaults() {
        return {
            type          : 'tags',
            id            : undefined,
            encryptedData : '',
            name          : '',
            count         : 0,
            trash         : 0,
            created       : 0,
            updated       : 0,
        };
    }

    /**
     * Attributes that need to be encrypted.
     *
     * @returns {Array}
     */
    get encryptKeys() {
        return ['name'];
    }

    get validateAttributes() {
        return ['name'];
    }

    get escapeAttributes() {
        return ['name'];
    }

}
