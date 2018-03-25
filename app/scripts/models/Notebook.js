/**
 * @module models/Notebook
 */
import Model from './Model';

/**
 * Notebook model.
 *
 * @class
 * @extends module:models/Model
 * @license MPL-2.0
 */
export default class Notebook extends Model {

    get storeName() {
        return 'notebooks';
    }

    /**
     * Default values.
     *
     * @property {String} type - type of data stored in this model
     * @property {(String|undefined)} id - undefined for default
     * @property {String} encryptedData
     * @property {String} parentId
     * @property {String} name - the name of a notebook
     * @property {Number} count - the number of notes attached to the notebook
     * @property {Number} trash - trash status:
     * 0 - it's not in trash, 1 - it's in trash, 2 - it was removed completely
     * @property {Date.now()} created - date when it's created
     * @property {Date.now()} updated - date when it's updated
     * @returns {Object}
     */
    get defaults() {
        return {
            type          : 'notebooks',
            id            : undefined,
            encryptedData : '',
            parentId      : '0',
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

    /**
     * Validate a notebook.
     *
     * @param {Object} attrs
     * @returns {(Array|Undefined)}
     */
    validate(attrs) {
        const errors = super.validate(attrs) || [];

        // It cannot have itself as a parent
        if (attrs.parentId === this.id) {
            errors.push('parentId');
        }

        if (errors.length) {
            return errors;
        }
    }

}
