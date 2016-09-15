import _ from 'underscore';
import Model from './Model';

/**
 * Config model.
 *
 * @class
 * @extends Model
 * @license MPL-2.0
 */
class Config extends Model {

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

    /**
     * Validate the model.
     *
     * @param {Object} attributes
     * @returns {(Array|)} - return array of validation errors
     */
    validate(attributes) {
        const errors = [];

        if (attributes.name === '') {
            errors.push('name');
        }

        if (errors.length > 0) {
            return errors;
        }
    }

    /**
     * Return true if it's password model.
     *
     * @param {Object} data
     * @param {String} data.name
     * @returns {Boolean}
     */
    isPassword(data) {
        return this.get('name') === 'encryptsPass' || data.name === 'encryptPass';
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

export default Config;
