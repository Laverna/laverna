/**
 * @module collections/Notes
 */
import _ from 'underscore';
import Fuse from 'fuse.js';
import Pageable from './Pageable';
import Note from '../models/Note';

/**
 * Notes collection.
 *
 * @class
 * @extends module:collections/Pageable
 * @license MPL-2.0
 */
export default class Notes extends Pageable {

    get model() {
        return Note;
    }

    /**
     * Conditions by which notes can be filtered.
     *
     * @returns {Object}
     */
    get conditions() {
        return {
            active   : {trash      : 0},
            favorite : {isFavorite : 1, trash : 0},
            trashed  : {trash      : 1},
            notebook : options => {
                return {notebookId: options.query, trash: 0};
            },
        };
    }

    /**
     * Fields by which models will be sorted.
     *
     * @returns {Object}
     */
    get comparators() {
        const {sortField, sortDirection} = this.options;
        return {
            [sortField || 'created'] : (sortDirection || 'desc'),
            isFavorite               : 'desc',
        };
    }

    constructor(...args) {
        super(...args);

        // Change the number of models shown per page
        this.pagination.perPage = this.options.perPage || 10;
    }

    /**
     * Find notes that have unfinished tasks.
     *
     * @returns {Array}
     */
    taskFilter() {
        return this.filter(model => {
            return model.get('taskCompleted') < model.get('taskAll');
        });
    }

    /**
     * Find models associated with a tag.
     *
     * @param {String} tagName - the name of a tag
     * @returns {Array}
     */
    tagFilter(tagName) {
        return this.filter(model => {
            return (
                _.indexOf(model.get('tags', []), tagName) !== -1 &&
                model.get('trash') === 0
            );
        });
    }

    /**
     * Find all models that contain `text`.
     *
     * @param {String} text
     * @returns {Array}
     */
    searchFilter(text) {
        if (!text || text === '') {
            return this;
        }

        const pattern = new RegExp(text, 'gim');

        return this.filter(model => {
            pattern.lastIndex = 0;
            return pattern.test(model.get('title')) || pattern.test(model.get('content'));
        });
    }

    /**
     * Find all models that contain `text` in their title.
     * The difference between this and searchFilter is in using
     * fuzzy search algorithm.
     *
     * @param {String} text
     * @returns {Array}
     */
    fuzzySearch(text) {
        const fuse = new Fuse(this.fullCollection.models, {
            keys  : ['title'],
            getFn : (obj, path) => obj.get(path),
        });

        return fuse.search(text);
    }

}
