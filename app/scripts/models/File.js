/**
 * @module models/File
 */
import Model from './Model';

/**
 * File model.
 *
 * @class
 * @extends module:models/Model
 * @license MPL-2.0
 */
export default class File extends Model {

    /**
     * Store name.
     *
     * @returns {String}
     */
    get storeName() {
        return 'files';
    }

    /**
     * Default values.
     *
     * @property {String} type - type of data stored in this model
     * @property {(String|Undefined)} id - undefined for default
     * @property {String} name - name of the stored file
     * @property {String} src - file data (blob?)
     * @property {String} fileType - (jpg|png|pdf|...)
     * @property {Number} trash - 1 if the model is in trash
     * @property {Date.now()} created - the date when the model was created
     * @property {Date.now()} update - the date when the model was updated
     * the last time
     */
    get defaults() {
        return {
            type         : 'files',
            id           : undefined,
            name         : '',
            src          : '',
            fileType     : '',
            trash        : 0,
            created      : 0,
            updated      : 0,
        };
    }

    get validateAttributes() {
        return ['src', 'fileType'];
    }

    get escapeAttributes() {
        return ['name'];
    }

    /**
     * @todo implement a proper check
     */
    isSharedWith() {
        return true;
    }

}
