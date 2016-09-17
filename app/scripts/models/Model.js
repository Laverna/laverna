import {Model as BModel} from 'backbone';
import Sync from './Sync';
import _ from 'underscore';

/**
 * Core model.
 *
 * @class
 * @extends BModel Backbone model
 * @license MPL-2.0
 */
class Model extends BModel {

    /**
     * Override Backbone.sync.
     *
     * @returns {Function}
     */
    get sync() {
        return Sync.use();
    }

    /**
     * Profile ID.
     *
     * @returns {String}
     */
    get profileId() {
        return this._profileId || 'notes-db';
    }

    /**
     * Change profile ID
     *
     * @param {String} name
     */
    set profileId(name) {
        this._profileId = name;
    }

    /**
     * It should contain an array of attribute names that should not be empty.
     *
     * @returns {Array}
     */
    get validateAttributes() {
        return [];
    }

    /**
     * It should contain an array of attribute names that should be filtered from XSS.
     *
     * @returns {Array}
     */
    get escapeAttributes() {
        return [];
    }

    /**
     * Validate a model.
     *
     * @param {Object} attrs
     * @returns {(Array|Undefined)} - array of errors if there are any
     */
    validate(attrs) {
        // It's not neccessary to validate when a model is about to be removed
        if (attrs.trash && Number(attrs.trash) === 2) {
            return;
        }

        const errors = [];

        // Validate attributes
        _.each(this.validateAttributes, field => {
            if (!_.isUndefined(attrs[field]) && !attrs[field].trim().length) {
                errors.push(field);
            }
        });

        if (errors.length > 0) {
            return errors;
        }
    }

    /**
     * Set new attributes filtering them from XSS.
     *
     * @param {Object} attrs
     * @returns {Object} this
     */
    setEscape(attrs) {
        const data = attrs;

        // Filter from XSS
        _.each(this.escapeAttributes, attr => {
            if (data[attr]) {
                data[attr] = _.cleanXSS(data[attr], true);
            }
        });

        // Set new attributes
        this.set(data);
        return this;
    }

}

export default Model;
