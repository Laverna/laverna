/**
 * @module models/Edit
 */
import Model from './Model';
import _ from 'underscore';

/**
 * Edit model. Used in @see module:models/Diffsync
 * It stores diffs of documents.
 *
 * @class
 * @extends module:models/Model
 * @license MPL-2.0
 */
export default class Edit extends Model {

    get storeName() {
        return 'edits';
    }

    /**
     * Default values.
     *
     * @prop {String} id
     * @prop {String} username
     * @prop {String} deviceId
     * @prop {String} docType - notes, notebooks, tags, etc...
     * @prop {String} docId - ID of a note, notebook, tag...
     * @prop {String} encryptedData
     * @prop {Array}  diffs
     * @prop {Number} p - another peer's version
     * @returns {Object}
     */
    get defaults() {
        return {
            id            : undefined,
            username      : '',
            deviceId      : '',
            docType       : '',
            docId         : '',
            encryptedData : '',
            diffs         : [],
            p             : 0,
        };
    }

    get encryptKeys() {
        return [
            'diffs',
        ];
    }

    get validateAttributes() {
        return ['docId', 'docType'];
    }

    /**
     * Add a new edit.
     *
     * @param {Object} shadow
     * @param {Object} diff
     */
    addDiff({shadow, diff}) {
        this.set('p', shadow.attributes.p);
        this.attributes.diffs.push({
            diff,
            m: shadow.attributes.m,
            p: shadow.attributes.p,
        });
    }

    /**
     * Clear the edit stack.
     *
     * @param {Object} shadow
     * @param {Boolean} clearAll - true if all diffs should be cleared
     */
    clearDiffs({shadow, clearAll}) {
        let diffs = [];

        if (!clearAll) {
            diffs = _.filter(this.get('diffs'), diff => {
                return diff.m >= shadow.get('m');
            });
        }

        this.set({diffs, p: shadow.get('p')});
    }

}
