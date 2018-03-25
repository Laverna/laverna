/**
 * @module models/Config
 */
import Model from './Model';

/**
 * Config model.
 *
 * @class
 * @extends module:models/Model
 * @license MPL-2.0
 */
export default class Config extends Model {

    /**
     * Use name as ID.
     *
     * @returns {String}
     */
    get idAttribute() {
        return 'name';
    }

    /**
     * Default values.
     *
     * @returns {Object}
     */
    get defaults() {
        return {
            name  : '',
            value : '',
        };
    }

    /**
     * Store name.
     *
     * @returns {String}
     */
    get storeName() {
        return 'configs';
    }

    get validateAttributes() {
        return ['name'];
    }

}
