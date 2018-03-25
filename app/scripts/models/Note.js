/**
 * @module models/Note
 */
import Model from './Model';

/**
 * Note model.
 *
 * @class
 * @extends module:models/Model
 * @license MPL-2.0
 */
export default class Note extends Model {

    get storeName() {
        return 'notes';
    }

    /**
     * Default values.
     *
     * @property {String} type - equal to notes
     * @property {(String|Undefined)} id - undefined for default
     * @property {String} encryptedData
     * @property {String} title
     * @property {String} content
     * @property {Number} taskAll - the number of tasks in a note
     * @property {Number} taskCompleted - the number of completed tasks
     * @property {Date.now()} created
     * @property {Date.now()} updated
     * @property {String} notebookId - ID of a notebook
     * @property {Array} tags - an array of tag names
     * @property {Number} isFavorite - equal to 1 if the note is favorite
     * @property {Number} trash
     * @property {Array} files - array of file IDs
     * @property {Array} sharedWith - an array of users with whome the note
     * is shared
     * @property {String} sharedBy - the author of the note
     * @returns {Object}
     */
    get defaults() {
        return {
            type          : 'notes',
            id            : undefined,
            encryptedData : '',
            title         : '',
            content       : '',
            taskAll       : 0,
            taskCompleted : 0,
            created       : 0,
            updated       : 0,
            notebookId    : '0',
            tags          : [],
            isFavorite    : 0,
            trash         : 0,
            files         : [],
            sharedWith    : [],
            sharedBy      : '',
        };
    }

    /**
     * Attributes which need to be encrypted.
     *
     * @returns {Array}
     */
    get encryptKeys() {
        return [
            'title',
            'content',
            'tags',
            'tasks',
        ];
    }

    get validateAttributes() {
        return ['title'];
    }

    get escapeAttributes() {
        return ['title', 'content', 'sharedBy'];
    }

    /**
     * Toggle favorite status.
     *
     * @returns {Object} this
     */
    toggleFavorite() {
        const isFavorite = (this.get('isFavorite') === 1) ? 0 : 1;
        this.set('isFavorite', isFavorite);
        return this;
    }

}
