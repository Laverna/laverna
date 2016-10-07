/**
 * @module models/Config
 */
import _ from 'underscore';
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

    /**
     * Return true if it's password model.
     *
     * @param {Object} data
     * @param {String} data.name
     * @returns {Boolean}
     */
    isPassword(data) {
        return this.get('name') === 'encryptPass' || data.name === 'encryptPass';
    }

    /**
     * Return true if the password isn't hashed.
     *
     * @param {Object} data
     * @param {String} data.name
     * @param {String} data.value
     * @returns {Boolean}
     */
    isPasswordHash(data) {
        return (
            this.isPassword(data) &&
            !_.isArray(data.value) && data.value !== this.get('value').toString()
        );
    }

}
