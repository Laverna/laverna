/**
 * @module collections/Tags
 */
import Pageable from './Pageable';
import Tag from '../models/Tag';

/**
 * Tags collection.
 *
 * @class
 * @extends module:collections/Pageable
 * @license MPL-2.0
 */
export default class Tags extends Pageable {

    get model() {
        return Tag;
    }

    /**
     * Fields by which models will be sorted.
     *
     * @returns {Object}
     */
    get comparators() {
        return {
            created: 'desc',
        };
    }

    /**
     * Filter conditions.
     *
     * @returns {Object}
     */
    get conditions() {
        return {
            active: {trash: 0},
        };
    }

    constructor(...args) {
        super(...args);

        // Change the number of tags shown per page
        this.pagination.perPage = this.options.perPage || 20;
    }

    /**
     * Get models for a page number.
     * It uses infinite pagination.
     *
     * @param {Number} page - page number
     * @returns {Array} models
     */
    getPage(page) {
        const end = this.pagination.perPage * (page || 1);

        // Save the current page number
        this.pagination.current = page;

        // Slice the models
        return this.fullCollection.models.slice(0, end);
    }

    /**
     * This collection is never going to have a previous page
     * because it uses inifinite pagination.
     *
     * @returns {Boolean} always false
     */
    hasPreviousPage() {
        return false;
    }

}
